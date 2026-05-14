import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const outDir = mkdtempSync(path.join(tmpdir(), "aswb-question-audit-"));
const tsc = path.join(root, "node_modules", ".bin", "tsc");

try {
  execFileSync(
    tsc,
    [
      "src/data/exam.ts",
      "src/data/generatedQuestions.ts",
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
  const { questions, curatedQuestions, domains, examAreasByModel, examModels } =
    requireAuditModule(path.join(outDir, "exam.js"));
  const { generatedQuestions } = requireAuditModule(path.join(outDir, "generatedQuestions.js"));

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
  const byDomain = Object.fromEntries(domains.map((domain) => [domain.id, 0]));
  const byArea2026 = Object.fromEntries(examAreasByModel["2026"].map((area) => [area.id, 0]));
  const byAreaPre2026 = Object.fromEntries(
    examAreasByModel.pre2026.map((area) => [area.id, 0]),
  );
  const bySkill = {};
  const byDifficulty = {};
  const optionCounts = {};

  for (const question of questions) {
    byDomain[question.domain] = (byDomain[question.domain] ?? 0) + 1;
    byArea2026[question.area2026] = (byArea2026[question.area2026] ?? 0) + 1;
    byAreaPre2026[question.area] = (byAreaPre2026[question.area] ?? 0) + 1;
    bySkill[question.skill] = (bySkill[question.skill] ?? 0) + 1;
    byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] ?? 0) + 1;
    optionCounts[question.options.length] = (optionCounts[question.options.length] ?? 0) + 1;

    if (seenIds.has(question.id)) {
      issues.push(`${question.id}: duplicate id with ${seenIds.get(question.id)}`);
    } else {
      seenIds.set(question.id, question.id);
    }

    const normalizedStem = question.stem.toLowerCase().replace(/\s+/g, " ").trim();
    if (seenStems.has(normalizedStem)) {
      issues.push(`${question.id}: duplicate stem with ${seenStems.get(normalizedStem)}`);
    } else {
      seenStems.set(normalizedStem, question.id);
    }

    if (!question.stem?.trim()) issues.push(`${question.id}: blank stem`);
    if (!question.stem.trim().endsWith("?")) {
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

    const uniqueOptions = new Set(question.options.map((option) => option.trim().toLowerCase()));
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

  const report = {
    total: questions.length,
    curated: curatedQuestions.length,
    generated: generatedQuestions.length,
    examModels,
    byDomain,
    byArea2026,
    byAreaPre2026,
    bySkill,
    byDifficulty,
    optionCounts,
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
