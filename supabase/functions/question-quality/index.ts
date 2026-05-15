import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type ExamModel = "2026" | "pre2026";
type QualityMode = "record_attempt" | "submit_feedback" | "summary";
type FeedbackType =
  | "too_easy"
  | "confusing"
  | "answer_wrong"
  | "bad_distractor"
  | "not_realistic"
  | "typo"
  | "other";
type EventSource = "practice" | "simulation";

type QualityRequest = {
  mode?: QualityMode;
  questionId?: string;
  examModel?: ExamModel;
  selectedIndex?: number;
  responseSeconds?: number | null;
  feedbackType?: FeedbackType;
  source?: EventSource;
  note?: string;
};

const allowedFeedbackTypes = new Set<FeedbackType>([
  "too_easy",
  "confusing",
  "answer_wrong",
  "bad_distractor",
  "not_realistic",
  "typo",
  "other",
]);

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
      // Fall back to local origins when SITE_URL is malformed.
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

function normalizeExamModel(value: unknown): ExamModel {
  return value === "pre2026" ? "pre2026" : "2026";
}

function normalizeSource(value: unknown): EventSource {
  return value === "simulation" ? "simulation" : "practice";
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
    return jsonResponse(req, { error: "Question quality tracking is not configured." }, 500);
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
    return jsonResponse(req, { error: "Sign in before submitting quality data." }, 401);
  }

  let body: QualityRequest = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const mode = body.mode || "summary";
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (mode === "summary") {
    const [
      { count: attemptsCount, error: attemptsError },
      { count: feedbackCount, error: feedbackError },
      { count: reviewCount, error: reviewError },
      { data: reviewQueue, error: queueError },
    ] = await Promise.all([
      serviceClient
        .from("question_attempt_events")
        .select("id", { count: "exact", head: true }),
      serviceClient
        .from("question_feedback")
        .select("id", { count: "exact", head: true }),
      serviceClient
        .from("question_quality_summary")
        .select("question_id", { count: "exact", head: true })
        .eq("needs_review", true),
      serviceClient
        .from("question_quality_summary")
        .select(
          "question_id, domain, area, area_2026, attempts, correct_rate, avg_response_seconds, feedback_count, too_easy_count, confusing_count, answer_wrong_count, bad_distractor_count, not_realistic_count, typo_count, needs_review",
        )
        .eq("needs_review", true)
        .order("feedback_count", { ascending: false })
        .order("attempts", { ascending: false })
        .limit(8),
    ]);

    const error = attemptsError || feedbackError || reviewError || queueError;
    if (error) return jsonResponse(req, { error: error.message }, 500);

    return jsonResponse(req, {
      attemptsCount: attemptsCount ?? 0,
      feedbackCount: feedbackCount ?? 0,
      questionsNeedingReview: reviewCount ?? 0,
      reviewQueue: reviewQueue ?? [],
    });
  }

  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  if (!questionId) {
    return jsonResponse(req, { error: "questionId is required." }, 400);
  }

  const examModel = normalizeExamModel(body.examModel);
  const source = normalizeSource(body.source);

  const { data: question, error: questionError } = await serviceClient
    .from("question_bank")
    .select("id, domain, area, area_2026, answer_index")
    .eq("id", questionId)
    .maybeSingle();

  if (questionError) return jsonResponse(req, { error: questionError.message }, 500);
  if (!question) return jsonResponse(req, { error: "Question not found." }, 404);

  const area = examModel === "2026" ? question.area_2026 : question.area;

  if (mode === "record_attempt") {
    const selectedIndex = clampInteger(body.selectedIndex, -1, -1, 3);
    const answerIndex = Number(question.answer_index);
    const responseSeconds = body.responseSeconds === null || body.responseSeconds === undefined
      ? null
      : clampInteger(body.responseSeconds, 0, 0, 60 * 60 * 4);

    if (
      selectedIndex < 0 ||
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex > 3
    ) {
      return jsonResponse(req, { error: "A valid selectedIndex is required." }, 400);
    }

    const { error } = await serviceClient.from("question_attempt_events").insert({
      user_id: user.id,
      question_id: question.id,
      exam_model: examModel,
      domain: question.domain,
      area,
      selected_index: selectedIndex,
      answer_index: answerIndex,
      is_correct: selectedIndex === answerIndex,
      source,
      response_seconds: responseSeconds,
    });

    if (error) return jsonResponse(req, { error: error.message }, 500);
    return jsonResponse(req, { ok: true });
  }

  if (mode === "submit_feedback") {
    const feedbackType = body.feedbackType;
    if (!feedbackType || !allowedFeedbackTypes.has(feedbackType)) {
      return jsonResponse(req, { error: "Valid feedbackType is required." }, 400);
    }

    const note = typeof body.note === "string" && body.note.trim()
      ? body.note.trim().slice(0, 1000)
      : null;

    const { error } = await serviceClient.from("question_feedback").insert({
      user_id: user.id,
      question_id: question.id,
      exam_model: examModel,
      domain: question.domain,
      area,
      feedback_type: feedbackType,
      source,
      note,
    });

    if (error) return jsonResponse(req, { error: error.message }, 500);
    return jsonResponse(req, { ok: true });
  }

  return jsonResponse(req, { error: "Unsupported quality mode." }, 400);
});
