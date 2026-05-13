export type DomainId = "ethics" | "assessment" | "intervention";
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

export const questions: Question[] = [
  {
    id: "eth-001",
    domain: "ethics",
    competency: "Confidentiality and professional boundaries",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["confidentiality", "social media", "boundaries"],
    stem:
      "A client posts a public online review naming the clinical social worker and describing dissatisfaction with treatment. What is the BEST response by the social worker?",
    options: [
      "Post a brief public reply clarifying the clinical facts without naming the client",
      "Avoid a public clinical response and consider addressing the concern privately in session if clinically appropriate",
      "Ask the platform to remove the review because it involves confidential services",
    ],
    answerIndex: 1,
    rationale:
      "A public response can confirm the client relationship and risk confidentiality. The safer response is to avoid public clinical discussion and address the concern through appropriate private channels.",
    examLens:
      "When confidentiality is in play, protect the client relationship before trying to correct the record.",
  },
  {
    id: "eth-002",
    domain: "ethics",
    competency: "Duty to protect and mandated action",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["duty to protect", "threat assessment", "safety"],
    stem:
      "During a session, a client describes a specific plan to seriously harm a former partner after leaving the office. What should the social worker do FIRST?",
    options: [
      "Assess immediacy, intent, access to means, and identifiable victim risk",
      "Ask the client to sign a no-harm contract",
      "Terminate the session and document the client's statement",
      "Refer the client to long-term anger management treatment",
    ],
    answerIndex: 0,
    rationale:
      "The social worker must rapidly clarify the level of imminent risk and then take required protective steps. A no-harm contract or routine referral does not address immediate danger.",
    examLens:
      "For risk questions, first determine the seriousness and immediacy unless danger is already unmistakable.",
  },
  {
    id: "eth-003",
    domain: "ethics",
    competency: "Boundaries and dual relationships",
    skill: "application",
    difficulty: "applied",
    tags: ["gifts", "boundaries", "culture"],
    stem:
      "A client brings the social worker an expensive bracelet and says refusing it would be insulting in the client's culture. What is the BEST initial response?",
    options: [
      "Accept the gift to show cultural humility",
      "Decline immediately and remind the client that gifts are unethical",
      "Explore the meaning of the gift and discuss professional boundaries",
    ],
    answerIndex: 2,
    rationale:
      "The best answer balances cultural responsiveness with boundary management. Exploring meaning first supports the relationship while keeping professional limits clear.",
    examLens:
      "If no urgent safety issue exists, choose the answer that gathers meaning and preserves the relationship.",
  },
  {
    id: "eth-004",
    domain: "ethics",
    competency: "Record integrity",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["documentation", "supervision", "ethics"],
    stem:
      "A supervisor instructs a social worker to alter a progress note date so the agency can meet a billing deadline. What should the social worker do?",
    options: [
      "Change the date because the supervisor is responsible for billing compliance",
      "Refuse to falsify the record and follow agency procedures for ethical concerns",
      "Delete the progress note and rewrite it with the requested date",
      "Ask the client for permission to change the date",
    ],
    answerIndex: 1,
    rationale:
      "Falsifying documentation is unethical and can create legal and billing risk. The social worker should decline and use appropriate reporting or consultation channels.",
    examLens:
      "Authority does not override ethical documentation.",
  },
  {
    id: "eth-005",
    domain: "ethics",
    competency: "Informed consent",
    skill: "application",
    difficulty: "foundation",
    tags: ["court ordered", "informed consent", "role clarification"],
    stem:
      "A client arrives for a court-ordered custody evaluation and begins sharing sensitive family history. What should the social worker do FIRST?",
    options: [
      "Explain the evaluation role, limits of confidentiality, and how information may be used",
      "Complete the assessment before discussing confidentiality so rapport is not disrupted",
      "Assure the client that the information will remain private unless abuse is disclosed",
    ],
    answerIndex: 0,
    rationale:
      "In evaluative or mandated contexts, role clarity and limits of confidentiality must be addressed before collecting sensitive information.",
    examLens:
      "When the role is not traditional therapy, orient the client before proceeding.",
  },
  {
    id: "eth-006",
    domain: "ethics",
    competency: "Client rights and self-determination",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["self-determination", "treatment refusal"],
    stem:
      "An adult client with decision-making capacity refuses a recommended trauma group. There is no imminent risk. What is the BEST response?",
    options: [
      "Respect the refusal and explore the client's reasons and preferences",
      "Document noncompliance and close the case",
      "Ask a family member to persuade the client to attend",
      "Explain that therapy cannot continue unless the client joins the group",
    ],
    answerIndex: 0,
    rationale:
      "Self-determination is central when the client has capacity and no immediate safety issue exists. Exploration may reveal barriers or a better-fit intervention.",
    examLens:
      "Least coercive, client-centered responses usually beat pressure when safety is not acute.",
  },
  {
    id: "eth-007",
    domain: "ethics",
    competency: "Cultural responsiveness and communication access",
    skill: "application",
    difficulty: "applied",
    tags: ["interpreters", "culture", "access"],
    stem:
      "A client with limited English proficiency asks that her 12-year-old child interpret during a trauma assessment. What should the social worker do?",
    options: [
      "Use the child because the client requested it",
      "Use simple English and avoid emotionally difficult topics",
      "Arrange for a qualified interpreter",
    ],
    answerIndex: 2,
    rationale:
      "A qualified interpreter protects accuracy, privacy, and the child's role. Using a minor child in trauma assessment can compromise both communication and boundaries.",
    examLens:
      "Access needs should be met with qualified supports, not convenience.",
  },
  {
    id: "eth-008",
    domain: "ethics",
    competency: "Competence and consultation",
    skill: "application",
    difficulty: "foundation",
    tags: ["competence", "consultation", "scope"],
    stem:
      "A social worker trained in adult outpatient therapy receives a referral for a young child with complex feeding concerns and possible medical complications. What should the social worker do NEXT?",
    options: [
      "Accept the case and learn the specialty area while treating the child",
      "Seek supervision or refer to providers with appropriate pediatric and medical expertise",
      "Decline all contact with the family because the issue is outside social work",
    ],
    answerIndex: 1,
    rationale:
      "The issue may involve social work needs, but the worker must practice within competence and obtain consultation, supervision, or referral for specialty care.",
    examLens:
      "Scope questions reward consultation and appropriate referral, not abandonment.",
  },
  {
    id: "eth-009",
    domain: "ethics",
    competency: "Professional impairment",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["colleague impairment", "ethics", "client safety"],
    stem:
      "A social worker notices a colleague repeatedly slurring speech before sessions and missing critical documentation. What is the FIRST professional step if clients are not in immediate danger?",
    options: [
      "Discuss the concerns directly with the colleague and seek consultation as needed",
      "Report the colleague immediately to the licensing board",
      "Tell clients that the colleague may be impaired",
      "Ignore the issue because impairment is a private health matter",
    ],
    answerIndex: 0,
    rationale:
      "When there is no immediate client danger, ethical practice usually begins with direct professional concern and consultation. Escalation may be needed if the issue is not addressed.",
    examLens:
      "Use the least escalated ethical action that still protects clients.",
  },
  {
    id: "eth-010",
    domain: "ethics",
    competency: "Technology-assisted practice",
    skill: "application",
    difficulty: "applied",
    tags: ["telehealth", "emergency planning", "jurisdiction"],
    stem:
      "At the start of a telehealth session, a client says they are temporarily staying in another state. What should the social worker do FIRST?",
    options: [
      "Continue because the therapeutic relationship began in the original state",
      "Confirm the client's location and review jurisdiction, emergency contacts, and practice requirements",
      "End services permanently because telehealth across state lines is never allowed",
    ],
    answerIndex: 1,
    rationale:
      "Telehealth practice requires attention to client location, emergency response, and applicable jurisdictional rules before proceeding.",
    examLens:
      "For telehealth, location and emergency planning are part of basic clinical safety.",
  },
  {
    id: "eth-011",
    domain: "ethics",
    competency: "Research and program evaluation",
    skill: "application",
    difficulty: "foundation",
    tags: ["program evaluation", "privacy", "consent"],
    stem:
      "An agency asks a clinician to send identifiable therapy notes to a funder to demonstrate program outcomes. What is the BEST response?",
    options: [
      "Send only the records of clients who improved",
      "Provide de-identified aggregate outcomes or obtain proper authorization before sharing identifiable information",
      "Share the notes because funders are part of the service system",
      "Refuse to share any information about program outcomes",
    ],
    answerIndex: 1,
    rationale:
      "Outcome reporting can be appropriate, but identifiable client information requires proper authorization or a valid legal basis. De-identified aggregate data is the safer default.",
    examLens:
      "Protect identity while meeting legitimate administrative needs.",
  },
  {
    id: "asm-001",
    domain: "assessment",
    competency: "Risk assessment",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["suicide", "risk", "assessment"],
    stem:
      "A client with depression says, 'My family would be better off without me.' What should the social worker assess FIRST?",
    options: [
      "Whether the client has intent, a plan, access to means, and protective factors",
      "The client's family communication patterns",
      "Whether antidepressant medication is indicated",
      "The client's childhood attachment history",
    ],
    answerIndex: 0,
    rationale:
      "Possible suicidal ideation requires immediate risk assessment before broader clinical exploration or treatment planning.",
    examLens:
      "Safety assessment comes before clinical depth.",
  },
  {
    id: "asm-002",
    domain: "assessment",
    competency: "Violence and abuse assessment",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["intimate partner violence", "safety", "assessment"],
    stem:
      "A client discloses that a partner monitors their phone, controls money, and recently blocked the doorway during an argument. What should the social worker assess FIRST?",
    options: [
      "The client's readiness to file for divorce",
      "Immediate safety, escalation risk, and safe ways to communicate",
      "The partner's childhood history",
    ],
    answerIndex: 1,
    rationale:
      "Coercive control and physical intimidation raise safety concerns. The first step is assessment of immediate safety and careful communication planning.",
    examLens:
      "With possible abuse, do not push action before assessing safety and risk.",
  },
  {
    id: "asm-003",
    domain: "assessment",
    competency: "Human development",
    skill: "recall",
    difficulty: "foundation",
    tags: ["development", "child assessment"],
    stem:
      "A child can take turns in simple games, speak in short sentences, and engage in parallel play that is beginning to become cooperative. Which age range is MOST consistent with these abilities?",
    options: ["12 to 18 months", "3 to 4 years", "8 to 9 years"],
    answerIndex: 1,
    rationale:
      "Short sentences, turn taking, and emerging cooperative play are most consistent with preschool development.",
    examLens:
      "For developmental items, match the cluster of abilities rather than one isolated skill.",
  },
  {
    id: "asm-004",
    domain: "assessment",
    competency: "Mental health indicators",
    skill: "application",
    difficulty: "applied",
    tags: ["differential diagnosis", "bipolar disorder", "depression"],
    stem:
      "A client reports periods of depressed mood alternating with several days of decreased need for sleep, increased goal-directed activity, and impulsive spending. What should the social worker assess further?",
    options: [
      "Possible bipolar spectrum symptoms",
      "Possible specific phobia",
      "Possible somatic symptom disorder",
      "Possible neurocognitive disorder",
    ],
    answerIndex: 0,
    rationale:
      "Decreased need for sleep, increased activity, and impulsivity can indicate manic or hypomanic symptoms and should be assessed before treatment planning.",
    examLens:
      "Notice symptoms that change the risk and treatment pathway.",
  },
  {
    id: "asm-005",
    domain: "assessment",
    competency: "Medical and psychiatric differential",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["older adults", "delirium", "medical referral"],
    stem:
      "An 82-year-old client becomes suddenly confused over two days and reports seeing insects on the wall. Family says this is a major change. What should the social worker do FIRST?",
    options: [
      "Begin grief counseling for adjustment to aging",
      "Refer for urgent medical evaluation",
      "Use cognitive restructuring to challenge the hallucinations",
      "Schedule a dementia screening in three months",
    ],
    answerIndex: 1,
    rationale:
      "Sudden confusion and visual hallucinations in an older adult may indicate delirium or another acute medical issue requiring urgent evaluation.",
    examLens:
      "Acute change in cognition is a medical red flag.",
  },
  {
    id: "asm-006",
    domain: "assessment",
    competency: "Substance use assessment",
    skill: "application",
    difficulty: "applied",
    tags: ["motivational interviewing", "stages of change"],
    stem:
      "A client says, 'My drinking causes problems, but I am not ready to stop.' Which stage of change is MOST likely reflected?",
    options: ["Precontemplation", "Contemplation", "Maintenance"],
    answerIndex: 1,
    rationale:
      "The client recognizes a problem but is ambivalent about change, which is characteristic of contemplation.",
    examLens:
      "Ambivalence usually points to contemplation.",
  },
  {
    id: "asm-007",
    domain: "assessment",
    competency: "Cultural formulation",
    skill: "application",
    difficulty: "foundation",
    tags: ["culture", "assessment", "meaning"],
    stem:
      "A client describes distress using a culturally specific spiritual explanation unfamiliar to the social worker. What is the BEST assessment response?",
    options: [
      "Ask the client what the experience means and whether cultural or spiritual supports are helpful",
      "Document the explanation as evidence of delusional thinking",
      "Avoid the topic because spirituality is outside clinical assessment",
    ],
    answerIndex: 0,
    rationale:
      "Culturally responsive assessment explores the client's meaning, context, and supports before making clinical conclusions.",
    examLens:
      "Do not pathologize unfamiliar cultural meaning without assessment.",
  },
  {
    id: "asm-008",
    domain: "assessment",
    competency: "Treatment planning",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["goals", "planning", "client centered"],
    stem:
      "After assessment, a client identifies panic attacks as the main problem and wants to return to riding the bus. What is the BEST treatment-planning goal?",
    options: [
      "The client will understand all causes of anxiety within one month",
      "The client will ride the bus three stops with manageable anxiety within six weeks",
      "The social worker will teach anxiety theory at each session",
      "The client will avoid buses until panic disappears",
    ],
    answerIndex: 1,
    rationale:
      "A strong plan uses specific, measurable, client-valued goals connected to functioning.",
    examLens:
      "Choose measurable goals that connect to the client's stated priority.",
  },
  {
    id: "asm-009",
    domain: "assessment",
    competency: "Child safety",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["mandated reporting", "child welfare", "safety"],
    stem:
      "A teacher reports that a child has repeated unexplained bruises and becomes fearful when discussing home. What should the school social worker do?",
    options: [
      "Wait until the child confirms abuse before taking action",
      "Make a report according to mandated reporting requirements",
      "Call the parents first to ask whether discipline caused the bruises",
      "Suggest that the teacher monitor the child for another month",
    ],
    answerIndex: 1,
    rationale:
      "Reasonable suspicion of abuse triggers mandated reporting. The worker should not investigate beyond role or alert potential perpetrators first.",
    examLens:
      "Mandated reporting is based on reasonable suspicion, not proof.",
  },
  {
    id: "asm-010",
    domain: "assessment",
    competency: "Biopsychosocial assessment",
    skill: "application",
    difficulty: "foundation",
    tags: ["biopsychosocial", "strengths", "planning"],
    stem:
      "A new client presents with job loss, insomnia, diabetes, family conflict, and strong support from a faith community. What assessment approach is MOST appropriate?",
    options: [
      "Focus only on psychiatric symptoms to avoid overwhelming the client",
      "Complete a biopsychosocial-spiritual assessment that includes strengths and stressors",
      "Delay assessment until medical problems are resolved",
    ],
    answerIndex: 1,
    rationale:
      "The presenting picture includes biological, psychological, social, spiritual, risk, and strength factors. A broad assessment supports accurate planning.",
    examLens:
      "Complex presentations call for integrated assessment, not a single-lens shortcut.",
  },
  {
    id: "int-001",
    domain: "intervention",
    competency: "Motivational interviewing",
    skill: "application",
    difficulty: "applied",
    tags: ["MI", "ambivalence", "substance use"],
    stem:
      "A client says, 'I know cocaine is hurting my relationship, but it is the only thing that helps me relax.' Which response BEST reflects motivational interviewing?",
    options: [
      "You need to choose between your relationship and cocaine",
      "Part of you values the relief it brings, and part of you is worried about what it is costing you",
      "Using cocaine to relax is a sign that you need residential treatment",
    ],
    answerIndex: 1,
    rationale:
      "The response reflects ambivalence without arguing or directing. It supports change talk while preserving autonomy.",
    examLens:
      "MI answers sound reflective, collaborative, and autonomy-supportive.",
  },
  {
    id: "int-002",
    domain: "intervention",
    competency: "Crisis intervention",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["crisis", "grounding", "stabilization"],
    stem:
      "A client arrives after a community shooting, shaking and unable to describe what happened. What should the social worker do FIRST?",
    options: [
      "Ask for a detailed trauma narrative while memory is fresh",
      "Provide grounding, assess immediate safety, and help the client regain stabilization",
      "Challenge distorted beliefs about danger",
      "Begin long-term trauma processing",
    ],
    answerIndex: 1,
    rationale:
      "In acute crisis, the first task is stabilization and immediate safety. Detailed processing can occur later when the client has capacity.",
    examLens:
      "Crisis work starts with safety, stabilization, and present-moment functioning.",
  },
  {
    id: "int-003",
    domain: "intervention",
    competency: "Group work",
    skill: "application",
    difficulty: "applied",
    tags: ["groups", "facilitation", "boundaries"],
    stem:
      "In a grief group, one member repeatedly speaks for most of the session while others withdraw. What should the social worker do?",
    options: [
      "Validate the member and invite others into the discussion with clear group limits",
      "Remove the member from the group immediately",
      "Allow the member to continue because grief needs expression",
    ],
    answerIndex: 0,
    rationale:
      "The facilitator should protect the group process while respecting the member's grief. Validation plus redirection supports both individual and group needs.",
    examLens:
      "Good group answers balance one member's needs with the group contract.",
  },
  {
    id: "int-004",
    domain: "intervention",
    competency: "Cognitive behavioral interventions",
    skill: "application",
    difficulty: "foundation",
    tags: ["CBT", "anxiety", "intervention"],
    stem:
      "A client with social anxiety says, 'Everyone will laugh if I speak in the meeting.' Which intervention is MOST consistent with CBT?",
    options: [
      "Explore evidence for and against the thought and develop a balanced alternative",
      "Tell the client the thought is irrational and should be ignored",
      "Focus only on early childhood causes of anxiety",
      "Advise the client to avoid meetings until confidence returns",
    ],
    answerIndex: 0,
    rationale:
      "CBT targets the relationship between thoughts, emotions, and behavior through collaborative examination and skill practice.",
    examLens:
      "CBT answers usually test, reframe, or practice specific thoughts and behaviors.",
  },
  {
    id: "int-005",
    domain: "intervention",
    competency: "Trauma-informed practice",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["trauma", "stabilization", "sequencing"],
    stem:
      "A client with complex trauma wants to begin exposure work but is currently dissociating during most sessions. What should the social worker do NEXT?",
    options: [
      "Begin exposure immediately because the client requested it",
      "Focus on stabilization, grounding skills, and readiness before trauma processing",
      "Avoid all trauma treatment because dissociation is present",
    ],
    answerIndex: 1,
    rationale:
      "Trauma-informed sequencing prioritizes safety and stabilization before intensive trauma processing when dissociation is prominent.",
    examLens:
      "Readiness matters; do not rush trauma processing when stabilization is weak.",
  },
  {
    id: "int-006",
    domain: "intervention",
    competency: "Family intervention",
    skill: "application",
    difficulty: "applied",
    tags: ["family therapy", "communication", "structure"],
    stem:
      "During a family session, two members begin shouting over each other. What should the social worker do FIRST?",
    options: [
      "Pause the exchange and establish ground rules for respectful turn taking",
      "End therapy because the family is not ready",
      "Side with the family member who seems most distressed",
      "Ask the family to identify who is responsible for the conflict",
    ],
    answerIndex: 0,
    rationale:
      "The worker should create enough structure and safety for productive communication before deeper exploration.",
    examLens:
      "When interaction becomes unsafe or unproductive, structure the process.",
  },
  {
    id: "int-007",
    domain: "intervention",
    competency: "Care coordination",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["discharge", "systems", "resources"],
    stem:
      "A hospitalized client is medically ready for discharge but has no stable housing and limited medication access. What should the social worker prioritize?",
    options: [
      "Discharge the client because medical care is complete",
      "Coordinate a safe discharge plan addressing housing, medication access, and follow-up care",
      "Tell the client to contact shelters after leaving",
    ],
    answerIndex: 1,
    rationale:
      "Safe discharge planning requires coordination around basic needs, medication continuity, and follow-up. Leaving these unaddressed increases risk.",
    examLens:
      "Systems questions often ask for practical coordination across risks and resources.",
  },
  {
    id: "int-008",
    domain: "intervention",
    competency: "Therapeutic relationship",
    skill: "reasoning",
    difficulty: "foundation",
    tags: ["rapport", "mandated client", "anger"],
    stem:
      "A mandated client says, 'You are just another person trying to control me.' What is the BEST initial response?",
    options: [
      "You are required to be here, so cooperation is the best option",
      "It sounds like being required to come here feels frustrating and controlling",
      "That attitude will make treatment unsuccessful",
      "Let us focus on your court paperwork instead of feelings",
    ],
    answerIndex: 1,
    rationale:
      "Reflecting the client's experience can reduce defensiveness and build engagement, especially in mandated work.",
    examLens:
      "Engagement answers often validate before problem solving.",
  },
  {
    id: "int-009",
    domain: "intervention",
    competency: "Skills training",
    skill: "application",
    difficulty: "applied",
    tags: ["DBT", "self-harm", "coping skills"],
    stem:
      "A client with recurrent self-harm urges wants a concrete skill for intense emotion that peaks quickly. Which intervention is MOST appropriate?",
    options: [
      "Practice a distress tolerance strategy and create a plan for when urges escalate",
      "Interpret the unconscious meaning of self-harm urges",
      "Delay planning until the client can explain the origin of the urges",
    ],
    answerIndex: 0,
    rationale:
      "Distress tolerance and safety planning are concrete interventions for intense, high-risk emotional states.",
    examLens:
      "When risk urges are present, practical coping and safety beat insight-only work.",
  },
  {
    id: "int-010",
    domain: "intervention",
    competency: "Termination and evaluation",
    skill: "application",
    difficulty: "foundation",
    tags: ["termination", "evaluation", "relapse prevention"],
    stem:
      "A client has met treatment goals and is preparing to end therapy. What should the social worker include in termination?",
    options: [
      "Review progress, warning signs, coping plans, and options for future support",
      "Avoid discussing relapse because it may increase anxiety",
      "Introduce a new treatment goal to prevent dependency on therapy",
      "End abruptly to reinforce the client's independence",
    ],
    answerIndex: 0,
    rationale:
      "Effective termination consolidates gains, reviews maintenance plans, and clarifies future supports.",
    examLens:
      "Termination is planned, evaluative, and supportive.",
  },
];

export const flashcards: Flashcard[] = [
  {
    id: "fc-001",
    domain: "ethics",
    front: "FIRST questions: what beats rapport?",
    back: "Immediate safety, mandated reporting, duty to protect, medical emergencies, and informed consent before sensitive evaluation.",
  },
  {
    id: "fc-002",
    domain: "ethics",
    front: "Best default for boundary uncertainty",
    back: "Explore meaning, consult when needed, document, and preserve the professional relationship without creating dual-role risk.",
  },
  {
    id: "fc-003",
    domain: "ethics",
    front: "Court-ordered or evaluative role",
    back: "Clarify role, limits of confidentiality, who receives information, and how results may be used before assessment proceeds.",
  },
  {
    id: "fc-004",
    domain: "assessment",
    front: "Suicide risk essentials",
    back: "Assess ideation, intent, plan, access to means, timeframe, past attempts, substance use, protective factors, and supports.",
  },
  {
    id: "fc-005",
    domain: "assessment",
    front: "Sudden confusion in an older adult",
    back: "Treat acute cognitive change as a medical red flag and seek urgent medical evaluation.",
  },
  {
    id: "fc-006",
    domain: "assessment",
    front: "Cultural formulation",
    back: "Ask what symptoms mean to the client, what supports matter, and how identity, context, and oppression shape the concern.",
  },
  {
    id: "fc-007",
    domain: "intervention",
    front: "Motivational interviewing tone",
    back: "Reflect ambivalence, elicit values, support autonomy, and avoid arguing, shaming, or prematurely directing.",
  },
  {
    id: "fc-008",
    domain: "intervention",
    front: "Trauma treatment sequencing",
    back: "Stabilization and coping skills come before intensive trauma processing when dissociation or acute instability is present.",
  },
  {
    id: "fc-009",
    domain: "intervention",
    front: "Group facilitation priority",
    back: "Protect the whole group process while validating individual members and maintaining clear norms.",
  },
];

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
