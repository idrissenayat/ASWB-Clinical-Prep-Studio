export type DomainId = "ethics" | "assessment" | "intervention";
export type ExamAreaId =
  | "IA"
  | "IB"
  | "IC"
  | "IIA"
  | "IIB"
  | "IIC"
  | "IIIA"
  | "IIIB"
  | "IIIC"
  | "IIID"
  | "IVA"
  | "IVB"
  | "IVC";
export type ExamModelId = "2026" | "pre2026";
export type SkillType = "recall" | "application" | "reasoning";
export type Difficulty = "foundation" | "applied" | "exam-ready";

export interface Domain {
  id: DomainId;
  name: string;
  shortName: string;
  percent: number;
  color: string;
  competencies: string[];
  focus: string;
}

export interface Question {
  id: string;
  domain: DomainId;
  area: ExamAreaId;
  area2026: ExamAreaId;
  competency: string;
  skill: SkillType;
  difficulty: Difficulty;
  tags: string[];
  stem: string;
  options: string[];
  answerIndex: number;
  rationale: string;
  examLens: string;
}

export type QuestionInput = Omit<Question, "area" | "area2026"> & {
  area?: ExamAreaId;
  area2026?: ExamAreaId;
};

export interface ExamArea {
  id: ExamAreaId;
  domain: DomainId;
  name: string;
  focus: string;
}

export interface ExamModel {
  id: ExamModelId;
  label: string;
  shortLabel: string;
  questionCount: number;
  scoredQuestions: number;
  unscoredQuestions: number;
  timeLimitMinutes: number;
  blueprint: string;
  focus: string;
}

export interface Flashcard {
  id: string;
  domain: DomainId;
  front: string;
  back: string;
}

export const examFacts = {
  transitionDate: "August 3, 2026",
  totalQuestions: 122,
  scoredQuestions: 110,
  unscoredQuestions: 12,
  timeLimitMinutes: 240,
  currentBeforeTransitionQuestions: 170,
  currentBeforeTransitionScoredQuestions: 150,
  currentBeforeTransitionUnscored: 20,
};

export const domains: Domain[] = [
  {
    id: "ethics",
    name: "Values and Ethics",
    shortName: "Ethics",
    percent: 36,
    color: "#cf5a3d",
    competencies: [
      "Professional values",
      "Ethical responsibilities",
      "Confidentiality, consent, and boundaries",
      "Equity, culture, and client rights",
    ],
    focus:
      "Safety, scope, consent, confidentiality, boundaries, documentation, and client self-determination.",
  },
  {
    id: "assessment",
    name: "Assessment and Planning",
    shortName: "Assessment",
    percent: 32,
    color: "#257c7a",
    competencies: [
      "Human development",
      "Assessment concepts",
      "Clinical interviewing",
      "Diagnosis and treatment planning",
    ],
    focus:
      "Biopsychosocial assessment, risk, diagnosis, trauma, culture, strengths, goals, and service planning.",
  },
  {
    id: "intervention",
    name: "Intervention and Practice",
    shortName: "Practice",
    percent: 32,
    color: "#6b6f2a",
    competencies: [
      "Helping relationships",
      "Evidence-informed interventions",
      "Crisis response",
      "Groups, families, and systems practice",
    ],
    focus:
      "Engagement, intervention selection, communication, crisis work, collaboration, evaluation, and termination.",
  },
];

export const examModels: ExamModel[] = [
  {
    id: "2026",
    label: "On/after Aug. 3, 2026",
    shortLabel: "2026 blueprint",
    questionCount: examFacts.totalQuestions,
    scoredQuestions: examFacts.scoredQuestions,
    unscoredQuestions: examFacts.unscoredQuestions,
    timeLimitMinutes: examFacts.timeLimitMinutes,
    blueprint: "2026 Clinical examination content outline",
    focus:
      "ASWB 2026 blueprint: three content areas, 122 total questions, 12 unscored, four-hour pacing, and a higher proportion of applied-knowledge questions.",
  },
  {
    id: "pre2026",
    label: "Before Aug. 3, 2026",
    shortLabel: "2018 blueprint",
    questionCount: examFacts.currentBeforeTransitionQuestions,
    scoredQuestions: examFacts.currentBeforeTransitionScoredQuestions,
    unscoredQuestions: examFacts.currentBeforeTransitionUnscored,
    timeLimitMinutes: examFacts.timeLimitMinutes,
    blueprint: "2018 Clinical Social Work Licensing Examination content outline",
    focus:
      "ASWB 2018 blueprint: four content areas, 170 total questions, 20 unscored, four-hour pacing, and three- and four-option questions with more four-option items.",
  },
];

export const examAreas2026: ExamArea[] = [
  {
    id: "IA",
    domain: "ethics",
    name: "Ethical Principles and Responsibilities",
    focus: "Confidentiality, informed consent, ethical dilemmas, professional values, competence, and self-care.",
  },
  {
    id: "IB",
    domain: "ethics",
    name: "Ethical Service Delivery",
    focus: "Self-determination, boundaries, mandated reporting, documentation, billing, termination, technology, and supervision ethics.",
  },
  {
    id: "IC",
    domain: "ethics",
    name: "Diversity and Social Justice",
    focus: "Anti-oppressive practice, social justice, identity, access, privilege, bias, immigration, and marginalized communities.",
  },
  {
    id: "IIA",
    domain: "assessment",
    name: "Assessment Concepts",
    focus: "Trauma, family dynamics, abuse, mental health indicators, substance use, development, culture, and person-in-environment factors.",
  },
  {
    id: "IIB",
    domain: "assessment",
    name: "Assessment Methods and Techniques",
    focus: "Risk assessment, interviewing, DSM use, mental status exams, collateral data, strengths, motivation, and confidential information gathering.",
  },
  {
    id: "IIC",
    domain: "assessment",
    name: "Assessment Practices",
    focus: "Resources, goal and treatment planning, triage, modality selection, medications, cultural planning, and termination readiness.",
  },
  {
    id: "IIIA",
    domain: "intervention",
    name: "Practice Concepts",
    focus: "Helping relationships, strengths-based work, collaboration, problem solving, policy impacts, parenting, and formal documentation.",
  },
  {
    id: "IIIB",
    domain: "intervention",
    name: "Intervention Methods and Techniques",
    focus: "Trauma-informed care, communication, crisis intervention, evidence-based practice, coping skills, advocacy, case management, group, family, and addiction work.",
  },
  {
    id: "IIIC",
    domain: "intervention",
    name: "Practice Evaluation and Research",
    focus: "Progress evaluation, outcomes, program objectives, quality assurance, research design, data collection, reliability, and validity.",
  },
  {
    id: "IIID",
    domain: "intervention",
    name: "Supervision and Administration",
    focus: "Supervision, consultation, policy and procedure development, risk management, organizations, fiscal management, and resource allocation.",
  },
];

export const examAreasPre2026: ExamArea[] = [
  {
    id: "IA",
    domain: "assessment",
    name: "Human Growth and Development",
    focus: "Lifespan development, attachment, aging, personality theories, family life cycle, grief, genetics, and biopsychosocial functioning.",
  },
  {
    id: "IB",
    domain: "assessment",
    name: "Human Behavior in the Social Environment",
    focus: "Person-in-environment, family and group dynamics, systems perspectives, addiction, trauma effects, crisis, and social institutions.",
  },
  {
    id: "IC",
    domain: "assessment",
    name: "Diversity and Discrimination",
    focus: "Culture, race, ethnicity, immigration, sexual orientation, gender identity, disability, discrimination, oppression, and social justice.",
  },
  {
    id: "IIA",
    domain: "assessment",
    name: "Biopsychosocial History and Collateral Data",
    focus: "Biopsychosocial assessment, collateral records, sensitive information, active listening, observation, and neurologic or organic symptoms.",
  },
  {
    id: "IIB",
    domain: "assessment",
    name: "Assessment and Diagnosis",
    focus: "Problem formulation, mental status exams, testing, psychosocial stress, exploitation, trauma, risk, strengths, motivation, and diagnosis.",
  },
  {
    id: "IIC",
    domain: "assessment",
    name: "Treatment Planning",
    focus: "Treatment goals, intervention planning, level of care, service planning, client readiness, resources, referrals, and termination planning.",
  },
  {
    id: "IIIA",
    domain: "intervention",
    name: "Therapeutic Relationship",
    focus: "Helping relationship, acceptance, empathy, transparency, power, communication, role clarity, feedback, and violence impacts on engagement.",
  },
  {
    id: "IIIB",
    domain: "intervention",
    name: "The Intervention Process",
    focus: "Interviewing, engagement, treatment phases, problem solving, crisis intervention, psychotherapies, coping skills, group work, and family work.",
  },
  {
    id: "IIIC",
    domain: "intervention",
    name: "Service Delivery and Management of Cases",
    focus: "Case management, advocacy, policies, service delivery, community resources, case recording, program evaluation, and quality assurance.",
  },
  {
    id: "IIID",
    domain: "intervention",
    name: "Consultation and Interdisciplinary Collaboration",
    focus: "Leadership, supervision, consultation, case presentations, formal documents, networking, teams, community participation, and governance.",
  },
  {
    id: "IVA",
    domain: "ethics",
    name: "Professional Values and Ethical Issues",
    focus: "Ethical dilemmas, client rights, refusal of services, boundaries, dual relationships, informed consent, documentation, termination, research ethics, and worker safety.",
  },
  {
    id: "IVB",
    domain: "ethics",
    name: "Confidentiality",
    focus: "Client records, confidentiality, electronic information security, mandatory reporting, abuse, threats of harm, and impaired professionals.",
  },
  {
    id: "IVC",
    domain: "ethics",
    name: "Professional Development and Use of Self",
    focus: "Professional values, objectivity, self-determination, use of self, transference, countertransference, self-care, burnout, secondary trauma, and professional development.",
  },
];

export const examAreasByModel: Record<ExamModelId, ExamArea[]> = {
  "2026": examAreas2026,
  pre2026: examAreasPre2026,
};

export const examAreas = examAreasPre2026;

export const questionBankTotal = 2500;

export const questionCountsByDomain: Record<DomainId, number> = {
  ethics: 900,
  assessment: 800,
  intervention: 800,
};

export const questionCountsByArea: Record<ExamModelId, Record<ExamAreaId, number>> = {
  "2026": {
    IA: 382,
    IB: 391,
    IC: 127,
    IIA: 375,
    IIB: 320,
    IIC: 105,
    IIIA: 97,
    IIIB: 509,
    IIIC: 99,
    IIID: 95,
    IVA: 0,
    IVB: 0,
    IVC: 0,
  },
  pre2026: {
    IA: 59,
    IB: 105,
    IC: 54,
    IIA: 157,
    IIB: 372,
    IIC: 53,
    IIIA: 53,
    IIIB: 500,
    IIIC: 104,
    IIID: 143,
    IVA: 444,
    IVB: 259,
    IVC: 197,
  },
};

export const freeQuestionCountsByArea: Record<ExamModelId, Record<ExamAreaId, number>> = {
  "2026": {
    IA: 9,
    IB: 13,
    IC: 3,
    IIA: 13,
    IIB: 10,
    IIC: 2,
    IIIA: 0,
    IIIB: 23,
    IIIC: 2,
    IIID: 0,
    IVA: 0,
    IVB: 0,
    IVC: 0,
  },
  pre2026: {
    IA: 7,
    IB: 3,
    IC: 2,
    IIA: 1,
    IIB: 11,
    IIC: 1,
    IIIA: 4,
    IIIB: 16,
    IIIC: 5,
    IIID: 0,
    IVA: 12,
    IVB: 8,
    IVC: 5,
  },
};

export const planTasks = [
  {
    id: "plan-1",
    week: "Foundation",
    title: "Map the 2026 blueprint",
    detail: "Review the three content areas, note your weakest competencies, and set a target exam date.",
  },
  {
    id: "plan-2",
    week: "Foundation",
    title: "Build the safety-first reflex",
    detail: "Drill mandated reporting, suicide risk, duty to protect, medical red flags, and informed consent.",
  },
  {
    id: "plan-3",
    week: "Assessment",
    title: "Practice risk and differential assessment",
    detail: "Complete mixed assessment questions and write one-line reasons for ruled-out options.",
  },
  {
    id: "plan-4",
    week: "Assessment",
    title: "Write treatment goals",
    detail: "Convert common presenting problems into measurable, client-centered goals.",
  },
  {
    id: "plan-5",
    week: "Intervention",
    title: "Sequence interventions",
    detail: "Sort crisis, engagement, stabilization, skill-building, processing, evaluation, and termination actions.",
  },
  {
    id: "plan-6",
    week: "Intervention",
    title: "Run a timed sprint",
    detail: "Complete a timed simulation, then review every missed or low-confidence item.",
  },
  {
    id: "plan-7",
    week: "Exam week",
    title: "Tighten pacing",
    detail: "Use 24-question blocks to practice the four-hour pace and flag-review rhythm.",
  },
  {
    id: "plan-8",
    week: "Exam week",
    title: "Final readiness review",
    detail: "Review bookmarked rationales, ethics rules, risk protocols, and your calm test-day routine.",
  },
];
