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
  Question,
  domains,
  examFacts,
  flashcards,
  planTasks,
  questions,
} from "./data/exam";

type View = "dashboard" | "practice" | "simulation" | "flashcards" | "planner";

interface Attempt {
  questionId: string;
  domain: DomainId;
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

function makeSimulation(size: number) {
  const quotas = domains.map((domain) => ({
    domain,
    count: Math.max(1, Math.round(size * (domain.percent / 100))),
  }));

  while (quotas.reduce((sum, item) => sum + item.count, 0) > size) {
    const largest = quotas.reduce((best, item) => (item.count > best.count ? item : best), quotas[0]);
    largest.count -= 1;
  }

  while (quotas.reduce((sum, item) => sum + item.count, 0) < size) {
    const smallest = quotas.reduce((best, item) => (item.count < best.count ? item : best), quotas[0]);
    smallest.count += 1;
  }

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

  const recordAttempt = (question: Question, selectedIndex: number, confidence: number) => {
    setProgress((current) => ({
      ...current,
      attempts: [
        ...current.attempts,
        {
          questionId: question.id,
          domain: question.domain,
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
            <p className="eyebrow">Independent 2026 Clinical prep</p>
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

  return (
    <section className="view-stack">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Clinical readiness cockpit</p>
          <h2>Practice the judgment the 2026 exam is built to measure.</h2>
          <p className="hero-text">
            Blueprint-weighted review, original clinical scenarios, rationales, flashcards,
            and a timer tuned to the 122-question, four-hour format.
          </p>
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
            <small>Weighted readiness</small>
          </div>
        </div>
      </div>

      <div className="stat-grid" aria-label="Progress summary">
        <MetricCard icon={Trophy} label="Readiness" value={`${stats.readiness}%`} detail="Weighted by blueprint" />
        <MetricCard icon={Target} label="Accuracy" value={`${stats.overallAccuracy}%`} detail={`${stats.totalAttempts} attempts`} />
        <MetricCard icon={ClipboardCheck} label="Coverage" value={`${stats.coverage}%`} detail={`${stats.uniqueAnswered}/${questions.length} questions`} />
        <MetricCard
          icon={CalendarDays}
          label="Target"
          value={daysUntil === null ? "Unset" : daysUntil >= 0 ? `${daysUntil} days` : "Past"}
          detail={progress.targetDate || "Choose a date"}
        />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">2026 Clinical blueprint</p>
              <h3>Domain balance</h3>
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
                {examFacts.totalQuestions} total, {examFacts.unscoredQuestions} unscored
              </dd>
            </div>
            <div>
              <dt>Time limit</dt>
              <dd>{formatTime(examFacts.timeLimitMinutes)}</dd>
            </div>
            <div>
              <dt>Question style</dt>
              <dd>More applied knowledge and three-option items</dd>
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

function PracticeView({
  progress,
  recordAttempt,
  toggleBookmark,
}: {
  progress: ProgressState;
  recordAttempt: (question: Question, selectedIndex: number, confidence: number) => void;
  toggleBookmark: (questionId: string) => void;
}) {
  const [domainFilter, setDomainFilter] = useState<DomainId | "all">("all");
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [sessionStats, setSessionStats] = useState({
    answered: 0,
    correct: 0,
    review: 0,
  });

  const filteredQuestions = useMemo(() => {
    if (domainFilter === "all") return questions;
    return questions.filter((question) => question.domain === domainFilter);
  }, [domainFilter]);

  const question = filteredQuestions[index % filteredQuestions.length];
  const domain = domainMap.get(question.domain)!;
  const isBookmarked = progress.bookmarks.includes(question.id);
  const currentQuestionNumber = (index % filteredQuestions.length) + 1;
  const positionPercent = Math.round((currentQuestionNumber / filteredQuestions.length) * 100);

  const resetQuestionState = () => {
    setSelectedIndex(null);
    setRevealed(false);
    setConfidence(3);
  };

  const changeFilter = (domainId: DomainId | "all") => {
    setDomainFilter(domainId);
    setIndex(0);
    resetQuestionState();
  };

  const submitAnswer = () => {
    if (selectedIndex === null || revealed) return;
    const correct = selectedIndex === question.answerIndex;
    recordAttempt(question, selectedIndex, confidence);
    setSessionStats((current) => ({
      answered: current.answered + 1,
      correct: current.correct + (correct ? 1 : 0),
      review: current.review + (correct ? 0 : 1),
    }));
    setRevealed(true);
  };

  const nextQuestion = () => {
    setIndex((current) => (current + 1) % filteredQuestions.length);
    resetQuestionState();
  };

  return (
    <section className="view-stack">
      <div className="section-heading wide">
        <div>
          <p className="eyebrow">Question lab</p>
          <h2>Practice with rationales</h2>
        </div>
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

      <div className="practice-progress-panel" aria-label="Practice progress">
        <div className="practice-position">
          <span>Current question</span>
          <strong>
            {currentQuestionNumber} of {filteredQuestions.length}
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
          onClick={() => setSessionStats({ answered: 0, correct: 0, review: 0 })}
          aria-label="Reset practice session counters"
        >
          <RotateCcw aria-hidden="true" size={16} />
          Reset
        </button>
      </div>

      <div className="practice-layout">
        <article className="question-panel">
          <div className="question-meta">
            <span className="domain-chip" style={{ borderColor: domain.color }}>
              {domain.name}
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
              Next
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
  recordAttempt: (question: Question, selectedIndex: number, confidence: number) => void;
}) {
  const [size, setSize] = useState(24);
  const [simulationQuestions, setSimulationQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const activeQuestion = simulationQuestions[index];
  const selectedIndex = activeQuestion ? answers[activeQuestion.id] : undefined;
  const timerMinutes = Math.max(5, Math.round((size / examFacts.totalQuestions) * examFacts.timeLimitMinutes));

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
    const nextQuestions = makeSimulation(size);
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
      if (answer !== undefined) recordAttempt(question, answer, 3);
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
            <div className="sim-options" aria-label="Simulation length">
              {[12, 24, 30].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={size === option ? "is-selected" : ""}
                  onClick={() => setSize(option)}
                >
                  <strong>{option}</strong>
                  <span>{formatTime(Math.round((option / examFacts.totalQuestions) * examFacts.timeLimitMinutes))}</span>
                </button>
              ))}
            </div>
            <button className="primary-action" type="button" onClick={startSimulation}>
              <Play aria-hidden="true" size={18} />
              Start simulation
            </button>
          </section>

          <aside className="panel">
            <p className="eyebrow">Real exam structure</p>
            <h3>{examFacts.totalQuestions} questions in {formatTime(examFacts.timeLimitMinutes)}</h3>
            <p className="muted">
              This local sprint preserves the 2026 blueprint weighting and pacing ratio while using
              the original question bank included in this app.
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
