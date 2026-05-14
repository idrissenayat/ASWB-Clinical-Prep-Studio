import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const outDir = mkdtempSync(path.join(tmpdir(), "aswb-question-audit-"));
const tsc = path.join(root, "node_modules", ".bin", "tsc");
const defaultSupabaseUrl = "https://jqoqjkgzfoztwumzylih.supabase.co";

function normalizeQuestion(row) {
  return {
    id: row.id,
    domain: row.domain,
    area: row.area,
    area2026: row.area_2026,
    skill: row.skill,
    difficulty: row.difficulty,
    stem: row.stem,
    options: row.options,
    answerIndex: row.answer_index,
    rationale: row.rationale,
    examLens: row.exam_lens,
    isFreeSample: row.is_free_sample === true,
  };
}

async function fetchAllQuestions(supabaseUrl, serviceRoleKey) {
  const pageSize = 1000;
  const rows = [];
  let from = 0;

  while (true) {
    const url = new URL("/rest/v1/question_bank", supabaseUrl);
    url.searchParams.set(
      "select",
      "id,domain,area,area_2026,skill,difficulty,stem,options,answer_index,rationale,exam_lens,is_free_sample",
    );
    url.searchParams.set("order", "id.asc");

    const response = await fetch(url, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Range: `${from}-${from + pageSize - 1}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase question audit failed: ${response.status} ${await response.text()}`);
    }

    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  return rows.map(normalizeQuestion);
}

function emptyCounts(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function compareCounts(label, actual, expected, issues) {
  for (const [key, expectedCount] of Object.entries(expected)) {
    if ((actual[key] ?? 0) !== expectedCount) {
      issues.push(`${label}.${key}: expected ${expectedCount}, got ${actual[key] ?? 0}`);
    }
  }
}

try {
  execFileSync(
    tsc,
    [
      "src/data/exam.ts",
      "--outDir",
      outDir,
      "--module",
      "commonjs",
      "--target",
      "ES2020",
      "--esModuleInterop",
      "--skipLibCheck",
      "--strict",
      "--noEmit",
      "false",
    ],
    { cwd: root, stdio: "pipe" },
  );

  const requireAuditModule = createRequire(path.join(outDir, "audit.cjs"));
  const {
    domains,
    examAreasByModel,
    examModels,
    freeQuestionCountsByArea,
    questionBankTotal,
    questionCountsByArea,
    questionCountsByDomain,
  } = requireAuditModule(path.join(outDir, "exam.js"));

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || defaultSupabaseUrl;

  if (!serviceRoleKey) {
    console.log(
      JSON.stringify(
        {
          total: questionBankTotal,
          examModels,
          byDomain: questionCountsByDomain,
          byArea2026: questionCountsByArea["2026"],
          byAreaPre2026: questionCountsByArea.pre2026,
          freeByArea2026: freeQuestionCountsByArea["2026"],
          freeByAreaPre2026: freeQuestionCountsByArea.pre2026,
          issueCount: 0,
          issues: [],
          note:
            "Question content is stored in Supabase. Set SUPABASE_SERVICE_ROLE_KEY to audit private question rows.",
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  const questions = await fetchAllQuestions(supabaseUrl, serviceRoleKey);
  const all2026AreaIds = examAreasByModel["2026"].map((area) => area.id);
  const allPre2026AreaIds = examAreasByModel.pre2026.map((area) => area.id);
  const areaIds = new Map(
    Object.entries(examAreasByModel).map(([model, areas]) => [
      model,
      new Set(areas.map((area) => area.id)),
    ]),
  );
  const areaDomains = new Map(
    Object.entries(examAreasByModel).flatMap(([model, areas]) =>
      areas.map((area) => [`${model}:${area.id}`, area.domain]),
    ),
  );

  const issues = [];
  const seenIds = new Map();
  const seenStems = new Map();
  const byDomain = emptyCounts(domains.map((domain) => domain.id));
  const byArea2026 = emptyCounts(all2026AreaIds);
  const byAreaPre2026 = emptyCounts(allPre2026AreaIds);
  const freeByArea2026 = emptyCounts(all2026AreaIds);
  const freeByAreaPre2026 = emptyCounts(allPre2026AreaIds);
  const bySkill = {};
  const byDifficulty = {};
  const optionCounts = {};
  let stemWordTotal = 0;
  let rationaleWordTotal = 0;
  let shortRationales = 0;
  let shortScenarioStems = 0;
  let weakDistractorItems = 0;
  const weakDistractorPattern =
    /\b(ignore|do nothing|never|always|avoid the topic|wait until harm occurs|tell the client what to do)\b/i;

  if (questions.length !== questionBankTotal) {
    issues.push(`total: expected ${questionBankTotal}, got ${questions.length}`);
  }

  for (const question of questions) {
    const stemWords = String(question.stem ?? "").split(/\s+/).filter(Boolean).length;
    const rationaleWords = String(question.rationale ?? "").split(/\s+/).filter(Boolean).length;
    stemWordTotal += stemWords;
    rationaleWordTotal += rationaleWords;
    if (stemWords < 32) shortScenarioStems += 1;
    if (rationaleWords < 45) shortRationales += 1;
    if ((question.options ?? []).some((option) => weakDistractorPattern.test(String(option)))) {
      weakDistractorItems += 1;
    }

    byDomain[question.domain] = (byDomain[question.domain] ?? 0) + 1;
    byArea2026[question.area2026] = (byArea2026[question.area2026] ?? 0) + 1;
    byAreaPre2026[question.area] = (byAreaPre2026[question.area] ?? 0) + 1;
    bySkill[question.skill] = (bySkill[question.skill] ?? 0) + 1;
    byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] ?? 0) + 1;
    optionCounts[question.options?.length] = (optionCounts[question.options?.length] ?? 0) + 1;

    if (question.isFreeSample) {
      freeByArea2026[question.area2026] = (freeByArea2026[question.area2026] ?? 0) + 1;
      freeByAreaPre2026[question.area] = (freeByAreaPre2026[question.area] ?? 0) + 1;
    }

    if (seenIds.has(question.id)) {
      issues.push(`${question.id}: duplicate id with ${seenIds.get(question.id)}`);
    } else {
      seenIds.set(question.id, question.id);
    }

    const normalizedStem = String(question.stem ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    if (seenStems.has(normalizedStem)) {
      issues.push(`${question.id}: duplicate stem with ${seenStems.get(normalizedStem)}`);
    } else {
      seenStems.set(normalizedStem, question.id);
    }

    if (!question.stem?.trim()) issues.push(`${question.id}: blank stem`);
    if (!question.stem?.trim().endsWith("?")) {
      issues.push(`${question.id}: stem does not end with ?`);
    }
    if (!question.rationale?.trim()) issues.push(`${question.id}: blank rationale`);
    if (!question.examLens?.trim()) issues.push(`${question.id}: blank exam lens`);
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 4) {
      issues.push(`${question.id}: expected 3 or 4 options, got ${question.options?.length}`);
    }
    if (
      !Number.isInteger(question.answerIndex) ||
      question.answerIndex < 0 ||
      question.answerIndex >= question.options.length
    ) {
      issues.push(`${question.id}: answerIndex out of range`);
    }

    const uniqueOptions = new Set(
      (question.options ?? []).map((option) => String(option).trim().toLowerCase()),
    );
    if (uniqueOptions.size !== question.options.length) {
      issues.push(`${question.id}: duplicate option text`);
    }
    if (!areaIds.get("2026").has(question.area2026)) {
      issues.push(`${question.id}: invalid 2026 area ${question.area2026}`);
    }
    if (!areaIds.get("pre2026").has(question.area)) {
      issues.push(`${question.id}: invalid pre-2026 area ${question.area}`);
    }
    if (areaDomains.get(`2026:${question.area2026}`) !== question.domain) {
      issues.push(`${question.id}: 2026 area/domain mismatch ${question.area2026}/${question.domain}`);
    }
    if (areaDomains.get(`pre2026:${question.area}`) !== question.domain) {
      issues.push(`${question.id}: pre-2026 area/domain mismatch ${question.area}/${question.domain}`);
    }
  }

  compareCounts("byDomain", byDomain, questionCountsByDomain, issues);
  compareCounts("byArea2026", byArea2026, questionCountsByArea["2026"], issues);
  compareCounts("byAreaPre2026", byAreaPre2026, questionCountsByArea.pre2026, issues);
  compareCounts("freeByArea2026", freeByArea2026, freeQuestionCountsByArea["2026"], issues);
  compareCounts("freeByAreaPre2026", freeByAreaPre2026, freeQuestionCountsByArea.pre2026, issues);

  const quality = {
    avgStemWords: Math.round(stemWordTotal / Math.max(1, questions.length)),
    avgRationaleWords: Math.round(rationaleWordTotal / Math.max(1, questions.length)),
    shortScenarioStems,
    shortRationales,
    weakDistractorItems,
  };

  if (quality.avgStemWords < 35) {
    issues.push(`quality.avgStemWords: expected at least 35, got ${quality.avgStemWords}`);
  }
  if (quality.avgRationaleWords < 45) {
    issues.push(`quality.avgRationaleWords: expected at least 45, got ${quality.avgRationaleWords}`);
  }
  if (shortRationales > 0) {
    issues.push(`quality.shortRationales: expected 0, got ${shortRationales}`);
  }
  if ((byDifficulty.foundation ?? 0) > Math.round(questionBankTotal * 0.1)) {
    issues.push(`quality.foundation: expected <= 10%, got ${byDifficulty.foundation ?? 0}`);
  }
  if ((bySkill.recall ?? 0) > Math.round(questionBankTotal * 0.15)) {
    issues.push(`quality.recall: expected <= 15%, got ${bySkill.recall ?? 0}`);
  }

  const report = {
    total: questions.length,
    examModels,
    byDomain,
    byArea2026,
    byAreaPre2026,
    freeByArea2026,
    freeByAreaPre2026,
    bySkill,
    byDifficulty,
    optionCounts,
    quality,
    issueCount: issues.length,
    issues,
  };

  console.log(JSON.stringify(report, null, 2));

  if (issues.length > 0) {
    process.exitCode = 1;
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
