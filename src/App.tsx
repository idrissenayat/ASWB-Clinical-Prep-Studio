import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  ClipboardCheck,
  ExternalLink,
  Flag,
  BookHeart,
  HeartHandshake,
  KeyRound,
  Layers3,
  Lock,
  LogOut,
  Mail,
  Play,
  RotateCcw,
  ShieldCheck,
  Settings,
  Target,
  Timer,
  Trophy,
  UserCircle,
  XCircle,
} from "lucide-react";
import {
  DomainId,
  ExamAreaId,
  ExamModelId,
  Question,
  domains,
  examAreasByModel,
  examFacts,
  examModels,
  flashcards,
  planTasks,
  questions,
} from "./data/exam";
import {
  isAccountAccessRequired,
  isSupabaseConfigured,
  supabase,
} from "./lib/supabase";

type View = "dashboard" | "practice" | "simulation" | "flashcards" | "planner";
type AreaFilter = ExamAreaId | "all";
const defaultExamModel: ExamModelId = "2026";

interface Attempt {
  questionId: string;
  domain: DomainId;
  examModel?: ExamModelId;
  area?: ExamAreaId;
  selectedIndex: number;
  correct: boolean;
  confidence: number;
  timestamp: string;
}

interface ProgressState {
  attempts: Attempt[];
  bookmarks: string[];
  completedTasks: string[];
  targetDate: string;
}

interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  progress: ProgressState;
}

interface ProfileState {
  profiles: UserProfile[];
  activeProfileId: string;
}

interface LearnerProfileRow {
  id: string;
  name: string;
  created_at: string;
  progress: unknown;
}

interface AccessState {
  plan: AccessPlan;
  status: string;
  periodEnd: string | null;
  daysRemaining: number;
  expiresSoon: boolean;
  isExpired: boolean;
  isLoading: boolean;
  error: string;
  hasFullAccess: boolean;
  freeLimit: number;
  used: number;
  remaining: number;
  isCheckoutLoading: boolean;
  checkoutError: string;
  onUpgrade: () => void;
}

type SyncStatus = "local" | "loading" | "synced" | "saving" | "error";
type AuthMode = "sign-in" | "sign-up" | "reset-password";
type AccessPlan = "free" | "paid";

const initialProgress: ProgressState = {
  attempts: [],
  bookmarks: [],
  completedTasks: [],
  targetDate: "2026-08-03",
};

const progressStorageKey = "aswb-clinical-prep-progress-v1";
const profileStorageKey = "aswb-clinical-prep-user-profiles-v1";
const activeProfileStorageKey = "aswb-clinical-prep-active-profile-v1";
const minimumPasswordLength = 8;
const freeQuestionLimit = 75;
const paidAccessDays = 180;
const accessPriceLabel = "$49";

const navItems: Array<{ id: View; label: string; icon: typeof BarChart3 }> = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "practice", label: "Practice", icon: BookOpen },
  { id: "simulation", label: "Simulation", icon: Timer },
  { id: "flashcards", label: "Flashcards", icon: Layers3 },
  { id: "planner", label: "Planner", icon: CalendarDays },
];

const domainMap = new Map(domains.map((domain) => [domain.id, domain]));
const questionMap = new Map(questions.map((question) => [question.id, question]));
const areaKey = (examModel: ExamModelId, areaId: ExamAreaId) => `${examModel}:${areaId}`;
const getQuestionArea = (question: Question, examModel: ExamModelId) =>
  examModel === "2026" ? question.area2026 : question.area;
const examAreaMap = new Map(
  examModels.flatMap((model) =>
    examAreasByModel[model.id].map((area) => [areaKey(model.id, area.id), area] as const),
  ),
);
const examAreaCounts = new Map(
  examModels.flatMap((model) =>
    examAreasByModel[model.id].map((area) => [
      areaKey(model.id, area.id),
      questions.filter((question) => getQuestionArea(question, model.id) === area.id).length,
    ] as const),
  ),
);

const freeSampleQuestions = domains
  .flatMap((domain) =>
    questions.filter((question) => question.domain === domain.id).slice(0, freeQuestionLimit / domains.length),
  )
  .slice(0, freeQuestionLimit);

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeProgress(value: unknown): ProgressState {
  if (!value || typeof value !== "object") return initialProgress;
  const progress = value as Partial<ProgressState>;

  return {
    attempts: Array.isArray(progress.attempts) ? (progress.attempts as Attempt[]) : [],
    bookmarks: Array.isArray(progress.bookmarks) ? progress.bookmarks.filter(Boolean) : [],
    completedTasks: Array.isArray(progress.completedTasks)
      ? progress.completedTasks.filter(Boolean)
      : [],
    targetDate:
      typeof progress.targetDate === "string" && progress.targetDate
        ? progress.targetDate
        : initialProgress.targetDate,
  };
}

function createProfileId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getAuthRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function createUserProfile(name: string, progress: ProgressState = initialProgress): UserProfile {
  return {
    id: createProfileId(),
    name,
    createdAt: new Date().toISOString(),
    progress: normalizeProgress(progress),
  };
}

function loadProfileState(): ProfileState {
  const storedProfiles = window.localStorage.getItem(profileStorageKey);

  if (storedProfiles) {
    try {
      const parsedProfiles = JSON.parse(storedProfiles) as UserProfile[];
      const profiles = parsedProfiles
        .filter((profile) => profile?.id && profile?.name)
        .map((profile) => ({
          id: profile.id,
          name: profile.name,
          createdAt: profile.createdAt || new Date().toISOString(),
          progress: normalizeProgress(profile.progress),
        }));

      if (profiles.length) {
        const storedActiveProfileId = window.localStorage.getItem(activeProfileStorageKey);
        return {
          profiles,
          activeProfileId: profiles.some((profile) => profile.id === storedActiveProfileId)
            ? storedActiveProfileId!
            : profiles[0].id,
        };
      }
    } catch {
      window.localStorage.removeItem(profileStorageKey);
    }
  }

  let migratedProgress = initialProgress;
  const legacyProgress = window.localStorage.getItem(progressStorageKey);
  if (legacyProgress) {
    try {
      migratedProgress = normalizeProgress(JSON.parse(legacyProgress));
    } catch {
      migratedProgress = initialProgress;
    }
  }

  const defaultProfile = createUserProfile("Learner 1", migratedProgress);
  return {
    profiles: [defaultProfile],
    activeProfileId: defaultProfile.id,
  };
}

function profileStateFingerprint(profileState: ProfileState) {
  return JSON.stringify({
    activeProfileId: profileState.activeProfileId,
    profiles: profileState.profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      progress: normalizeProgress(profile.progress),
    })),
  });
}

function profileFromRow(row: LearnerProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    progress: normalizeProgress(row.progress),
  };
}

function ensureProfileStateHasActiveProfile(profiles: UserProfile[]): ProfileState {
  const safeProfiles = profiles.length ? profiles : [createUserProfile("Learner 1")];
  return {
    profiles: safeProfiles,
    activeProfileId: safeProfiles[0].id,
  };
}

function parseAccessResult(value: unknown) {
  if (!value || typeof value !== "object") {
    return {
      plan: "free" as AccessPlan,
      status: "active",
      freeQuestionsUsed: 0,
      freeLimit: freeQuestionLimit,
      currentPeriodEnd: null,
      hasFullAccess: false,
      daysRemaining: 0,
      expiresSoon: false,
      isExpired: false,
    };
  }

  const result = value as {
    plan?: unknown;
    status?: unknown;
    freeQuestionsUsed?: unknown;
    free_questions_used?: unknown;
    freeLimit?: unknown;
    free_limit?: unknown;
    currentPeriodEnd?: unknown;
    current_period_end?: unknown;
    hasFullAccess?: unknown;
    has_full_access?: unknown;
    daysRemaining?: unknown;
    days_remaining?: unknown;
    expiresSoon?: unknown;
    expires_soon?: unknown;
    isExpired?: unknown;
    is_expired?: unknown;
  };
  const plan: AccessPlan = result.plan === "paid" ? "paid" : "free";
  const freeQuestionsUsed = Number(result.freeQuestionsUsed ?? result.free_questions_used);
  const parsedFreeLimit = Number(result.freeLimit ?? result.free_limit);
  const daysRemaining = Number(result.daysRemaining ?? result.days_remaining);
  const hasFullAccess = (result.hasFullAccess ?? result.has_full_access) === true;
  const currentPeriodEnd = result.currentPeriodEnd ?? result.current_period_end;

  return {
    plan,
    status: typeof result.status === "string" ? result.status : "active",
    freeQuestionsUsed: Number.isFinite(freeQuestionsUsed)
      ? Math.min(freeQuestionLimit, Math.max(0, freeQuestionsUsed))
      : 0,
    freeLimit: Number.isFinite(parsedFreeLimit)
      ? Math.max(0, parsedFreeLimit)
      : freeQuestionLimit,
    currentPeriodEnd: typeof currentPeriodEnd === "string" ? currentPeriodEnd : null,
    hasFullAccess,
    daysRemaining: Number.isFinite(daysRemaining) ? Math.max(0, daysRemaining) : 0,
    expiresSoon: (result.expiresSoon ?? result.expires_soon) === true,
    isExpired: (result.isExpired ?? result.is_expired) === true || (plan === "paid" && !hasFullAccess),
  };
}

function parseFreeQuestionConsumption(value: unknown) {
  if (!value || typeof value !== "object") {
    return { allowed: false, freeQuestionsUsed: freeQuestionLimit };
  }

  const result = value as {
    allowed?: unknown;
    hasFullAccess?: unknown;
    has_full_access?: unknown;
    status?: unknown;
    currentPeriodEnd?: unknown;
    current_period_end?: unknown;
    freeQuestionsUsed?: unknown;
    free_questions_used?: unknown;
  };
  const freeQuestionsUsed = Number(result.freeQuestionsUsed ?? result.free_questions_used);
  const currentPeriodEnd = result.currentPeriodEnd ?? result.current_period_end;

  return {
    allowed: result.allowed === true,
    hasFullAccess: (result.hasFullAccess ?? result.has_full_access) === true,
    status: typeof result.status === "string" ? result.status : "",
    currentPeriodEnd: typeof currentPeriodEnd === "string" ? currentPeriodEnd : null,
    freeQuestionsUsed: Number.isFinite(freeQuestionsUsed)
      ? Math.min(freeQuestionLimit, Math.max(0, freeQuestionsUsed))
      : freeQuestionLimit,
  };
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

function formatAccessDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCountdown(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getDaysUntil(dateValue: string) {
  if (!dateValue) return null;
  const target = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function buildStats(progress: ProgressState) {
  const totalAttempts = progress.attempts.length;
  const correctAttempts = progress.attempts.filter((attempt) => attempt.correct).length;
  const overallAccuracy = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const uniqueAnswered = new Set(progress.attempts.map((attempt) => attempt.questionId)).size;
  const coverage = Math.round((uniqueAnswered / questions.length) * 100);

  const domainStats = domains.map((domain) => {
    const domainQuestions = questions.filter((question) => question.domain === domain.id);
    const attempts = progress.attempts.filter((attempt) => attempt.domain === domain.id);
    const correct = attempts.filter((attempt) => attempt.correct).length;
    const unique = new Set(attempts.map((attempt) => attempt.questionId)).size;
    const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
    const domainCoverage = Math.round((unique / domainQuestions.length) * 100);
    const readiness = Math.round(accuracy * 0.7 + domainCoverage * 0.3);

    return {
      domain,
      attempts: attempts.length,
      correct,
      accuracy,
      coverage: domainCoverage,
      readiness,
    };
  });

  const readiness = Math.round(
    domainStats.reduce((sum, item) => sum + item.readiness * (item.domain.percent / 100), 0),
  );

  const recentMisses = [...progress.attempts]
    .reverse()
    .filter((attempt) => !attempt.correct)
    .slice(0, 5)
    .map((attempt) => questions.find((question) => question.id === attempt.questionId))
    .filter(Boolean) as Question[];

  return {
    totalAttempts,
    correctAttempts,
    overallAccuracy,
    uniqueAnswered,
    coverage,
    domainStats,
    readiness,
    recentMisses,
  };
}

function buildAreaStats(progress: ProgressState, examModel: ExamModelId) {
  return examAreasByModel[examModel].map((area) => {
    const domain = domainMap.get(area.domain)!;
    const areaQuestions = questions.filter((question) => getQuestionArea(question, examModel) === area.id);
    const attempts = progress.attempts.filter((attempt) => {
      const question = questionMap.get(attempt.questionId);
      if (!question) return attempt.examModel === examModel && attempt.area === area.id;
      return getQuestionArea(question, examModel) === area.id;
    });
    const correct = attempts.filter((attempt) => attempt.correct).length;
    const unique = new Set(
      attempts
        .map((attempt) => questionMap.get(attempt.questionId))
        .filter((question): question is Question => Boolean(question))
        .filter((question) => getQuestionArea(question, examModel) === area.id)
        .map((question) => question.id),
    ).size;
    const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
    const coverage = areaQuestions.length ? Math.round((unique / areaQuestions.length) * 100) : 0;
    const readiness = Math.round(accuracy * 0.7 + coverage * 0.3);

    return {
      area,
      domain,
      questionCount: areaQuestions.length,
      attempts: attempts.length,
      correct,
      unique,
      accuracy,
      coverage,
      readiness,
    };
  });
}

function balanceQuotas<T extends { count: number }>(quotas: T[], size: number) {
  while (quotas.reduce((sum, item) => sum + item.count, 0) > size) {
    const largest = quotas.reduce((best, item) => (item.count > best.count ? item : best), quotas[0]);
    largest.count -= 1;
  }

  while (quotas.reduce((sum, item) => sum + item.count, 0) < size) {
    const smallest = quotas.reduce((best, item) => (item.count < best.count ? item : best), quotas[0]);
    smallest.count += 1;
  }

  return quotas;
}

function makeSimulation(
  size: number,
  areaFilter: AreaFilter = "all",
  examModel: ExamModelId = defaultExamModel,
  questionPool: Question[] = questions,
) {
  if (areaFilter !== "all") {
    return shuffle(
      questionPool.filter((question) => getQuestionArea(question, examModel) === areaFilter),
    ).slice(0, size);
  }

  if (examModel === "pre2026") {
    const legacyQuotas = balanceQuotas(
      [
        { areaIds: ["IA", "IB", "IC"] as ExamAreaId[], percent: 24, count: Math.max(1, Math.round(size * 0.24)) },
        { areaIds: ["IIA", "IIB", "IIC"] as ExamAreaId[], percent: 30, count: Math.max(1, Math.round(size * 0.3)) },
        { areaIds: ["IIIA", "IIIB", "IIIC", "IIID"] as ExamAreaId[], percent: 27, count: Math.max(1, Math.round(size * 0.27)) },
        { areaIds: ["IVA", "IVB", "IVC"] as ExamAreaId[], percent: 19, count: Math.max(1, Math.round(size * 0.19)) },
      ],
      size,
    );

    return shuffle(
      legacyQuotas.flatMap(({ areaIds, count }) =>
        shuffle(questionPool.filter((question) => areaIds.includes(question.area))).slice(0, count),
      ),
    );
  }

  const quotas = balanceQuotas(
    domains.map((domain) => ({
      domain,
      count: Math.max(1, Math.round(size * (domain.percent / 100))),
    })),
    size,
  );

  return shuffle(
    quotas.flatMap(({ domain, count }) =>
      shuffle(questionPool.filter((question) => question.domain === domain.id)).slice(0, count),
    ),
  );
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [profileState, setProfileState] = useState<ProfileState>(() => loadProfileState());
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isSupabaseConfigured ? "loading" : "local",
  );
  const [syncError, setSyncError] = useState("");
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);
  const [remoteReady, setRemoteReady] = useState(!isSupabaseConfigured);
  const [accessPlan, setAccessPlan] = useState<AccessPlan>("free");
  const [accessStatus, setAccessStatus] = useState("active");
  const [accessPeriodEnd, setAccessPeriodEnd] = useState<string | null>(null);
  const [accountFreeQuestionsUsed, setAccountFreeQuestionsUsed] = useState(0);
  const [accountFreeLimit, setAccountFreeLimit] = useState(freeQuestionLimit);
  const [accountHasFullAccess, setAccountHasFullAccess] = useState(false);
  const [accessDaysRemaining, setAccessDaysRemaining] = useState(0);
  const [accessExpiresSoon, setAccessExpiresSoon] = useState(false);
  const [accessExpired, setAccessExpired] = useState(false);
  const [accessLoading, setAccessLoading] = useState(isSupabaseConfigured);
  const [accessError, setAccessError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const lastRemoteFingerprint = useRef("");
  const remoteSaveTimer = useRef<number | null>(null);
  const activeProfile =
    profileState.profiles.find((profile) => profile.id === profileState.activeProfileId) ??
    profileState.profiles[0];
  const progress = activeProfile.progress;

  useEffect(() => {
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profileState.profiles));
    window.localStorage.setItem(activeProfileStorageKey, profileState.activeProfileId);
    window.localStorage.removeItem(progressStorageKey);
  }, [profileState]);

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecoveryActive(true);
      }
      if (!nextSession) {
        setSyncStatus("loading");
        setRemoteReady(false);
        lastRemoteFingerprint.current = "";
        setPasswordRecoveryActive(false);
        setAccessPlan("free");
        setAccessStatus("active");
        setAccessPeriodEnd(null);
        setAccountFreeQuestionsUsed(0);
        setAccountFreeLimit(freeQuestionLimit);
        setAccountHasFullAccess(false);
        setAccessDaysRemaining(0);
        setAccessExpiresSoon(false);
        setAccessExpired(false);
        setAccessLoading(false);
        setAccessError("");
        setCheckoutError("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) return;

    const client = supabase;
    const userId = session.user.id;
    let cancelled = false;
    const localProfiles = profileState.profiles;
    setSyncStatus("loading");
    setSyncError("");
    setRemoteReady(false);

    async function loadRemoteProfiles() {
      const { data, error } = await client
        .from("learner_profiles")
        .select("id, name, created_at, progress")
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        setSyncStatus("error");
        setSyncError(error.message);
        return;
      }

      let profiles = ((data ?? []) as LearnerProfileRow[]).map(profileFromRow);

      if (!profiles.length) {
        const rowsToCreate = localProfiles.map((profile) => ({
          user_id: userId,
          name: profile.name,
          progress: normalizeProgress(profile.progress),
        }));
        const { data: insertedRows, error: insertError } = await client
          .from("learner_profiles")
          .insert(rowsToCreate.length ? rowsToCreate : [{ user_id: userId, name: "Learner 1", progress: initialProgress }])
          .select("id, name, created_at, progress")
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (insertError) {
          setSyncStatus("error");
          setSyncError(insertError.message);
          return;
        }

        profiles = ((insertedRows ?? []) as LearnerProfileRow[]).map(profileFromRow);
      }

      const nextProfileState = ensureProfileStateHasActiveProfile(profiles);
      lastRemoteFingerprint.current = profileStateFingerprint(nextProfileState);
      setProfileState(nextProfileState);
      setSyncStatus("synced");
      setRemoteReady(true);
    }

    loadRemoteProfiles();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setAccessLoading(false);
      return;
    }

    const client = supabase;
    const userId = session.user.id;
    let cancelled = false;
    setAccessLoading(true);
    setAccessError("");

    async function loadEntitlement() {
      const { data, error } = await client.rpc("get_account_access");

      if (cancelled) return;

      if (error) {
        setAccessPlan("free");
        setAccessStatus("active");
        setAccessPeriodEnd(null);
        setAccountFreeQuestionsUsed(0);
        setAccountFreeLimit(freeQuestionLimit);
        setAccountHasFullAccess(false);
        setAccessDaysRemaining(0);
        setAccessExpiresSoon(false);
        setAccessExpired(false);
        setAccessError(error.message);
        setAccessLoading(false);
        return;
      }

      const access = parseAccessResult(data);
      setAccessPlan(access.plan);
      setAccessStatus(access.status);
      setAccountFreeQuestionsUsed(access.freeQuestionsUsed);
      setAccountFreeLimit(access.freeLimit);
      setAccountHasFullAccess(access.hasFullAccess);
      setAccessPeriodEnd(access.currentPeriodEnd);
      setAccessDaysRemaining(access.daysRemaining);
      setAccessExpiresSoon(access.expiresSoon);
      setAccessExpired(access.isExpired);
      setAccessLoading(false);
    }

    loadEntitlement();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase || !session?.user || !remoteReady) return undefined;

    const client = supabase;
    const userId = session.user.id;
    const fingerprint = profileStateFingerprint(profileState);
    if (fingerprint === lastRemoteFingerprint.current) return undefined;

    if (remoteSaveTimer.current) window.clearTimeout(remoteSaveTimer.current);
    setSyncStatus("saving");
    setSyncError("");

    remoteSaveTimer.current = window.setTimeout(async () => {
      const rows = profileState.profiles.map((profile) => ({
        id: profile.id,
        user_id: userId,
        name: profile.name,
        created_at: profile.createdAt,
        progress: normalizeProgress(profile.progress),
      }));

      const { error: upsertError } = await client
        .from("learner_profiles")
        .upsert(rows, { onConflict: "id" });

      if (upsertError) {
        setSyncStatus("error");
        setSyncError(upsertError.message);
        return;
      }

      const retainedIds = profileState.profiles.map((profile) => profile.id);
      const { error: deleteError } = await client
        .from("learner_profiles")
        .delete()
        .eq("user_id", userId)
        .not("id", "in", `(${retainedIds.join(",")})`);

      if (deleteError) {
        setSyncStatus("error");
        setSyncError(deleteError.message);
        return;
      }

      lastRemoteFingerprint.current = fingerprint;
      setSyncStatus("synced");
    }, 700);

    return () => {
      if (remoteSaveTimer.current) window.clearTimeout(remoteSaveTimer.current);
    };
  }, [profileState, session?.user?.id, remoteReady]);

  const stats = useMemo(() => buildStats(progress), [progress]);
  const hasFullAccess = accountHasFullAccess;
  const freeQuestionsUsed =
    isSupabaseConfigured && session ? accountFreeQuestionsUsed : progress.attempts.length;
  const freeQuestionsRemaining = hasFullAccess
    ? Number.POSITIVE_INFINITY
    : accessExpired
      ? 0
      : Math.max(0, accountFreeLimit - freeQuestionsUsed);

  const startUpgrade = async () => {
    setCheckoutError("");

    if (!supabase || !session) {
      setCheckoutError("Sign in before upgrading.");
      return;
    }

    setCheckoutLoading(true);
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        successUrl: `${getAuthRedirectUrl()}?checkout=success`,
        cancelUrl: `${getAuthRedirectUrl()}?checkout=cancelled`,
      },
    });
    setCheckoutLoading(false);

    if (error) {
      setCheckoutError(
        "Checkout is not connected yet. Add Stripe secrets and deploy the Supabase checkout function.",
      );
      return;
    }

    const checkoutUrl =
      data && typeof data === "object" && "url" in data ? String(data.url) : "";
    if (!checkoutUrl) {
      setCheckoutError("Checkout did not return a payment link.");
      return;
    }

    window.location.assign(checkoutUrl);
  };

  const accessState: AccessState = {
    plan: accessPlan,
    status: accessStatus,
    periodEnd: accessPeriodEnd,
    daysRemaining: accessDaysRemaining,
    expiresSoon: accessExpiresSoon,
    isExpired: accessExpired,
    isLoading: accessLoading,
    error: accessError,
    hasFullAccess,
    freeLimit: accountFreeLimit,
    used: freeQuestionsUsed,
    remaining: freeQuestionsRemaining,
    isCheckoutLoading: checkoutLoading,
    checkoutError,
    onUpgrade: startUpgrade,
  };

  const setProgress = (updater: ProgressState | ((current: ProgressState) => ProgressState)) => {
    setProfileState((currentState) => ({
      ...currentState,
      profiles: currentState.profiles.map((profile) => {
        if (profile.id !== currentState.activeProfileId) return profile;
        const nextProgress =
          typeof updater === "function" ? updater(profile.progress) : updater;
        return {
          ...profile,
          progress: normalizeProgress(nextProgress),
        };
      }),
    }));
  };

  const consumeQuestionAccess = async () => {
    if (hasFullAccess) return true;

    if (freeQuestionsRemaining <= 0) return false;

    if (supabase && session) {
      const { data, error } = await supabase.rpc("consume_question_access");
      if (error) {
        setAccessError(error.message);
        return false;
      }

      const result = parseFreeQuestionConsumption(data);
      setAccountFreeQuestionsUsed(result.freeQuestionsUsed);
      if (result.status) setAccessStatus(result.status);
      if (result.currentPeriodEnd) setAccessPeriodEnd(result.currentPeriodEnd);
      if (result.hasFullAccess) {
        setAccountHasFullAccess(true);
        setAccessExpired(false);
      }
      if (result.status === "expired") {
        setAccountHasFullAccess(false);
        setAccessExpired(true);
      }
      return result.allowed;
    }

    return progress.attempts.length < freeQuestionLimit;
  };

  const recordAttempt = async (
    question: Question,
    selectedIndex: number,
    confidence: number,
    examModel: ExamModelId = defaultExamModel,
  ) => {
    const canRecord = await consumeQuestionAccess();
    if (!canRecord) return false;

    setProgress((current) => ({
      ...current,
      attempts: [
        ...current.attempts,
        {
          questionId: question.id,
          domain: question.domain,
          examModel,
          area: getQuestionArea(question, examModel),
          selectedIndex,
          correct: selectedIndex === question.answerIndex,
          confidence,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    return true;
  };

  const toggleBookmark = (questionId: string) => {
    setProgress((current) => {
      const hasBookmark = current.bookmarks.includes(questionId);
      return {
        ...current,
        bookmarks: hasBookmark
          ? current.bookmarks.filter((id) => id !== questionId)
          : [...current.bookmarks, questionId],
      };
    });
  };

  const toggleTask = (taskId: string) => {
    setProgress((current) => {
      const completed = current.completedTasks.includes(taskId);
      return {
        ...current,
        completedTasks: completed
          ? current.completedTasks.filter((id) => id !== taskId)
          : [...current.completedTasks, taskId],
      };
    });
  };

  const updateTargetDate = (targetDate: string) => {
    setProgress((current) => ({ ...current, targetDate }));
  };

  const resetProgress = () => {
    const confirmed = window.confirm(
      "Reset saved attempts, bookmarks, and planner progress for this account?",
    );
    if (confirmed) setProgress(initialProgress);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfileState(loadProfileState());
    setSyncStatus("loading");
    setRemoteReady(false);
    setPasswordRecoveryActive(false);
  };

  if (isAccountAccessRequired && !isSupabaseConfigured) {
    return <AuthSetupScreen />;
  }

  if (isSupabaseConfigured && !authReady) {
    return <LoadingScreen />;
  }

  if (isSupabaseConfigured && !session) {
    return <AuthScreen />;
  }

  if (isSupabaseConfigured && session && passwordRecoveryActive) {
    return (
      <PasswordRecoveryScreen
        email={session.user.email ?? ""}
        onComplete={() => setPasswordRecoveryActive(false)}
        onSignOut={signOut}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <HeartHandshake className="brand-care" size={27} />
            <BookHeart className="brand-book" size={16} />
          </div>
          <div>
            <p className="eyebrow">Independent ASWB Clinical prep</p>
            <h1>ASWB Clinical Exam Prep</h1>
          </div>
        </div>

        <div className="header-tools">
          <nav className="top-nav" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={view === item.id ? "nav-button is-active" : "nav-button"}
                  type="button"
                  aria-current={view === item.id ? "page" : undefined}
                  onClick={() => setView(item.id)}
                >
                  <Icon aria-hidden="true" size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <AccountStatus
            session={session}
            syncStatus={syncStatus}
            syncError={syncError}
            access={accessState}
            onSignOut={signOut}
          />
        </div>
      </header>

      <AccessNotice access={accessState} />

      {view === "dashboard" && (
        <Dashboard
          stats={stats}
          progress={progress}
          accountEmail={session?.user.email ?? ""}
          access={accessState}
          setView={setView}
          resetProgress={resetProgress}
        />
      )}
      {view === "practice" && (
        <PracticeView
          progress={progress}
          access={accessState}
          recordAttempt={recordAttempt}
          toggleBookmark={toggleBookmark}
        />
      )}
      {view === "simulation" && (
        <SimulationView access={accessState} recordAttempt={recordAttempt} />
      )}
      {view === "flashcards" && <FlashcardView />}
      {view === "planner" && (
        <PlannerView
          progress={progress}
          toggleTask={toggleTask}
          updateTargetDate={updateTargetDate}
          setView={setView}
        />
      )}
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">
          <HeartHandshake className="brand-care" size={27} />
          <BookHeart className="brand-book" size={16} />
        </div>
        <p className="eyebrow">Connecting backend</p>
        <h1>Loading your study profile</h1>
        <p className="muted">Preparing Supabase Auth and saved account progress.</p>
      </section>
    </main>
  );
}

function AuthSetupScreen() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <ShieldCheck className="brand-care" size={27} />
            <Lock className="brand-book" size={16} />
          </div>
          <div>
            <p className="eyebrow">ASWB Clinical Exam Prep</p>
            <h1>Sign in to continue</h1>
          </div>
        </div>

        <p className="muted">
          Account access is required for this public app. The sign-in backend still needs
          the Supabase project URL and anon key before students can create accounts.
        </p>

        <div className="auth-form" aria-label="Account access pending configuration">
          <label>
            <span>
              <Mail aria-hidden="true" size={15} />
              Email
            </span>
            <input disabled placeholder="student@example.com" type="email" />
          </label>

          <label>
            <span>
              <Lock aria-hidden="true" size={15} />
              Password
            </span>
            <input disabled placeholder="Password" type="password" />
          </label>

          <p className="auth-message">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub repository
            secrets, then rerun the Pages deployment.
          </p>

          <button className="primary-action" type="button" disabled>
            <Cloud aria-hidden="true" size={18} />
            Sign in
          </button>
        </div>
      </section>
    </main>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isResetMode = mode === "reset-password";

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    const normalizedEmail = email.trim();
    setIsSubmitting(true);
    setAuthMessage("");

    if (isResetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: getAuthRedirectUrl(),
      });
      setIsSubmitting(false);

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setAuthMessage(
        "If an account exists for that email, a password reset link has been sent.",
      );
      return;
    }

    if (mode === "sign-up" && password !== confirmPassword) {
      setIsSubmitting(false);
      setAuthMessage("Passwords do not match.");
      return;
    }

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        : await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: { emailRedirectTo: getAuthRedirectUrl() },
          });

    setIsSubmitting(false);

    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setAuthMessage("Account created. Check your email to confirm your sign-in.");
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <HeartHandshake className="brand-care" size={27} />
            <BookHeart className="brand-book" size={16} />
          </div>
          <div>
            <p className="eyebrow">ASWB Clinical Exam Prep</p>
            <h1>
              {mode === "sign-in"
                ? "Sign in to keep progress synced"
                : mode === "sign-up"
                  ? "Create your study account"
                  : "Reset your password"}
            </h1>
          </div>
        </div>

        <p className="muted">
          {isResetMode
            ? "Enter your email and we will send a secure link to set a new password."
            : "Supabase is enabled for this app. Sign in to save attempts, bookmarks, planner progress, and readiness history across devices."}
        </p>

        {!isResetMode && (
          <div className="auth-tabs" aria-label="Authentication mode">
            <button
              className={mode === "sign-in" ? "is-active" : ""}
              type="button"
              onClick={() => {
                setMode("sign-in");
                setAuthMessage("");
              }}
            >
              Sign in
            </button>
            <button
              className={mode === "sign-up" ? "is-active" : ""}
              type="button"
              onClick={() => {
                setMode("sign-up");
                setAuthMessage("");
              }}
            >
              Create account
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleAuth}>
          <label>
            <span>
              <Mail aria-hidden="true" size={15} />
              Email
            </span>
            <input
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          {!isResetMode && (
            <label>
              <span>
                <Lock aria-hidden="true" size={15} />
                Password
              </span>
              <input
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                minLength={minimumPasswordLength}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          )}

          {mode === "sign-up" && (
            <label>
              <span>
                <KeyRound aria-hidden="true" size={15} />
                Confirm password
              </span>
              <input
                autoComplete="new-password"
                minLength={minimumPasswordLength}
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          )}

          {authMessage && <p className="auth-message">{authMessage}</p>}

          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isResetMode ? (
              <KeyRound aria-hidden="true" size={18} />
            ) : (
              <Cloud aria-hidden="true" size={18} />
            )}
            {isSubmitting
              ? "Working..."
              : mode === "sign-in"
                ? "Sign in"
                : mode === "sign-up"
                  ? "Create account"
                  : "Send reset link"}
          </button>

          <div className="auth-actions">
            {mode !== "reset-password" ? (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setMode("reset-password");
                  setPassword("");
                  setConfirmPassword("");
                  setAuthMessage("");
                }}
              >
                Forgot password?
              </button>
            ) : (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setMode("sign-in");
                  setAuthMessage("");
                }}
              >
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

function PasswordRecoveryScreen({
  email,
  onComplete,
  onSignOut,
}: {
  email: string;
  onComplete: () => void;
  onSignOut: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setIsComplete(true);
    setMessage("Your password has been updated.");
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <ShieldCheck className="brand-care" size={27} />
            <KeyRound className="brand-book" size={16} />
          </div>
          <div>
            <p className="eyebrow">Account recovery</p>
            <h1>Set a new password</h1>
          </div>
        </div>

        <p className="muted">
          {email
            ? `You are updating the password for ${email}.`
            : "Create a new password to finish account recovery."}
        </p>

        <form className="auth-form" onSubmit={handlePasswordUpdate}>
          {!isComplete && (
            <>
              <label>
                <span>
                  <Lock aria-hidden="true" size={15} />
                  New password
                </span>
                <input
                  autoComplete="new-password"
                  minLength={minimumPasswordLength}
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <label>
                <span>
                  <KeyRound aria-hidden="true" size={15} />
                  Confirm password
                </span>
                <input
                  autoComplete="new-password"
                  minLength={minimumPasswordLength}
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            </>
          )}

          {message && <p className="auth-message">{message}</p>}

          {isComplete ? (
            <button className="primary-action" type="button" onClick={onComplete}>
              <ShieldCheck aria-hidden="true" size={18} />
              Continue to app
            </button>
          ) : (
            <button className="primary-action" type="submit" disabled={isSubmitting}>
              <KeyRound aria-hidden="true" size={18} />
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          )}

          <button className="text-action" type="button" onClick={onSignOut}>
            Use a different account
          </button>
        </form>
      </section>
    </main>
  );
}

function AccountStatus({
  session,
  syncStatus,
  syncError,
  access,
  onSignOut,
}: {
  session: Session | null;
  syncStatus: SyncStatus;
  syncError: string;
  access: AccessState;
  onSignOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const statusLabel = !isSupabaseConfigured
    ? "Local mode"
    : syncStatus === "loading"
      ? "Loading cloud data"
      : syncStatus === "saving"
        ? "Saving"
        : syncStatus === "error"
          ? "Sync issue"
          : "Synced";
  const email = session?.user.email ?? "";
  const paidThrough = formatAccessDate(access.periodEnd);
  const accessSummary = access.isLoading
    ? "Checking access"
    : access.hasFullAccess
      ? access.expiresSoon
        ? `${access.daysRemaining} days of access left`
        : paidThrough
          ? `Full access through ${paidThrough}`
          : "Full access"
      : access.isExpired
        ? "Access expired"
        : `${access.remaining} sample left`;

  const handleAccountPasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setAccountMessage("");
    if (password !== confirmPassword) {
      setAccountMessage("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsUpdatingPassword(false);

    if (error) {
      setAccountMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setAccountMessage("Password updated.");
  };

  const sendPasswordReset = async () => {
    if (!supabase || !email) return;

    setIsSendingReset(true);
    setAccountMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    setIsSendingReset(false);

    if (error) {
      setAccountMessage(error.message);
      return;
    }

    setAccountMessage("Password reset email sent.");
  };

  return (
    <section className="account-status" aria-label="Account and sync status">
      <div className="account-summary">
        <div>
          <span className={syncStatus === "error" ? "status-dot is-error" : "status-dot"} />
          <strong>{statusLabel}</strong>
          <small>
            {syncError ||
              `${accessSummary} · ${email || "Progress is saved on this device"}`}
          </small>
        </div>
        {session && (
          <button
            className="account-toggle"
            type="button"
            aria-expanded={isOpen}
            onClick={() => {
              setIsOpen((current) => !current);
              setAccountMessage("");
            }}
          >
            <UserCircle aria-hidden="true" size={15} />
            <span>Account</span>
          </button>
        )}
      </div>

      {session && isOpen && (
        <div className="account-panel">
          <div className="account-panel-heading">
            <div>
              <p className="eyebrow">Signed in</p>
              <h2>{email}</h2>
            </div>
            <Settings aria-hidden="true" size={20} />
          </div>

          <form className="account-password-form" onSubmit={handleAccountPasswordUpdate}>
            <label>
              <span>
                <Lock aria-hidden="true" size={14} />
                New password
              </span>
              <input
                autoComplete="new-password"
                minLength={minimumPasswordLength}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label>
              <span>
                <KeyRound aria-hidden="true" size={14} />
                Confirm password
              </span>
              <input
                autoComplete="new-password"
                minLength={minimumPasswordLength}
                required
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            {accountMessage && <p className="auth-message">{accountMessage}</p>}

            <button className="primary-action" type="submit" disabled={isUpdatingPassword}>
              <ShieldCheck aria-hidden="true" size={17} />
              {isUpdatingPassword ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="account-panel-actions">
            <button type="button" onClick={sendPasswordReset} disabled={isSendingReset}>
              <KeyRound aria-hidden="true" size={15} />
              <span>{isSendingReset ? "Sending..." : "Email reset link"}</span>
            </button>
            <button type="button" onClick={onSignOut}>
              <LogOut aria-hidden="true" size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function AccessBadge({ access }: { access: AccessState }) {
  if (access.isLoading) {
    return <span className="access-pill">Checking access</span>;
  }

  if (access.hasFullAccess) {
    const paidThrough = formatAccessDate(access.periodEnd);
    return (
      <span className="access-pill is-paid">
        {access.expiresSoon
          ? `${access.daysRemaining} days left`
          : paidThrough
            ? `Full access through ${paidThrough}`
            : "Full access"}
      </span>
    );
  }

  if (access.isExpired) {
    return <span className="access-pill is-expired">Access expired</span>;
  }

  return (
    <span className="access-pill">
      Free sample · {access.remaining}/{access.freeLimit} left
    </span>
  );
}

function AccessNotice({ access }: { access: AccessState }) {
  if (access.hasFullAccess && access.expiresSoon) {
    return (
      <div className="access-banner is-warning">
        <AccessBadge access={access} />
        <span>
          Your {paidAccessDays}-day access is close to ending. Re-purchase anytime after
          expiration to unlock another {paidAccessDays} days.
        </span>
      </div>
    );
  }

  if (access.isExpired) {
    return (
      <div className="access-banner is-warning">
        <AccessBadge access={access} />
        <span>
          Your paid access ended. Your account and progress are still saved; purchase again
          to unlock all questions for another {paidAccessDays} days.
        </span>
        <button
          className="primary-action"
          type="button"
          onClick={access.onUpgrade}
          disabled={access.isCheckoutLoading || access.isLoading}
        >
          {access.isCheckoutLoading ? "Opening checkout..." : `Repurchase for ${accessPriceLabel}`}
        </button>
      </div>
    );
  }

  return null;
}

function UpgradePanel({
  access,
  title = "Unlock the full question bank",
  detail,
  compact = false,
}: {
  access: AccessState;
  title?: string;
  detail?: string;
  compact?: boolean;
}) {
  if (access.hasFullAccess) return null;
  const resolvedDetail =
    detail ||
    (access.isExpired
      ? `Your ${paidAccessDays}-day access has ended. Re-purchase once for ${accessPriceLabel} to unlock all 2,500 questions for another ${paidAccessDays} days.`
      : `Free accounts include ${access.freeLimit} sample questions. Pay ${accessPriceLabel} once to unlock all 2,500 questions for ${paidAccessDays} days.`);
  const buttonLabel = access.isExpired
    ? `Repurchase for ${accessPriceLabel}`
    : `Unlock for ${accessPriceLabel}`;

  return (
    <section className={compact ? "upgrade-panel is-compact" : "upgrade-panel"}>
      <div>
        <p className="eyebrow">{access.isExpired ? "Access expired" : "Free access"}</p>
        <h3>{title}</h3>
        <p>{resolvedDetail}</p>
        {access.error && <p className="upgrade-note">{access.error}</p>}
        {access.checkoutError && <p className="upgrade-note">{access.checkoutError}</p>}
      </div>
      <button
        className="primary-action"
        type="button"
        onClick={access.onUpgrade}
        disabled={access.isCheckoutLoading || access.isLoading}
      >
        <Trophy aria-hidden="true" size={18} />
        {access.isLoading
          ? "Checking access..."
          : access.isCheckoutLoading
            ? "Opening checkout..."
            : buttonLabel}
      </button>
    </section>
  );
}

function Dashboard({
  stats,
  progress,
  accountEmail,
  access,
  setView,
  resetProgress,
}: {
  stats: ReturnType<typeof buildStats>;
  progress: ProgressState;
  accountEmail: string;
  access: AccessState;
  setView: (view: View) => void;
  resetProgress: () => void;
}) {
  const daysUntil = getDaysUntil(progress.targetDate);
  const [dashboardModel, setDashboardModel] = useState<ExamModelId>(defaultExamModel);
  const selectedDashboardModel = examModels.find((model) => model.id === dashboardModel)!;
  const areaStats = useMemo(
    () => buildAreaStats(progress, dashboardModel),
    [dashboardModel, progress],
  );
  const areaGroups = domains
    .map((domain) => ({
      domain,
      areas: areaStats.filter((item) => item.area.domain === domain.id),
    }))
    .filter((group) => group.areas.length);

  return (
    <section className="view-stack">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Clinical readiness cockpit</p>
          <h2>Master the clinical exam through targeted, scenario-based practice.</h2>
          <div className="hero-points" aria-label="Study scope">
            <span>2,500 original questions</span>
            <span>Dual ASWB blueprints</span>
            <span>Rationales and readiness tracking</span>
            <AccessBadge access={access} />
          </div>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => setView("practice")}>
              <Play aria-hidden="true" size={18} />
              Start practice
            </button>
            <button className="secondary-action" type="button" onClick={() => setView("simulation")}>
              <Timer aria-hidden="true" size={18} />
              Timed simulation
            </button>
          </div>
        </div>

        <div className="photo-panel" aria-label="Study desk visual">
          <img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80"
            alt="Open books and study notes on a desk"
          />
          <div className="photo-stat">
            <span>{stats.readiness}%</span>
            <small>Overall readiness</small>
          </div>
        </div>
      </div>

      <div className="stat-grid" aria-label="Progress summary">
        <MetricCard icon={Trophy} label="Readiness" value={`${stats.readiness}%`} detail="Practice-weighted" />
        <MetricCard icon={Target} label="Accuracy" value={`${stats.overallAccuracy}%`} detail={`${stats.totalAttempts} attempts`} />
        <MetricCard icon={ClipboardCheck} label="Coverage" value={`${stats.coverage}%`} detail={`${stats.uniqueAnswered}/${questions.length} questions`} />
        <MetricCard
          icon={CalendarDays}
          label="Target"
          value={daysUntil === null ? "Unset" : daysUntil >= 0 ? `${daysUntil} days` : "Past"}
          detail={progress.targetDate || "Choose a date"}
        />
      </div>

      <section className="panel study-area-panel">
        <div className="section-heading study-area-heading">
          <div>
            <p className="eyebrow">Domain knowledge</p>
            <h3>Readiness by study area</h3>
          </div>
          <ExamModelSelector value={dashboardModel} onChange={setDashboardModel} />
        </div>
        <p className="muted study-area-model-note">
          {selectedDashboardModel.blueprint}. Readiness blends answer accuracy with how much of each
          study area the student has covered.
        </p>

        <div className="study-area-groups">
          {areaGroups.map((group) => (
            <section className="study-area-domain" key={group.domain.id}>
              <div className="study-area-domain-heading">
                <span style={{ backgroundColor: group.domain.color }} aria-hidden="true" />
                <div>
                  <h4>{group.domain.name}</h4>
                  <p>{group.domain.focus}</p>
                </div>
                <strong>{group.areas.length} areas</strong>
              </div>

              <div className="study-area-list">
                {group.areas.map((item) => (
                  <article className="study-area-row" key={item.area.id}>
                    <div className="study-area-topline">
                      <span className="study-area-code" style={{ borderColor: group.domain.color }}>
                        {item.area.id}
                      </span>
                      <div>
                        <h5>{item.area.name}</h5>
                        <p>{item.area.focus}</p>
                      </div>
                      <strong>{item.readiness}%</strong>
                    </div>
                    <div className="bar-track compact" aria-hidden="true">
                      <span
                        className="bar-fill"
                        style={{
                          width: `${item.readiness}%`,
                          backgroundColor: group.domain.color,
                        }}
                      />
                    </div>
                    <div className="domain-meta">
                      <span>{item.accuracy}% accuracy</span>
                      <span>{item.coverage}% coverage</span>
                      <span>{item.unique}/{item.questionCount} answered</span>
                      <span>{item.attempts} attempts</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">2026 Clinical blueprint</p>
              <h3>2026 domain balance</h3>
            </div>
            <span className="pill">{examFacts.scoredQuestions} scored items</span>
          </div>

          <div className="domain-list">
            {stats.domainStats.map((item) => (
              <article className="domain-row" key={item.domain.id}>
                <div className="domain-topline">
                  <div>
                    <h4>{item.domain.name}</h4>
                    <p>{item.domain.focus}</p>
                  </div>
                  <strong>{item.domain.percent}%</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <span
                    className="bar-fill"
                    style={{
                      width: `${item.readiness}%`,
                      backgroundColor: item.domain.color,
                    }}
                  />
                </div>
                <div className="domain-meta">
                  <span>{item.accuracy}% accuracy</span>
                  <span>{item.coverage}% coverage</span>
                  <span>{item.attempts} attempts</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Exam anchors</p>
              <h3>Format snapshot</h3>
            </div>
          </div>
          <dl className="fact-list">
            <div>
              <dt>Transition</dt>
              <dd>{examFacts.transitionDate}</dd>
            </div>
            <div>
              <dt>Question count</dt>
              <dd>
                On/after Aug. 3, 2026: {examFacts.totalQuestions} total,{" "}
                {examFacts.scoredQuestions} scored, {examFacts.unscoredQuestions} unscored
              </dd>
            </div>
            <div>
              <dt>Pre-transition format</dt>
              <dd>
                Before Aug. 3, 2026: {examFacts.currentBeforeTransitionQuestions} total,{" "}
                {examFacts.currentBeforeTransitionScoredQuestions} scored,{" "}
                {examFacts.currentBeforeTransitionUnscored} unscored
              </dd>
            </div>
            <div>
              <dt>Time limit</dt>
              <dd>{formatTime(examFacts.timeLimitMinutes)} in both formats</dd>
            </div>
            <div>
              <dt>Practice bank</dt>
              <dd>{questions.length} original questions mapped to both blueprints</dd>
            </div>
            <div>
              <dt>Question style</dt>
              <dd>Before 2026 has more four-option items; 2026 continues toward more three-option items</dd>
            </div>
          </dl>
          <div className="source-links">
            <a href="https://www.aswb.org/2026exams/" target="_blank" rel="noreferrer">
              ASWB 2026 changes
              <ExternalLink aria-hidden="true" size={14} />
            </a>
            <a href="https://www.aswb.org/exam/readiness-to-practice/content-outlines/" target="_blank" rel="noreferrer">
              ASWB content outlines
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          </div>
        </aside>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Weak spots</p>
              <h3>Recent misses</h3>
            </div>
            <button className="text-action" type="button" onClick={() => setView("practice")}>
              Review
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          </div>
          {stats.recentMisses.length ? (
            <div className="miss-list">
              {stats.recentMisses.map((question) => (
                <article key={question.id} className="miss-item">
                  <span style={{ backgroundColor: domainMap.get(question.domain)?.color }} />
                  <div>
                    <strong>{domainMap.get(question.domain)?.shortName}</strong>
                    <p>{question.stem}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 aria-hidden="true" size={24} />
              <p>No misses logged yet. A little suspicious, but we will take the win.</p>
            </div>
          )}
        </section>

        <aside className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Account progress</p>
              <h3>{accountEmail || "Local study session"}</h3>
            </div>
          </div>
          <p className="muted">
            {isSupabaseConfigured
              ? "Attempts, bookmarks, planner checks, and readiness history sync to the signed-in account."
              : "Attempts, bookmarks, planner checks, and readiness history are saved on this device."}
          </p>
          {!access.hasFullAccess && (
            access.isExpired ? (
              <div className="empty-state">
                <Lock aria-hidden="true" size={22} />
                <p>Question access is paused until this account purchases another 180-day pass.</p>
              </div>
            ) : (
              <div className="free-meter" aria-label="Free sample questions remaining">
                <div>
                  <span>{access.used}</span>
                  <small>sample used</small>
                </div>
                <div>
                  <span>{access.remaining}</span>
                  <small>sample left</small>
                </div>
                <div>
                  <span>{access.freeLimit}</span>
                  <small>sample limit</small>
                </div>
              </div>
            )
          )}
          {!access.hasFullAccess && <UpgradePanel access={access} compact />}
          <button className="danger-action" type="button" onClick={resetProgress}>
            <RotateCcw aria-hidden="true" size={17} />
            Reset my progress
          </button>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="metric-card">
      <Icon aria-hidden="true" size={20} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function ExamModelSelector({
  value,
  onChange,
}: {
  value: ExamModelId;
  onChange: (value: ExamModelId) => void;
}) {
  return (
    <div className="filter-group model-group">
      <span className="filter-label">Exam model</span>
      <div className="model-toggle" aria-label="Exam model">
        {examModels.map((model) => (
          <button
            key={model.id}
            type="button"
            className={value === model.id ? "is-selected" : ""}
            onClick={() => onChange(model.id)}
          >
            <strong>{model.label}</strong>
            <span>{model.questionCount}-question exam format</span>
            <small>{questions.length}-question practice bank</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function AreaSelect({
  examModel,
  domainFilter,
  value,
  onChange,
}: {
  examModel: ExamModelId;
  domainFilter: DomainId | "all";
  value: AreaFilter;
  onChange: (value: AreaFilter) => void;
}) {
  const modelAreas = examAreasByModel[examModel];
  const availableAreas =
    domainFilter === "all"
      ? modelAreas
      : modelAreas.filter((area) => area.domain === domainFilter);
  const selectedModel = examModels.find((model) => model.id === examModel)!;
  const allLabel =
    domainFilter === "all"
      ? `All ${selectedModel.shortLabel} areas`
      : `All ${domainMap.get(domainFilter)!.shortName} areas`;

  return (
    <label className="area-select">
      <span>Study area</span>
      <select
        aria-label="Study area"
        value={value}
        onChange={(event) => onChange(event.target.value as AreaFilter)}
      >
        <option value="all">{allLabel}</option>
        {availableAreas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.id} - {area.name} ({examAreaCounts.get(areaKey(examModel, area.id))})
          </option>
        ))}
      </select>
    </label>
  );
}

function PracticeView({
  progress,
  access,
  recordAttempt,
  toggleBookmark,
}: {
  progress: ProgressState;
  access: AccessState;
  recordAttempt: (
    question: Question,
    selectedIndex: number,
    confidence: number,
    examModel?: ExamModelId,
  ) => Promise<boolean>;
  toggleBookmark: (questionId: string) => void;
}) {
  const [examModel, setExamModel] = useState<ExamModelId>(defaultExamModel);
  const [domainFilter, setDomainFilter] = useState<DomainId | "all">("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practiceQueue, setPracticeQueue] = useState<Question[]>(() => shuffle(questions));
  const [sessionStats, setSessionStats] = useState({
    answered: 0,
    correct: 0,
    review: 0,
  });
  const questionPool = access.hasFullAccess ? questions : freeSampleQuestions;

  const filteredQuestions = useMemo(() => {
    return questionPool.filter((question) => {
      const matchesDomain = domainFilter === "all" || question.domain === domainFilter;
      const matchesArea =
        areaFilter === "all" || getQuestionArea(question, examModel) === areaFilter;
      return matchesDomain && matchesArea;
    });
  }, [areaFilter, domainFilter, examModel, questionPool]);

  const activeQuestions = practiceQueue.length ? practiceQueue : filteredQuestions;
  const question = activeQuestions.length ? activeQuestions[index % activeQuestions.length] : null;
  const domain = question ? domainMap.get(question.domain)! : null;
  const areaId = question ? getQuestionArea(question, examModel) : null;
  const area = areaId ? examAreaMap.get(areaKey(examModel, areaId))! : null;
  const isBookmarked = question ? progress.bookmarks.includes(question.id) : false;
  const currentQuestionNumber = activeQuestions.length ? (index % activeQuestions.length) + 1 : 0;
  const positionPercent = activeQuestions.length
    ? Math.round((currentQuestionNumber / activeQuestions.length) * 100)
    : 0;
  const canAnswer = access.hasFullAccess || (!access.isExpired && access.remaining > 0);
  const canUseCurrentQuestion = Boolean(question) && (canAnswer || revealed);

  useEffect(() => {
    setPracticeQueue(shuffle(filteredQuestions));
    setIndex(0);
    setSelectedIndex(null);
    setRevealed(false);
    setConfidence(3);
    setSessionStats({ answered: 0, correct: 0, review: 0 });
  }, [filteredQuestions]);

  const resetQuestionState = () => {
    setSelectedIndex(null);
    setRevealed(false);
    setConfidence(3);
  };

  const changeFilter = (domainId: DomainId | "all") => {
    setDomainFilter(domainId);
    setAreaFilter("all");
  };

  const changeExamModel = (nextModel: ExamModelId) => {
    setExamModel(nextModel);
    setDomainFilter("all");
    setAreaFilter("all");
  };

  const changeAreaFilter = (nextArea: AreaFilter) => {
    setAreaFilter(nextArea);
    if (nextArea !== "all") {
      setDomainFilter(examAreaMap.get(areaKey(examModel, nextArea))!.domain);
    }
  };

  const startNewPracticeSet = () => {
    setPracticeQueue(shuffle(filteredQuestions));
    setIndex(0);
    setSessionStats({ answered: 0, correct: 0, review: 0 });
    resetQuestionState();
  };

  const submitAnswer = () => {
    if (!question || selectedIndex === null || revealed || !canAnswer || isSubmitting) return;
    setIsSubmitting(true);
    const correct = selectedIndex === question.answerIndex;
    recordAttempt(question, selectedIndex, confidence, examModel).then((wasRecorded) => {
      setIsSubmitting(false);
      if (!wasRecorded) return;
      setSessionStats((current) => ({
        answered: current.answered + 1,
        correct: current.correct + (correct ? 1 : 0),
        review: current.review + (correct ? 0 : 1),
      }));
      setRevealed(true);
    });
  };

  const nextQuestion = () => {
    if (currentQuestionNumber >= activeQuestions.length) {
      setPracticeQueue(shuffle(filteredQuestions));
      setIndex(0);
    } else {
      setIndex((current) => current + 1);
    }
    resetQuestionState();
  };

  return (
    <section className="view-stack">
      <div className="section-heading wide">
        <div>
          <p className="eyebrow">Question lab</p>
          <h2>Practice with rationales</h2>
        </div>
        <div className="practice-filter-panel">
          <div className="filter-row is-model">
            <ExamModelSelector value={examModel} onChange={changeExamModel} />
          </div>
          <div className="filter-row is-dependent">
            <div className="filter-group">
              <span className="filter-label">Domain</span>
              <div className="segmented-control" aria-label="Domain filter">
                <button
                  type="button"
                  className={domainFilter === "all" ? "is-selected" : ""}
                  onClick={() => changeFilter("all")}
                >
                  All
                </button>
                {domains.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={domainFilter === item.id ? "is-selected" : ""}
                    onClick={() => changeFilter(item.id)}
                  >
                    {item.shortName}
                  </button>
                ))}
              </div>
            </div>
            <AreaSelect
              examModel={examModel}
              domainFilter={domainFilter}
              value={areaFilter}
              onChange={changeAreaFilter}
            />
          </div>
        </div>
      </div>

      {!access.hasFullAccess && (
        <div className="access-banner">
          <AccessBadge access={access} />
          <span>
            Free accounts can answer {access.freeLimit} sample questions before upgrading.
          </span>
        </div>
      )}

      <div className="practice-progress-panel" aria-label="Practice progress">
        <div className="practice-position">
          <span>Current question</span>
          <strong>
            {currentQuestionNumber} of {activeQuestions.length}
          </strong>
        </div>
        <div className="practice-progress-track" aria-hidden="true">
          <span style={{ width: `${positionPercent}%` }} />
        </div>
        <div className="practice-score-grid">
          <div>
            <span>Answered</span>
            <strong>{sessionStats.answered}</strong>
          </div>
          <div>
            <span>Correct</span>
            <strong>{sessionStats.correct}</strong>
          </div>
          <div>
            <span>Needs review</span>
            <strong>{sessionStats.review}</strong>
          </div>
        </div>
        <button
          className="mini-reset"
          type="button"
          onClick={startNewPracticeSet}
          aria-label="Start a new shuffled practice set"
        >
          <RotateCcw aria-hidden="true" size={16} />
          New set
        </button>
      </div>

      <div className="practice-layout">
        <article className="question-panel">
          {!canUseCurrentQuestion ? (
            <UpgradePanel
              access={access}
              title="You reached the free practice limit"
              detail={
                access.isExpired
                  ? `Your ${paidAccessDays}-day access ended. Purchase again to resume practice and keep your saved progress.`
                  : !question
                    ? "This filter does not include a free sample item. Clear the filters or unlock the full bank."
                    : `You answered ${access.freeLimit} sample questions. Unlock all 2,500 questions, focused study areas, simulations, and progress tracking.`
              }
            />
          ) : (
            <>
              <div className="question-meta">
                <span className="domain-chip" style={{ borderColor: domain!.color }}>
                  {domain!.name}
                </span>
                <span className="area-chip" title={area!.name}>
                  {areaId} · {area!.name}
                </span>
                <span>{question!.skill}</span>
                <span>{question!.difficulty}</span>
                <button
                  className="icon-action"
                  type="button"
                  aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                  onClick={() => toggleBookmark(question!.id)}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>

              <h3>{question!.stem}</h3>

              <div className="option-list" role="radiogroup" aria-label="Answer options">
                {question!.options.map((option, optionIndex) => {
                  const isSelected = selectedIndex === optionIndex;
                  const isCorrect = question!.answerIndex === optionIndex;
                  const stateClass = revealed
                    ? isCorrect
                      ? "is-correct"
                      : isSelected
                        ? "is-wrong"
                        : ""
                    : isSelected
                      ? "is-picked"
                      : "";

                  return (
                    <button
                      key={option}
                      className={`option-button ${stateClass}`}
                      type="button"
                      onClick={() => !revealed && canAnswer && setSelectedIndex(optionIndex)}
                      aria-pressed={isSelected}
                      disabled={!canAnswer && !revealed}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      <p>{option}</p>
                      {revealed && isCorrect && <CheckCircle2 aria-hidden="true" size={18} />}
                      {revealed && isSelected && !isCorrect && <XCircle aria-hidden="true" size={18} />}
                    </button>
                  );
                })}
              </div>

              <div className="confidence-row">
                <label htmlFor="confidence">Confidence</label>
                <input
                  id="confidence"
                  min="1"
                  max="5"
                  step="1"
                  type="range"
                  value={confidence}
                  onChange={(event) => setConfidence(Number(event.target.value))}
                  disabled={revealed || !canAnswer}
                />
                <strong>{confidence}/5</strong>
              </div>

              {revealed && (
                <div className="rationale-box">
                  <strong>{selectedIndex === question!.answerIndex ? "Correct" : "Review this one"}</strong>
                  <p>{question!.rationale}</p>
                  <p className="exam-lens">{question!.examLens}</p>
                </div>
              )}

              <div className="question-actions">
                <button
                  className="primary-action"
                  type="button"
                  onClick={submitAnswer}
                  disabled={selectedIndex === null || revealed || !canAnswer || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Submit"}
                </button>
                <button className="secondary-action" type="button" onClick={nextQuestion}>
                  {revealed ? "Next" : "Skip"}
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </div>
            </>
          )}
        </article>

        <aside className="panel lens-panel">
          <p className="eyebrow">Decision lens</p>
          <h3>Common exam moves</h3>
          <ul className="lens-list">
            <li>Check for immediate safety or mandated action.</li>
            <li>Clarify role, consent, and confidentiality limits.</li>
            <li>Assess before intervening when facts are incomplete.</li>
            <li>Use the least intrusive ethical action that protects the client.</li>
            <li>Honor client self-determination when risk is not acute.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function SimulationView({
  access,
  recordAttempt,
}: {
  access: AccessState;
  recordAttempt: (
    question: Question,
    selectedIndex: number,
    confidence: number,
    examModel?: ExamModelId,
  ) => Promise<boolean>;
}) {
  const [examModel, setExamModel] = useState<ExamModelId>(defaultExamModel);
  const [size, setSize] = useState(24);
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [simulationQuestions, setSimulationQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const activeQuestion = simulationQuestions[index];
  const selectedIndex = activeQuestion ? answers[activeQuestion.id] : undefined;
  const selectedModel = examModels.find((model) => model.id === examModel)!;
  const simulationSizes = examModel === "2026" ? [12, 24, 60, 122] : [20, 50, 85, 170];
  const questionPool = access.hasFullAccess ? questions : freeSampleQuestions;
  const availableQuestionCount =
    areaFilter === "all"
      ? questionPool.length
      : questionPool.filter((question) => getQuestionArea(question, examModel) === areaFilter).length;
  const accessCapacity = access.hasFullAccess
    ? Number.POSITIVE_INFINITY
    : access.isExpired
      ? 0
      : Math.min(access.remaining, availableQuestionCount);
  const availableSimulationSizes = simulationSizes.filter(
    (option) => option <= accessCapacity && option <= availableQuestionCount,
  );
  const selectedSizeAllowed =
    size <= availableQuestionCount &&
    (access.hasFullAccess || (!access.isExpired && size <= access.remaining));
  const canStartSimulation =
    !access.isLoading &&
    selectedSizeAllowed &&
    availableQuestionCount > 0 &&
    (access.hasFullAccess || accessCapacity > 0);
  const timerMinutes = Math.max(
    5,
    Math.round((size / selectedModel.questionCount) * selectedModel.timeLimitMinutes),
  );
  const simulationFocus =
    areaFilter === "all" ? null : examAreaMap.get(areaKey(examModel, areaFilter))!;

  const changeExamModel = (nextModel: ExamModelId) => {
    setExamModel(nextModel);
    setAreaFilter("all");
    setSize(nextModel === "2026" ? 24 : 50);
  };

  useEffect(() => {
    const allowedSizes = simulationSizes.filter(
      (option) => option <= accessCapacity && option <= availableQuestionCount,
    );
    if (!allowedSizes.length) return;
    if (!allowedSizes.includes(size)) setSize(allowedSizes[allowedSizes.length - 1]);
  }, [access.hasFullAccess, accessCapacity, availableQuestionCount, examModel, size]);

  useEffect(() => {
    if (!simulationQuestions.length || finished) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [simulationQuestions.length, finished]);

  const startSimulation = () => {
    if (!canStartSimulation || !selectedSizeAllowed) return;
    const nextQuestions = makeSimulation(size, areaFilter, examModel, questionPool);
    setSimulationQuestions(nextQuestions);
    setAnswers({});
    setFlagged([]);
    setIndex(0);
    setFinished(false);
    setIsFinishing(false);
    setSecondsLeft(timerMinutes * 60);
  };

  const finishSimulation = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    for (const question of simulationQuestions) {
      const answer = answers[question.id];
      if (answer !== undefined) {
        const wasRecorded = await recordAttempt(question, answer, 3, examModel);
        if (!wasRecorded) break;
      }
    }

    setIsFinishing(false);
    setFinished(true);
  };

  const score = simulationQuestions.reduce((sum, question) => {
    return sum + (answers[question.id] === question.answerIndex ? 1 : 0);
  }, 0);
  const answeredCount = Object.keys(answers).length;
  const scorePercent = simulationQuestions.length
    ? Math.round((score / simulationQuestions.length) * 100)
    : 0;

  if (!simulationQuestions.length) {
    return (
      <section className="view-stack">
        <div className="section-heading wide">
          <div>
            <p className="eyebrow">Timed simulation</p>
            <h2>Run a blueprint-weighted sprint</h2>
          </div>
        </div>

        {!access.hasFullAccess && (
          <div className="access-banner">
            <AccessBadge access={access} />
            <span>
              Free accounts can answer {access.freeLimit} total questions. Timed sprints only
              use sample questions and only show lengths that fit your remaining access.
            </span>
          </div>
        )}

        <div className="sim-start">
          <section className="panel">
            <h3>Simulation length</h3>
            <ExamModelSelector value={examModel} onChange={changeExamModel} />
            <div className="sim-options" aria-label="Simulation length">
              {simulationSizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={size === option ? "is-selected" : ""}
                  disabled={option > accessCapacity || option > availableQuestionCount}
                  onClick={() => setSize(option)}
                >
                  <strong>{option}</strong>
                  <span>{formatTime(Math.round((option / selectedModel.questionCount) * selectedModel.timeLimitMinutes))}</span>
                </button>
              ))}
            </div>
            <div className="sim-area-row">
              <AreaSelect
                examModel={examModel}
                domainFilter="all"
                value={areaFilter}
                onChange={setAreaFilter}
              />
            </div>
            {!access.hasFullAccess && !availableSimulationSizes.length && (
              <UpgradePanel
                access={access}
                title="Timed simulations need an upgrade"
                detail={
                  access.isExpired
                    ? `Your ${paidAccessDays}-day access ended. Purchase again to resume timed simulations.`
                    : "Your remaining sample questions are below the shortest simulation. Use Practice for the last sample questions, or unlock every timed sprint."
                }
              />
            )}
            <button
              className="primary-action"
              type="button"
              onClick={startSimulation}
              disabled={!canStartSimulation || !selectedSizeAllowed}
            >
              <Play aria-hidden="true" size={18} />
              Start simulation
            </button>
          </section>

          <aside className="panel">
            <p className="eyebrow">Real exam structure</p>
            <h3>
              {selectedModel.questionCount} questions in {formatTime(selectedModel.timeLimitMinutes)}
            </h3>
            <p className="muted">
              {selectedModel.scoredQuestions} scored and {selectedModel.unscoredQuestions} unscored.
            </p>
            <p className="muted">
              {simulationFocus
                ? `This focused sprint pulls from ${simulationFocus.id}: ${simulationFocus.name}.`
                : selectedModel.focus}
            </p>
            <p className="muted">
              Practice questions available in this model: {questions.length}.
              {!access.hasFullAccess && ` Free sample questions available now: ${availableQuestionCount}.`}
            </p>
          </aside>
        </div>
      </section>
    );
  }

  if (finished) {
    const misses = simulationQuestions.filter(
      (question) => answers[question.id] !== question.answerIndex,
    );

    return (
      <section className="view-stack">
        <div className="results-panel">
          <Trophy aria-hidden="true" size={34} />
          <p className="eyebrow">Simulation complete</p>
          <h2>{scorePercent}%</h2>
          <p>
            {score} correct out of {simulationQuestions.length}. {answeredCount} answered,{" "}
            {flagged.length} flagged.
          </p>
          <div className="hero-actions">
            <button
              className="primary-action"
              type="button"
              onClick={startSimulation}
              disabled={!canStartSimulation || !selectedSizeAllowed}
            >
              Run again
            </button>
            <button className="secondary-action" type="button" onClick={() => setSimulationQuestions([])}>
              Change length
            </button>
          </div>
        </div>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h3>Missed items</h3>
            </div>
          </div>
          {misses.length ? (
            <div className="miss-list">
              {misses.map((question) => (
                <article className="miss-item" key={question.id}>
                  <span style={{ backgroundColor: domainMap.get(question.domain)?.color }} />
                  <div>
                    <strong>{question.stem}</strong>
                    <p>{question.rationale}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 aria-hidden="true" size={24} />
              <p>Clean run. Keep rotating domains so the confidence is earned.</p>
            </div>
          )}
        </section>
      </section>
    );
  }

  const domain = domainMap.get(activeQuestion.domain)!;
  const activeAreaId = getQuestionArea(activeQuestion, examModel);
  const area = examAreaMap.get(areaKey(examModel, activeAreaId))!;

  return (
    <section className="view-stack">
      <div className="sim-toolbar">
        <div>
          <p className="eyebrow">Question {index + 1} of {simulationQuestions.length}</p>
          <h2>{formatCountdown(secondsLeft)}</h2>
        </div>
        <div className="sim-progress">
          <span>{answeredCount} answered</span>
          <span>{flagged.length} flagged</span>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={finishSimulation}
          disabled={isFinishing}
        >
          {isFinishing ? "Saving..." : "Finish"}
        </button>
      </div>

      <article className="question-panel">
        <div className="question-meta">
          <span className="domain-chip" style={{ borderColor: domain.color }}>
            {domain.name}
          </span>
          <span className="area-chip" title={area.name}>
            {activeAreaId} · {area.name}
          </span>
          <span>{activeQuestion.skill}</span>
          <button
            className="icon-action"
            type="button"
            aria-label="Flag question"
            onClick={() =>
              setFlagged((current) =>
                current.includes(activeQuestion.id)
                  ? current.filter((id) => id !== activeQuestion.id)
                  : [...current, activeQuestion.id],
              )
            }
          >
            <Flag
              size={18}
              fill={flagged.includes(activeQuestion.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <h3>{activeQuestion.stem}</h3>

        <div className="option-list" role="radiogroup" aria-label="Simulation answer options">
          {activeQuestion.options.map((option, optionIndex) => (
            <button
              key={option}
              className={`option-button ${selectedIndex === optionIndex ? "is-picked" : ""}`}
              type="button"
              onClick={() =>
                setAnswers((current) => ({ ...current, [activeQuestion.id]: optionIndex }))
              }
            >
              <span>{String.fromCharCode(65 + optionIndex)}</span>
              <p>{option}</p>
            </button>
          ))}
        </div>

        <div className="question-actions split">
          <button
            className="secondary-action"
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0}
          >
            <ChevronLeft aria-hidden="true" size={18} />
            Previous
          </button>
          <button
            className="secondary-action"
            type="button"
            onClick={() => setIndex((current) => Math.min(simulationQuestions.length - 1, current + 1))}
            disabled={index === simulationQuestions.length - 1}
          >
            Next
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </article>
    </section>
  );
}

function FlashcardView() {
  const [domainFilter, setDomainFilter] = useState<DomainId | "all">("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filteredCards = useMemo(() => {
    if (domainFilter === "all") return flashcards;
    return flashcards.filter((card) => card.domain === domainFilter);
  }, [domainFilter]);

  const card = filteredCards[index % filteredCards.length];
  const domain = domainMap.get(card.domain)!;

  const changeFilter = (domainId: DomainId | "all") => {
    setDomainFilter(domainId);
    setIndex(0);
    setFlipped(false);
  };

  const nextCard = () => {
    setIndex((current) => (current + 1) % filteredCards.length);
    setFlipped(false);
  };

  return (
    <section className="view-stack">
      <div className="section-heading wide">
        <div>
          <p className="eyebrow">Flashcards</p>
          <h2>High-yield recall</h2>
        </div>
        <div className="segmented-control" aria-label="Flashcard domain filter">
          <button
            type="button"
            className={domainFilter === "all" ? "is-selected" : ""}
            onClick={() => changeFilter("all")}
          >
            All
          </button>
          {domains.map((item) => (
            <button
              key={item.id}
              type="button"
              className={domainFilter === item.id ? "is-selected" : ""}
              onClick={() => changeFilter(item.id)}
            >
              {item.shortName}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`flashcard ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped((current) => !current)}
      >
        <span className="domain-chip" style={{ borderColor: domain.color }}>
          {domain.shortName}
        </span>
        <strong>{flipped ? card.back : card.front}</strong>
        <small>{flipped ? "Answer" : "Prompt"}</small>
      </button>

      <div className="question-actions">
        <button className="secondary-action" type="button" onClick={() => setFlipped(false)}>
          Front
        </button>
        <button className="primary-action" type="button" onClick={nextCard}>
          Next card
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  );
}

function PlannerView({
  progress,
  toggleTask,
  updateTargetDate,
  setView,
}: {
  progress: ProgressState;
  toggleTask: (taskId: string) => void;
  updateTargetDate: (targetDate: string) => void;
  setView: (view: View) => void;
}) {
  const daysUntil = getDaysUntil(progress.targetDate);
  const completePercent = Math.round((progress.completedTasks.length / planTasks.length) * 100);

  return (
    <section className="view-stack">
      <div className="planner-hero">
        <div>
          <p className="eyebrow">Study planner</p>
          <h2>{completePercent}% plan complete</h2>
          <p className="muted">
            {daysUntil === null
              ? "Choose a target date."
              : daysUntil >= 0
                ? `${daysUntil} days until your target date.`
                : "Your target date has passed."}
          </p>
        </div>
        <label className="date-field" htmlFor="targetDate">
          Target date
          <input
            id="targetDate"
            type="date"
            value={progress.targetDate}
            onChange={(event) => updateTargetDate(event.target.value)}
          />
        </label>
      </div>

      <div className="planner-grid">
        {planTasks.map((task) => {
          const completed = progress.completedTasks.includes(task.id);
          return (
            <article className={completed ? "task-card is-complete" : "task-card"} key={task.id}>
              <button
                className="task-check"
                type="button"
                aria-label={completed ? "Mark task incomplete" : "Mark task complete"}
                onClick={() => toggleTask(task.id)}
              >
                {completed ? <CheckCircle2 size={20} /> : <span />}
              </button>
              <div>
                <span>{task.week}</span>
                <h3>{task.title}</h3>
                <p>{task.detail}</p>
              </div>
            </article>
          );
        })}
      </div>

      <section className="panel planner-cta">
        <div>
          <p className="eyebrow">Next study block</p>
          <h3>Use missed rationales to choose tomorrow's review.</h3>
        </div>
        <button className="primary-action" type="button" onClick={() => setView("practice")}>
          Go to practice
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </section>
    </section>
  );
}

export default App;
