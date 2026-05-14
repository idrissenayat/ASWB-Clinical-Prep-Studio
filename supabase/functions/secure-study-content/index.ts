import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type AreaFilter = string | "all";
type DomainFilter = "ethics" | "assessment" | "intervention" | "all";
type ExamModel = "2026" | "pre2026";
type StudyMode = "count" | "practice" | "simulation" | "flashcards";

type StudyRequest = {
  mode?: StudyMode;
  examModel?: ExamModel;
  domainFilter?: DomainFilter;
  areaFilter?: AreaFilter;
  size?: number;
  limit?: number;
};

const freeQuestionLimit = 75;
const maxQuestionBatch = 170;

function allowedOrigins() {
  const siteUrl = Deno.env.get("SITE_URL");
  const origins = new Set([
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://localhost:5174",
  ]);

  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {
      // Ignore malformed config and fall back to localhost origins.
    }
  }

  return origins;
}

function isLocalDevOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname);
  } catch {
    return false;
  }
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = allowedOrigins();
  const fallback = Deno.env.get("SITE_URL") || "http://127.0.0.1:5173";
  const fallbackOrigin = (() => {
    try {
      return new URL(fallback).origin;
    } catch {
      return "http://127.0.0.1:5173";
    }
  })();

  return {
    "Access-Control-Allow-Origin": allowed.has(origin) || isLocalDevOrigin(origin)
      ? origin
      : fallbackOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function parseAccess(value: unknown) {
  const access = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const used = Number(access.freeQuestionsUsed ?? access.free_questions_used ?? 0);
  const limit = Number(access.freeLimit ?? access.free_limit ?? freeQuestionLimit);
  const hasFullAccess = access.hasFullAccess === true || access.has_full_access === true;
  const isExpired = access.isExpired === true || access.is_expired === true;

  return {
    hasFullAccess,
    isExpired,
    freeQuestionsUsed: Number.isFinite(used) ? Math.max(0, used) : 0,
    freeLimit: Number.isFinite(limit) ? Math.max(1, limit) : freeQuestionLimit,
    remaining: hasFullAccess || isExpired
      ? (hasFullAccess ? Number.POSITIVE_INFINITY : 0)
      : Math.max(0, (Number.isFinite(limit) ? limit : freeQuestionLimit) - (Number.isFinite(used) ? used : 0)),
  };
}

function serializeQuestion(row: Record<string, unknown>) {
  return {
    id: row.id,
    domain: row.domain,
    area: row.area,
    area2026: row.area_2026,
    competency: row.competency,
    skill: row.skill,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    stem: row.stem,
    options: row.options ?? [],
    answerIndex: row.answer_index,
    rationale: row.rationale,
    examLens: row.exam_lens,
  };
}

function serializeFlashcard(row: Record<string, unknown>) {
  return {
    id: row.id,
    domain: row.domain,
    front: row.front,
    back: row.back,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(req, { error: "Study content is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse(req, { error: "Sign in before studying.", isLocked: true }, 401);
  }

  let body: StudyRequest = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const mode: StudyMode = body.mode || "practice";
  const examModel: ExamModel = body.examModel === "pre2026" ? "pre2026" : "2026";
  const domainFilter = body.domainFilter || "all";
  const areaFilter = body.areaFilter || "all";
  const size = clampInteger(body.size, 24, 1, maxQuestionBatch);
  const limit = clampInteger(body.limit, 75, 1, maxQuestionBatch);

  const { data: accessData, error: accessError } = await userClient.rpc("get_account_access");
  if (accessError) {
    return jsonResponse(req, { error: accessError.message }, 500);
  }

  const access = parseAccess(accessData);
  const canViewFreeContent = !access.isExpired && access.remaining > 0;
  const canViewQuestionContent = access.hasFullAccess || canViewFreeContent;

  if (mode === "flashcards" && !access.hasFullAccess) {
    return jsonResponse(req, { flashcards: [], isLocked: true, access });
  }

  if (mode !== "flashcards" && !canViewQuestionContent) {
    return jsonResponse(req, {
      questions: [],
      availableCount: 0,
      isLocked: true,
      access,
    });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (mode === "flashcards") {
    let query = serviceClient
      .from("study_flashcards")
      .select("id, domain, front, back");

    if (domainFilter !== "all") query = query.eq("domain", domainFilter);

    const { data, error } = await query.order("id", { ascending: true });
    if (error) return jsonResponse(req, { error: error.message }, 500);

    return jsonResponse(req, {
      flashcards: (data ?? []).map((row) => serializeFlashcard(row as Record<string, unknown>)),
      access,
    });
  }

  let query = serviceClient
    .from("question_bank")
    .select(
      "id, domain, area, area_2026, competency, skill, difficulty, tags, stem, options, answer_index, rationale, exam_lens",
    );

  if (!access.hasFullAccess) query = query.eq("is_free_sample", true);
  if (domainFilter !== "all") query = query.eq("domain", domainFilter);
  if (areaFilter !== "all") {
    query = query.eq(examModel === "2026" ? "area_2026" : "area", areaFilter);
  }

  const { data, error } = await query.limit(3000);
  if (error) return jsonResponse(req, { error: error.message }, 500);

  const rows = data ?? [];
  const availableCount = rows.length;

  if (mode === "count") {
    return jsonResponse(req, { availableCount, access });
  }

  const requestedCount = mode === "simulation" ? size : limit;
  if (mode === "simulation" && !access.hasFullAccess && requestedCount > access.remaining) {
    return jsonResponse(req, {
      questions: [],
      availableCount,
      isLocked: true,
      error: "This simulation is longer than the remaining free sample access.",
      access,
    }, 403);
  }

  const questions = shuffle(rows)
    .slice(0, Math.min(requestedCount, rows.length))
    .map((row) => serializeQuestion(row as Record<string, unknown>));

  return jsonResponse(req, { questions, availableCount, access });
});
