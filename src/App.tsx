import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Flag,
  BookHeart,
  HeartHandshake,
  Layers3,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trophy,
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

const initialProgress: ProgressState = {
  attempts: [],
  bookmarks: [],
  completedTasks: [],
  targetDate: "2026-08-03",
};

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

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key);
    if (!stored) return initialValue;

    try {
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
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
) {
  if (areaFilter !== "all") {
    return shuffle(
      questions.filter((question) => getQuestionArea(question, examModel) === areaFilter),
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
        shuffle(questions.filter((question) => areaIds.includes(question.area))).slice(0, count),
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
      shuffle(questions.filter((question) => question.domain === domain.id)).slice(0, count),
    ),
  );
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [progress, setProgress] = useLocalStorage<ProgressState>(
    "aswb-clinical-prep-progress-v1",
    initialProgress,
  );

  const stats = useMemo(() => buildStats(progress), [progress]);

  const recordAttempt = (
    question: Question,
    selectedIndex: number,
    confidence: number,
    examModel: ExamModelId = defaultExamModel,
  ) => {
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
    const confirmed = window.confirm("Reset all saved attempts, bookmarks, and planner progress?");
    if (confirmed) setProgress(initialProgress);
  };

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
            <h1>ASWB Clinical Prep Studio</h1>
          </div>
        </div>

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
      </header>

      {view === "dashboard" && (
        <Dashboard
          stats={stats}
          progress={progress}
          setView={setView}
          resetProgress={resetProgress}
        />
      )}
      {view === "practice" && (
        <PracticeView
          progress={progress}
          recordAttempt={recordAttempt}
          toggleBookmark={toggleBookmark}
        />
      )}
      {view === "simulation" && <SimulationView recordAttempt={recordAttempt} />}
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

function Dashboard({
  stats,
  progress,
  setView,
  resetProgress,
}: {
  stats: ReturnType<typeof buildStats>;
  progress: ProgressState;
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
              <p className="eyebrow">Local data</p>
              <h3>Saved in this browser</h3>
            </div>
          </div>
          <p className="muted">
            Attempts, bookmarks, and planner checks are stored locally on this machine.
          </p>
          <button className="danger-action" type="button" onClick={resetProgress}>
            <RotateCcw aria-hidden="true" size={17} />
            Reset progress
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
  recordAttempt,
  toggleBookmark,
}: {
  progress: ProgressState;
  recordAttempt: (
    question: Question,
    selectedIndex: number,
    confidence: number,
    examModel?: ExamModelId,
  ) => void;
  toggleBookmark: (questionId: string) => void;
}) {
  const [examModel, setExamModel] = useState<ExamModelId>(defaultExamModel);
  const [domainFilter, setDomainFilter] = useState<DomainId | "all">("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [practiceQueue, setPracticeQueue] = useState<Question[]>(() => shuffle(questions));
  const [sessionStats, setSessionStats] = useState({
    answered: 0,
    correct: 0,
    review: 0,
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesDomain = domainFilter === "all" || question.domain === domainFilter;
      const matchesArea =
        areaFilter === "all" || getQuestionArea(question, examModel) === areaFilter;
      return matchesDomain && matchesArea;
    });
  }, [areaFilter, domainFilter, examModel]);

  const activeQuestions = practiceQueue.length ? practiceQueue : filteredQuestions;
  const question = activeQuestions[index % activeQuestions.length];
  const domain = domainMap.get(question.domain)!;
  const areaId = getQuestionArea(question, examModel);
  const area = examAreaMap.get(areaKey(examModel, areaId))!;
  const isBookmarked = progress.bookmarks.includes(question.id);
  const currentQuestionNumber = (index % activeQuestions.length) + 1;
  const positionPercent = Math.round((currentQuestionNumber / activeQuestions.length) * 100);

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
    if (selectedIndex === null || revealed) return;
    const correct = selectedIndex === question.answerIndex;
    recordAttempt(question, selectedIndex, confidence, examModel);
    setSessionStats((current) => ({
      answered: current.answered + 1,
      correct: current.correct + (correct ? 1 : 0),
      review: current.review + (correct ? 0 : 1),
    }));
    setRevealed(true);
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
          <ExamModelSelector value={examModel} onChange={changeExamModel} />
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
          <div className="question-meta">
            <span className="domain-chip" style={{ borderColor: domain.color }}>
              {domain.name}
            </span>
            <span className="area-chip" title={area.name}>
              {areaId} · {area.name}
            </span>
            <span>{question.skill}</span>
            <span>{question.difficulty}</span>
            <button
              className="icon-action"
              type="button"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
              onClick={() => toggleBookmark(question.id)}
            >
              {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>

          <h3>{question.stem}</h3>

          <div className="option-list" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, optionIndex) => {
              const isSelected = selectedIndex === optionIndex;
              const isCorrect = question.answerIndex === optionIndex;
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
                  onClick={() => !revealed && setSelectedIndex(optionIndex)}
                  aria-pressed={isSelected}
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
              disabled={revealed}
            />
            <strong>{confidence}/5</strong>
          </div>

          {revealed && (
            <div className="rationale-box">
              <strong>{selectedIndex === question.answerIndex ? "Correct" : "Review this one"}</strong>
              <p>{question.rationale}</p>
              <p className="exam-lens">{question.examLens}</p>
            </div>
          )}

          <div className="question-actions">
            <button
              className="primary-action"
              type="button"
              onClick={submitAnswer}
              disabled={selectedIndex === null || revealed}
            >
              Submit
            </button>
            <button className="secondary-action" type="button" onClick={nextQuestion}>
              {revealed ? "Next" : "Skip"}
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
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
  recordAttempt,
}: {
  recordAttempt: (
    question: Question,
    selectedIndex: number,
    confidence: number,
    examModel?: ExamModelId,
  ) => void;
}) {
  const [examModel, setExamModel] = useState<ExamModelId>(defaultExamModel);
  const [size, setSize] = useState(24);
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [simulationQuestions, setSimulationQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const activeQuestion = simulationQuestions[index];
  const selectedIndex = activeQuestion ? answers[activeQuestion.id] : undefined;
  const selectedModel = examModels.find((model) => model.id === examModel)!;
  const simulationSizes = examModel === "2026" ? [12, 24, 60, 122] : [20, 50, 85, 170];
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
    const nextQuestions = makeSimulation(size, areaFilter, examModel);
    setSimulationQuestions(nextQuestions);
    setAnswers({});
    setFlagged([]);
    setIndex(0);
    setFinished(false);
    setSecondsLeft(timerMinutes * 60);
  };

  const finishSimulation = () => {
    simulationQuestions.forEach((question) => {
      const answer = answers[question.id];
      if (answer !== undefined) recordAttempt(question, answer, 3, examModel);
    });
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
            <button className="primary-action" type="button" onClick={startSimulation}>
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
            <button className="primary-action" type="button" onClick={startSimulation}>
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
        <button className="primary-action" type="button" onClick={finishSimulation}>
          Finish
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
