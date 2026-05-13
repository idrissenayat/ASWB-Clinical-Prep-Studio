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
  {
    id: "eth-012",
    domain: "ethics",
    competency: "Confidentiality and collateral contacts",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["confidentiality", "collateral", "release of information"],
    stem:
      "A client's adult sibling calls and asks whether the client is attending therapy because the family is worried. What should the social worker do?",
    options: [
      "Confirm attendance but avoid sharing clinical details",
      "Decline to confirm or deny services without the client's authorization",
      "Ask the sibling to send concerns by email for the record",
    ],
    answerIndex: 1,
    rationale:
      "Even confirming that a person is a client can disclose protected information. The social worker should not confirm services without proper authorization or another valid exception.",
    examLens:
      "Confidentiality includes the fact of the client relationship.",
  },
  {
    id: "eth-013",
    domain: "ethics",
    competency: "Documentation and continuity of care",
    skill: "application",
    difficulty: "foundation",
    tags: ["documentation", "risk", "continuity"],
    stem:
      "After completing a suicide risk assessment, what documentation is MOST important for the social worker to include?",
    options: [
      "A detailed description of the social worker's personal feelings during the session",
      "Risk factors, protective factors, consultation, plan, and follow-up steps",
      "Only the client's diagnosis to avoid excessive documentation",
    ],
    answerIndex: 1,
    rationale:
      "Risk documentation should clearly support clinical reasoning, safety planning, consultation, and continuity of care.",
    examLens:
      "Document what another clinician would need to understand risk and next steps.",
  },
  {
    id: "eth-014",
    domain: "ethics",
    competency: "Billing and service integrity",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["billing", "fraud", "agency ethics"],
    stem:
      "An agency manager asks a social worker to bill a family session even though only a brief voicemail was left for the family. What should the social worker do?",
    options: [
      "Bill the session because outreach is part of clinical service",
      "Refuse to submit inaccurate billing and seek appropriate consultation or reporting channels",
      "Submit the bill but document that the family did not answer",
    ],
    answerIndex: 1,
    rationale:
      "Billing must accurately reflect services provided. The social worker should not participate in fraudulent or misleading documentation.",
    examLens:
      "Administrative pressure does not justify false records.",
  },
  {
    id: "eth-015",
    domain: "ethics",
    competency: "Self-disclosure and boundaries",
    skill: "application",
    difficulty: "applied",
    tags: ["self-disclosure", "boundaries", "clinical judgment"],
    stem:
      "A grieving client asks whether the social worker has ever lost a parent. What is the BEST response?",
    options: [
      "Consider whether limited disclosure would serve the client's treatment needs and keep the focus on the client",
      "Share detailed personal grief experiences to normalize the client's reaction",
      "Refuse to answer and redirect immediately to symptoms",
    ],
    answerIndex: 0,
    rationale:
      "Self-disclosure should be purposeful, brief, and clinically useful. The client's needs remain central.",
    examLens:
      "Boundaries are not silence; they are clinical purpose and client focus.",
  },
  {
    id: "eth-016",
    domain: "ethics",
    competency: "Supervision and client welfare",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["supervision", "competence", "client welfare"],
    stem:
      "A supervisee is assigned a client with symptoms the supervisee has never treated. What should the supervisor do FIRST?",
    options: [
      "Allow the supervisee to proceed independently to build confidence",
      "Assess the supervisee's competence and provide close supervision, training, or referral as needed",
      "Tell the client that the supervisee is inexperienced",
    ],
    answerIndex: 1,
    rationale:
      "Supervisors must protect client welfare and ensure services are provided within competence, with supervision or referral when needed.",
    examLens:
      "Supervision questions prioritize client welfare and competence.",
  },
  {
    id: "eth-017",
    domain: "ethics",
    competency: "Minor consent and confidentiality",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["minor client", "confidentiality", "parents"],
    stem:
      "A parent demands detailed therapy notes from a 15-year-old's sessions. The adolescent has disclosed no imminent safety issue. What should the social worker do FIRST?",
    options: [
      "Automatically provide all notes because the parent is legally responsible",
      "Clarify applicable law, consent agreements, and confidentiality limits before releasing information",
      "Tell the adolescent to decide whether the parent can see the notes",
    ],
    answerIndex: 1,
    rationale:
      "Minor confidentiality depends on law, setting, consent, and treatment agreements. The worker should clarify these before releasing sensitive records.",
    examLens:
      "For minors, avoid absolutes; check legal and consent context.",
  },
  {
    id: "eth-018",
    domain: "ethics",
    competency: "Professional boundaries and referrals",
    skill: "application",
    difficulty: "applied",
    tags: ["dual relationship", "rural practice", "referral"],
    stem:
      "In a rural community, a social worker realizes a new client is also the worker's child's teacher. What is the BEST next step?",
    options: [
      "Continue services without mentioning the connection",
      "Discuss the potential conflict, consider client choice, consult, and document the plan",
      "Terminate immediately because any dual relationship is always prohibited",
    ],
    answerIndex: 1,
    rationale:
      "Some overlapping relationships may be unavoidable. The ethical response is transparency, consultation, client-centered planning, and careful documentation.",
    examLens:
      "Boundary questions often reward risk management over rigid all-or-nothing answers.",
  },
  {
    id: "eth-019",
    domain: "ethics",
    competency: "Client access to records",
    skill: "application",
    difficulty: "foundation",
    tags: ["records", "client rights", "documentation"],
    stem:
      "A client asks to review their clinical record. What is the BEST response?",
    options: [
      "Follow applicable law and agency policy while supporting the client's right to access appropriate records",
      "Deny the request because therapy notes belong to the clinician",
      "Allow the client to edit past notes to reflect their current perspective",
    ],
    answerIndex: 0,
    rationale:
      "Clients generally have rights related to record access, subject to legal and policy requirements. The worker should respond transparently and appropriately.",
    examLens:
      "Client rights questions usually favor access, clarity, and legal-policy alignment.",
  },
  {
    id: "eth-020",
    domain: "ethics",
    competency: "Mandated reporting and adult safety",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["elder abuse", "mandated reporting", "capacity"],
    stem:
      "An older adult with cognitive impairment reports that a caregiver takes money and withholds food. What should the social worker do?",
    options: [
      "Respect family privacy and monitor for more information",
      "Make a report according to vulnerable adult protection requirements and address immediate safety needs",
      "Confront the caregiver during the next family session",
    ],
    answerIndex: 1,
    rationale:
      "Possible abuse, exploitation, and neglect of a vulnerable adult require protective action according to mandated reporting laws and immediate safety assessment.",
    examLens:
      "Reasonable suspicion plus vulnerability means protective reporting, not family mediation first.",
  },
  {
    id: "eth-021",
    domain: "ethics",
    competency: "Conflicts of interest",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["conflict of interest", "referral", "financial interest"],
    stem:
      "A social worker owns part of a private treatment program and routinely refers agency clients there without telling them about the financial interest. What is the ethical issue?",
    options: [
      "The referrals are ethical if the program has strong outcomes",
      "The worker has a conflict of interest that requires disclosure and client-centered referral options",
      "The issue only matters if clients complain",
    ],
    answerIndex: 1,
    rationale:
      "Financial interest can bias referrals. Ethical practice requires transparency, avoidance of exploitation, and meaningful alternatives.",
    examLens:
      "Client choice is compromised when hidden financial interests shape recommendations.",
  },
  {
    id: "eth-022",
    domain: "ethics",
    competency: "Termination and abandonment",
    skill: "application",
    difficulty: "applied",
    tags: ["termination", "abandonment", "continuity"],
    stem:
      "A social worker is leaving an agency in two weeks. What should the worker do to avoid client abandonment?",
    options: [
      "Stop scheduling sessions so clients adjust to the change",
      "Notify clients appropriately, plan transitions, provide referrals, and document continuity steps",
      "Transfer all clients without discussing the change to avoid distress",
    ],
    answerIndex: 1,
    rationale:
      "Ethical termination includes notice, transition planning, referral options, and documentation to protect continuity of care.",
    examLens:
      "Termination ethics are about planning and continuity, not abrupt withdrawal.",
  },
  {
    id: "asm-011",
    domain: "assessment",
    competency: "Mental status assessment",
    skill: "application",
    difficulty: "foundation",
    tags: ["mental status exam", "assessment", "orientation"],
    stem:
      "During an initial assessment, a client is unable to state the current date, location, or reason for the visit. What should the social worker assess further?",
    options: [
      "Orientation, cognition, possible intoxication, medical causes, and immediate safety",
      "Only the client's motivation for treatment",
      "The client's long-term career goals",
    ],
    answerIndex: 0,
    rationale:
      "Disorientation may reflect cognitive, medical, substance-related, or safety concerns and requires further assessment.",
    examLens:
      "Basic mental status findings can signal urgent assessment needs.",
  },
  {
    id: "asm-012",
    domain: "assessment",
    competency: "Trauma assessment",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["trauma", "dissociation", "assessment"],
    stem:
      "A client reports losing time, feeling detached from their body, and becoming numb when reminded of past abuse. What should the social worker assess?",
    options: [
      "Dissociative symptoms, trauma history, safety, and current functioning",
      "Oppositional behavior and poor motivation",
      "A primary sleep disorder only",
    ],
    answerIndex: 0,
    rationale:
      "The symptoms suggest possible dissociation connected to trauma. Assessment should include safety, triggers, functioning, and trauma-informed formulation.",
    examLens:
      "Name the clinical pattern, then assess risk and functioning.",
  },
  {
    id: "asm-013",
    domain: "assessment",
    competency: "Substance withdrawal risk",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["withdrawal", "alcohol use", "medical risk"],
    stem:
      "A client who drinks heavily every day says they plan to stop immediately at home. What should the social worker assess FIRST?",
    options: [
      "Whether the client has a sponsor",
      "Withdrawal risk and need for medical evaluation or supervised detoxification",
      "The client's preferred relapse prevention workbook",
    ],
    answerIndex: 1,
    rationale:
      "Abrupt cessation after heavy alcohol use can create serious medical risk. The worker should assess withdrawal risk and connect the client to appropriate medical care.",
    examLens:
      "Substance questions may contain medical safety issues, especially withdrawal.",
  },
  {
    id: "asm-014",
    domain: "assessment",
    competency: "Family assessment",
    skill: "application",
    difficulty: "foundation",
    tags: ["family systems", "assessment", "roles"],
    stem:
      "In a family assessment, a parent says the oldest child is responsible for managing younger siblings and calming parental conflict. What concept should the social worker consider?",
    options: ["Parentification", "Negative reinforcement", "Reaction formation"],
    answerIndex: 0,
    rationale:
      "Parentification occurs when a child takes on adult caregiving or emotional responsibilities beyond their developmental role.",
    examLens:
      "Match family role patterns to the term, then consider impact on development.",
  },
  {
    id: "asm-015",
    domain: "assessment",
    competency: "Diagnostic assessment",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["psychosis", "differential diagnosis", "substance use"],
    stem:
      "A young adult reports hearing voices for the first time after several days without sleep and heavy stimulant use. What should the social worker do NEXT?",
    options: [
      "Diagnose schizophrenia immediately",
      "Assess substance use, sleep deprivation, medical factors, risk, and persistence of symptoms",
      "Ignore the voices because stimulant use explains everything",
    ],
    answerIndex: 1,
    rationale:
      "First-episode psychotic symptoms require careful differential assessment, including substances, medical factors, sleep, safety, and symptom duration.",
    examLens:
      "Differential assessment avoids premature diagnosis.",
  },
  {
    id: "asm-016",
    domain: "assessment",
    competency: "Strengths-based assessment",
    skill: "application",
    difficulty: "foundation",
    tags: ["strengths", "resilience", "assessment"],
    stem:
      "A client describes housing instability, grief, and panic symptoms, but also identifies a trusted aunt, steady work history, and strong problem-solving skills. How should these details be used?",
    options: [
      "As protective factors and strengths in assessment and planning",
      "As reasons the client does not need treatment",
      "As unrelated background information",
    ],
    answerIndex: 0,
    rationale:
      "Strengths, supports, and coping skills are clinically relevant protective factors that should inform planning.",
    examLens:
      "Assessment includes strengths, not only pathology.",
  },
  {
    id: "asm-017",
    domain: "assessment",
    competency: "Crisis assessment",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["crisis", "homicidal ideation", "risk"],
    stem:
      "A client says they are furious at a coworker and 'might make them pay' but gives no details. What should the social worker do FIRST?",
    options: [
      "Explore intent, plan, access to means, target specificity, and protective factors",
      "Tell the client anger is normal and continue with the treatment plan",
      "Immediately call the coworker without further assessment",
    ],
    answerIndex: 0,
    rationale:
      "Ambiguous threats require structured violence risk assessment before determining protective actions.",
    examLens:
      "Assess specificity and imminence before choosing the intervention.",
  },
  {
    id: "asm-018",
    domain: "assessment",
    competency: "Developmental and school assessment",
    skill: "application",
    difficulty: "applied",
    tags: ["adolescents", "school", "assessment"],
    stem:
      "A 14-year-old's grades suddenly drop, they stop seeing friends, and they sleep most afternoons. What should the school social worker assess?",
    options: [
      "Depression, safety risk, bullying, substance use, family stressors, and academic supports",
      "Only whether the student needs tutoring",
      "Whether the student should be disciplined for low effort",
    ],
    answerIndex: 0,
    rationale:
      "Sudden functional changes in adolescence warrant broad assessment of mood, safety, peer context, substances, family, and school needs.",
    examLens:
      "A sudden decline in functioning calls for broad biopsychosocial assessment.",
  },
  {
    id: "asm-019",
    domain: "assessment",
    competency: "Treatment readiness",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["readiness", "planning", "engagement"],
    stem:
      "A client referred for trauma treatment says, 'I want this fixed, but I do not want to talk about what happened.' What should the social worker assess?",
    options: [
      "Readiness, goals, coping capacity, safety, and acceptable starting points",
      "Whether the client is lying about wanting help",
      "Whether the client can be discharged for refusal",
    ],
    answerIndex: 0,
    rationale:
      "Ambivalence about trauma discussion is common. Assessment should clarify readiness, safety, coping resources, and collaborative starting points.",
    examLens:
      "Engagement and readiness shape sequencing.",
  },
  {
    id: "int-011",
    domain: "intervention",
    competency: "Safety planning",
    skill: "application",
    difficulty: "exam-ready",
    tags: ["safety plan", "suicide risk", "crisis"],
    stem:
      "A client with suicidal ideation denies current intent but has intermittent urges. Which intervention is MOST appropriate?",
    options: [
      "Develop a collaborative safety plan with warning signs, coping steps, supports, and crisis contacts",
      "Avoid discussing suicide further to prevent reinforcing it",
      "Give advice to think positively when urges occur",
    ],
    answerIndex: 0,
    rationale:
      "Safety planning is a concrete, collaborative intervention for managing future suicidal urges and connecting to supports.",
    examLens:
      "For ongoing risk, choose specific safety steps over vague reassurance.",
  },
  {
    id: "int-012",
    domain: "intervention",
    competency: "De-escalation",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["de-escalation", "anger", "safety"],
    stem:
      "A client begins pacing, raising their voice, and blocking the office door. What should the social worker do FIRST?",
    options: [
      "Use calm de-escalation, maintain safety, and avoid physically confronting the client",
      "Stand between the client and the door to regain control",
      "Challenge the client to explain why they are being threatening",
    ],
    answerIndex: 0,
    rationale:
      "Escalating behavior requires attention to immediate safety, calm communication, space, and de-escalation.",
    examLens:
      "Do not escalate power struggles when safety is changing.",
  },
  {
    id: "int-013",
    domain: "intervention",
    competency: "Psychoeducation",
    skill: "application",
    difficulty: "foundation",
    tags: ["psychoeducation", "panic", "skills"],
    stem:
      "A client with panic attacks fears they are 'going crazy' when symptoms peak. What intervention is MOST appropriate early in treatment?",
    options: [
      "Provide psychoeducation about panic symptoms and teach grounding or breathing skills",
      "Tell the client to avoid all situations where panic might occur",
      "Begin exposure without explaining the symptoms",
    ],
    answerIndex: 0,
    rationale:
      "Early panic work often includes normalization, psychoeducation, and coping skills before more intensive exposure practice.",
    examLens:
      "Early intervention often combines education with practical skill building.",
  },
  {
    id: "int-014",
    domain: "intervention",
    competency: "Solution-focused practice",
    skill: "application",
    difficulty: "foundation",
    tags: ["solution-focused", "exceptions", "strengths"],
    stem:
      "A client says depression is present every day, but mornings are 'a little less impossible' when they walk with a neighbor. Which response is MOST solution-focused?",
    options: [
      "What is different on the mornings when walking helps even a little?",
      "Why do you think depression started in childhood?",
      "You should walk every morning without exception",
    ],
    answerIndex: 0,
    rationale:
      "Solution-focused practice explores exceptions, strengths, and small useful differences that can be expanded.",
    examLens:
      "Look for exceptions and client-generated solutions.",
  },
  {
    id: "int-015",
    domain: "intervention",
    competency: "Case management",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["case management", "barriers", "advocacy"],
    stem:
      "A client repeatedly misses therapy because the bus route was cut and childcare is unstable. What intervention is MOST appropriate?",
    options: [
      "Explore practical barriers and coordinate transportation, childcare, or service alternatives",
      "Interpret missed sessions as resistance",
      "Close the case for noncompliance",
    ],
    answerIndex: 0,
    rationale:
      "Social work intervention includes addressing concrete barriers that interfere with access and engagement.",
    examLens:
      "Repeated missed care may signal access barriers, not just motivation.",
  },
  {
    id: "int-016",
    domain: "intervention",
    competency: "Couples and family safety",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["intimate partner violence", "couples therapy", "safety"],
    stem:
      "A couple requests joint counseling, but one partner privately reports fear of retaliation at home. What should the social worker do?",
    options: [
      "Proceed with joint sessions to improve communication",
      "Prioritize safety assessment and avoid interventions that could increase danger",
      "Ask the fearful partner to confront the other partner in session",
    ],
    answerIndex: 1,
    rationale:
      "When coercive control or retaliation risk is present, joint work can increase danger. Safety assessment and specialized planning come first.",
    examLens:
      "Do not use standard couples communication work when abuse risk is active.",
  },
  {
    id: "int-017",
    domain: "intervention",
    competency: "Cultural humility in intervention",
    skill: "application",
    difficulty: "applied",
    tags: ["culture", "engagement", "intervention planning"],
    stem:
      "A client wants to include a spiritual leader in treatment planning. What is the BEST response?",
    options: [
      "Explore the client's wishes and obtain appropriate consent before collaboration",
      "Decline because spiritual supports are outside clinical practice",
      "Contact the spiritual leader immediately without written permission",
    ],
    answerIndex: 0,
    rationale:
      "Culturally responsive practice can include client-identified supports when the client consents and confidentiality is protected.",
    examLens:
      "Client-defined supports can be part of ethical intervention.",
  },
  {
    id: "int-018",
    domain: "intervention",
    competency: "Evaluation of intervention",
    skill: "application",
    difficulty: "foundation",
    tags: ["evaluation", "outcomes", "treatment planning"],
    stem:
      "After six sessions, a client's anxiety scores and functioning have not improved. What should the social worker do?",
    options: [
      "Review progress with the client and adjust the treatment plan as needed",
      "Continue the same approach because change takes time",
      "End services because treatment has failed",
    ],
    answerIndex: 0,
    rationale:
      "Ongoing evaluation includes reviewing outcomes, client feedback, barriers, and adjusting interventions when needed.",
    examLens:
      "Evaluation is active: measure, discuss, adjust.",
  },
  {
    id: "int-019",
    domain: "intervention",
    competency: "Advocacy and systems practice",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["advocacy", "systems", "discrimination"],
    stem:
      "A client is denied a housing accommodation related to a documented disability and asks for help. What should the social worker do?",
    options: [
      "Support the client in understanding rights, gathering documentation, and advocating through appropriate channels",
      "Tell the client housing issues are outside clinical work",
      "Contact the landlord and threaten legal action without the client's consent",
    ],
    answerIndex: 0,
    rationale:
      "Social work intervention may include advocacy, resource linkage, and support for client self-determination while respecting consent.",
    examLens:
      "Systems advocacy is part of practice when it supports client goals and rights.",
  },
  {
    id: "eth-023",
    domain: "ethics",
    competency: "Ethical decision-making",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["ethical dilemma", "consultation", "decision making"],
    stem:
      "A social worker faces a dilemma where agency policy, client preference, and professional ethics appear to conflict. What should the social worker do FIRST?",
    options: [
      "Identify the ethical issues, relevant laws/policies, client interests, and seek consultation as needed",
      "Follow agency policy because employment rules take priority",
      "Let the client decide because self-determination always overrides other obligations",
    ],
    answerIndex: 0,
    rationale:
      "Ethical dilemmas require a structured process that considers duties, law, policy, client welfare, consultation, and documentation.",
    examLens:
      "When duties conflict, choose structured ethical reasoning over a single-rule shortcut.",
  },
  {
    id: "eth-024",
    domain: "ethics",
    competency: "Values and professional objectivity",
    skill: "application",
    difficulty: "applied",
    tags: ["values", "objectivity", "self-awareness"],
    stem:
      "A social worker notices strong personal disapproval of a client's parenting decision that is legal and not unsafe. What is the BEST response?",
    options: [
      "Explore the worker's reaction in supervision or consultation and keep services client-centered",
      "Tell the client the decision is personally upsetting",
      "Terminate services because value conflicts cannot be managed",
    ],
    answerIndex: 0,
    rationale:
      "Professional objectivity requires awareness of personal values and consultation so the client's rights and goals remain central.",
    examLens:
      "Value conflicts call for self-awareness and consultation, not client pressure.",
  },
  {
    id: "eth-025",
    domain: "ethics",
    competency: "Group informed consent",
    skill: "application",
    difficulty: "foundation",
    tags: ["group work", "informed consent", "confidentiality"],
    stem:
      "Before starting a therapy group, what should the social worker explain to prospective members?",
    options: [
      "That the social worker can guarantee every member will keep information private",
      "Group purpose, risks, expectations, confidentiality limits, and member responsibilities",
      "That individual concerns cannot be discussed in a group setting",
    ],
    answerIndex: 1,
    rationale:
      "Group consent includes purpose, structure, expectations, risks, confidentiality limits, and the limits of what the worker can control.",
    examLens:
      "Group confidentiality is encouraged and contracted, but not guaranteed.",
  },
  {
    id: "eth-026",
    domain: "ethics",
    competency: "Electronic information security",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["electronic records", "privacy", "security"],
    stem:
      "A social worker loses a laptop that may contain identifiable client information. What should the worker do FIRST?",
    options: [
      "Wait to see whether anyone reports misuse of the information",
      "Follow agency breach procedures, notify appropriate personnel, and document required actions",
      "Buy a replacement laptop and continue practice",
    ],
    answerIndex: 1,
    rationale:
      "Potential breaches of client information require immediate action under agency policy, law, and professional responsibilities.",
    examLens:
      "Privacy incidents are handled through formal reporting and mitigation steps.",
  },
  {
    id: "eth-027",
    domain: "ethics",
    competency: "Subpoenas and records",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["subpoena", "records", "confidentiality"],
    stem:
      "A social worker receives a subpoena requesting a client's complete record. What should the social worker do FIRST?",
    options: [
      "Send the record immediately because subpoenas always require disclosure",
      "Ignore the subpoena to protect confidentiality",
      "Consult agency policy, legal counsel, and applicable law before releasing information",
    ],
    answerIndex: 2,
    rationale:
      "A subpoena does not automatically resolve confidentiality duties. The worker should clarify legal obligations before disclosure.",
    examLens:
      "Legal documents require careful verification, not reflexive release.",
  },
  {
    id: "eth-028",
    domain: "ethics",
    competency: "Minimum necessary disclosure",
    skill: "application",
    difficulty: "foundation",
    tags: ["release of information", "confidentiality", "records"],
    stem:
      "A client signs a release for the social worker to coordinate with a physician. What should guide the information shared?",
    options: [
      "Share only information relevant to the stated purpose of coordination",
      "Send the full record so the physician has complete context",
      "Avoid all communication because releases do not protect confidentiality",
    ],
    answerIndex: 0,
    rationale:
      "Authorized disclosures should be limited to the purpose and scope of the release.",
    examLens:
      "Consent to share is not consent to overshare.",
  },
  {
    id: "eth-029",
    domain: "ethics",
    competency: "Client refusal of services",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["self-determination", "refusal", "capacity"],
    stem:
      "An adult client with capacity refuses a recommended medication evaluation. There is no imminent safety concern. What should the social worker do?",
    options: [
      "Respect the refusal while exploring concerns, alternatives, and possible consequences",
      "Discontinue therapy until the client agrees",
      "Ask a family member to pressure the client",
    ],
    answerIndex: 0,
    rationale:
      "Clients with capacity may refuse services. The worker can explore concerns and offer alternatives without coercion.",
    examLens:
      "Self-determination remains strong when capacity is present and risk is not imminent.",
  },
  {
    id: "eth-030",
    domain: "ethics",
    competency: "Death and dying",
    skill: "application",
    difficulty: "applied",
    tags: ["end of life", "self-determination", "family conflict"],
    stem:
      "A terminally ill client expresses treatment preferences that differ from the family's wishes. What should the social worker prioritize?",
    options: [
      "The family's wishes because they will manage care",
      "The client's informed preferences, capacity, and applicable advance directives",
      "The medical team's preference to avoid conflict",
    ],
    answerIndex: 1,
    rationale:
      "End-of-life practice prioritizes the client's informed choices, capacity, legal directives, and dignity.",
    examLens:
      "Family distress does not erase client self-determination.",
  },
  {
    id: "eth-031",
    domain: "ethics",
    competency: "Research ethics",
    skill: "application",
    difficulty: "foundation",
    tags: ["research ethics", "informed consent", "human subjects"],
    stem:
      "A clinic wants to study client outcomes using identifiable treatment data. What ethical step is MOST important before collecting research data?",
    options: [
      "Use only clients who already like the agency",
      "Obtain appropriate review and informed consent or authorization as required",
      "Collect the data first and remove names later",
    ],
    answerIndex: 1,
    rationale:
      "Research involving identifiable client information requires appropriate protections, review, consent, and confidentiality safeguards.",
    examLens:
      "Research ethics protect consent, privacy, and participant welfare before data collection.",
  },
  {
    id: "eth-032",
    domain: "ethics",
    competency: "Social worker safety",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["worker safety", "policy", "risk"],
    stem:
      "An agency sends workers alone to unfamiliar homes late at night without safety procedures. What is the BEST organizational response?",
    options: [
      "Develop and implement safety policies, risk screening, communication plans, and training",
      "Tell workers to rely on clinical intuition",
      "Stop all home visits permanently",
    ],
    answerIndex: 0,
    rationale:
      "Worker safety requires proactive policies, procedures, training, and risk management rather than informal judgment alone.",
    examLens:
      "Safety is both an individual and organizational responsibility.",
  },
  {
    id: "eth-033",
    domain: "ethics",
    competency: "Countertransference",
    skill: "application",
    difficulty: "applied",
    tags: ["countertransference", "supervision", "use of self"],
    stem:
      "A social worker feels unusually protective of a client who reminds the worker of a younger sibling. What should the worker do?",
    options: [
      "Use supervision or consultation to examine the reaction and protect clinical judgment",
      "Tell the client about the sibling connection to deepen rapport",
      "End services immediately because countertransference is unethical",
    ],
    answerIndex: 0,
    rationale:
      "Countertransference is managed through awareness, supervision, boundaries, and reflective practice.",
    examLens:
      "The issue is not having reactions; the issue is managing their impact on care.",
  },
  {
    id: "eth-034",
    domain: "ethics",
    competency: "Secondary trauma and burnout",
    skill: "application",
    difficulty: "foundation",
    tags: ["burnout", "secondary trauma", "self-care"],
    stem:
      "A social worker exposed to repeated trauma narratives becomes emotionally numb, irritable, and avoids client contact. What should the worker consider?",
    options: [
      "Secondary traumatic stress or burnout and the need for supervision, support, and self-care",
      "A sign that the worker should avoid all trauma clients forever",
      "Proof that the clients' stories are exaggerated",
    ],
    answerIndex: 0,
    rationale:
      "Secondary trauma and burnout can affect practice and require support, supervision, workload review, and self-care strategies.",
    examLens:
      "Professional use of self includes monitoring impairment risks.",
  },
  {
    id: "eth-035",
    domain: "ethics",
    competency: "Evidence-based practice",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["evidence-based practice", "client preference", "culture"],
    stem:
      "Which option BEST reflects evidence-based social work practice?",
    options: [
      "Using only manualized treatments and ignoring client preference",
      "Integrating research evidence, clinical expertise, client values, culture, and context",
      "Using whatever intervention the worker personally prefers",
    ],
    answerIndex: 1,
    rationale:
      "Evidence-based practice combines research, practitioner expertise, and the client's values, circumstances, and culture.",
    examLens:
      "Evidence-based does not mean one-size-fits-all.",
  },
  {
    id: "eth-036",
    domain: "ethics",
    competency: "Professional development",
    skill: "application",
    difficulty: "foundation",
    tags: ["competence", "professional development", "licensure"],
    stem:
      "A social worker begins receiving referrals for a population outside the worker's training. What professional responsibility applies?",
    options: [
      "Maintain competence through supervision, training, consultation, or referral",
      "Accept all referrals because experience is the best training",
      "Decline every referral from unfamiliar populations without discussion",
    ],
    answerIndex: 0,
    rationale:
      "Competence requires ongoing learning, consultation, supervision, and appropriate referral when needed.",
    examLens:
      "Professional development supports ethical service, not resume building.",
  },
  {
    id: "eth-037",
    domain: "ethics",
    competency: "Impaired professionals",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["impaired professional", "client safety", "colleague"],
    stem:
      "A colleague appears impaired during a crisis assessment and is about to meet with a high-risk client. What should the social worker do FIRST?",
    options: [
      "Intervene to protect the client and notify appropriate supervisory channels",
      "Wait until after the session to avoid embarrassing the colleague",
      "Ask other coworkers whether they have noticed anything",
    ],
    answerIndex: 0,
    rationale:
      "When client safety may be immediate, protective action and supervisory notification should not be delayed.",
    examLens:
      "Imminent client risk moves the response from collegial conversation to protection.",
  },
  {
    id: "eth-038",
    domain: "ethics",
    competency: "Supervisory boundaries",
    skill: "application",
    difficulty: "applied",
    tags: ["supervision", "boundaries", "power"],
    stem:
      "A supervisor asks a supervisee to provide free babysitting because the supervisor is overwhelmed. What is the BEST interpretation?",
    options: [
      "This creates a boundary and power concern in the supervisory relationship",
      "This is acceptable because supervision includes mutual support",
      "This is only unethical if money is exchanged",
    ],
    answerIndex: 0,
    rationale:
      "Supervisory relationships include power differences. Personal requests can exploit that power and blur boundaries.",
    examLens:
      "Power differences make personal favors ethically risky.",
  },
  {
    id: "eth-039",
    domain: "ethics",
    competency: "Permanency and self-determination",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["permanency planning", "children", "self-determination"],
    stem:
      "In permanency planning, a youth's stated wishes differ from what adults believe is best. What should the social worker do?",
    options: [
      "Ignore the youth's wishes because adults make permanency decisions",
      "Consider the youth's developmental capacity, safety, legal requirements, and voice in planning",
      "Follow the youth's preference regardless of safety or law",
    ],
    answerIndex: 1,
    rationale:
      "Permanency planning balances safety, legal mandates, developmental capacity, and the youth's voice.",
    examLens:
      "Child welfare answers rarely ignore safety, law, or the child's perspective.",
  },
  {
    id: "eth-040",
    domain: "ethics",
    competency: "Confidentiality in interdisciplinary teams",
    skill: "application",
    difficulty: "applied",
    tags: ["team collaboration", "confidentiality", "minimum necessary"],
    stem:
      "In an interdisciplinary team meeting, several professionals ask for details unrelated to their role in the client's care. What should the social worker do?",
    options: [
      "Share all details because everyone is on the team",
      "Share information relevant to coordination while protecting unnecessary private details",
      "Refuse to participate in team meetings",
    ],
    answerIndex: 1,
    rationale:
      "Collaboration does not eliminate confidentiality. Information shared should be relevant to the purpose and role.",
    examLens:
      "Teamwork still requires boundaries around information.",
  },
  {
    id: "eth-041",
    domain: "ethics",
    competency: "Client competence and financial decisions",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["capacity", "financial decisions", "self-determination"],
    stem:
      "An adult client with a psychiatric diagnosis makes a financial decision the social worker believes is unwise. There is no evidence of incapacity or exploitation. What should the worker do?",
    options: [
      "Respect the client's right to make decisions while exploring risks and supports",
      "Contact the client's bank to prevent the transaction",
      "Ask a family member to take over the client's finances",
    ],
    answerIndex: 0,
    rationale:
      "A diagnosis alone does not remove decision-making rights. The worker may explore consequences and supports without overriding autonomy.",
    examLens:
      "Capacity is decision-specific; do not confuse disagreement with incapacity.",
  },
  {
    id: "eth-042",
    domain: "ethics",
    competency: "Ethical termination after nonpayment",
    skill: "application",
    difficulty: "applied",
    tags: ["termination", "fees", "abandonment"],
    stem:
      "A client falls behind on fees but is in the middle of a crisis. What should the social worker do?",
    options: [
      "Terminate immediately because payment is overdue",
      "Consider client welfare, crisis needs, prior fee agreements, referrals, and ethical termination steps",
      "Continue indefinitely without discussing fees",
    ],
    answerIndex: 1,
    rationale:
      "Fee issues must be handled transparently, but termination cannot ignore crisis needs or abandonment concerns.",
    examLens:
      "Financial boundaries matter, but client welfare shapes timing and process.",
  },
  {
    id: "eth-043",
    domain: "ethics",
    competency: "Documentation corrections",
    skill: "application",
    difficulty: "foundation",
    tags: ["documentation", "records", "correction"],
    stem:
      "A social worker discovers a factual error in a signed progress note. What should the worker do?",
    options: [
      "Delete the original note and rewrite it",
      "Follow agency procedure to add a dated correction or addendum without falsifying the record",
      "Leave the error because signed notes cannot be corrected",
    ],
    answerIndex: 1,
    rationale:
      "Records should be corrected transparently according to policy, preserving integrity rather than hiding changes.",
    examLens:
      "Accurate correction is different from alteration.",
  },
  {
    id: "eth-044",
    domain: "ethics",
    competency: "Social justice and advocacy",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["social justice", "advocacy", "client self-determination"],
    stem:
      "A social worker believes a client is being treated unfairly by an institution, but the client is unsure about taking action. What should the worker do?",
    options: [
      "Provide information, explore options, and support the client's informed choice",
      "Act publicly on the client's behalf without consent because justice is at stake",
      "Avoid discussing advocacy because it is not clinical",
    ],
    answerIndex: 0,
    rationale:
      "Advocacy should support client rights and informed choice while respecting consent and self-determination.",
    examLens:
      "Advocacy and self-determination should work together.",
  },
  {
    id: "asm-020",
    domain: "assessment",
    competency: "Attachment and development",
    skill: "application",
    difficulty: "foundation",
    tags: ["attachment", "child development", "assessment"],
    stem:
      "A toddler becomes extremely distressed when a caregiver leaves and is difficult to soothe when the caregiver returns. What should the social worker assess further?",
    options: [
      "Attachment patterns, caregiver responsiveness, stressors, and developmental context",
      "Whether the toddler is intentionally manipulative",
      "Whether the caregiver should immediately lose custody",
    ],
    answerIndex: 0,
    rationale:
      "Separation and reunion behavior can provide information about attachment, caregiving patterns, stress, and development.",
    examLens:
      "Developmental observations should lead to assessment, not blame.",
  },
  {
    id: "asm-021",
    domain: "assessment",
    competency: "Grief and loss",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["grief", "loss", "assessment"],
    stem:
      "A client whose spouse died two months ago reports waves of sadness, yearning, disrupted sleep, and moments of relief when distracted. What is the BEST assessment stance?",
    options: [
      "Recognize these may be common grief responses while assessing functioning, risk, supports, and culture",
      "Diagnose a major mental disorder because grief lasting two months is abnormal",
      "Tell the client to stop talking about the loss to avoid rumination",
    ],
    answerIndex: 0,
    rationale:
      "Grief assessment considers normal variation, culture, risk, supports, impairment, and whether symptoms suggest complications.",
    examLens:
      "Do not pathologize grief without assessing severity, context, and functioning.",
  },
  {
    id: "asm-022",
    domain: "assessment",
    competency: "Caregiving and family stress",
    skill: "application",
    difficulty: "foundation",
    tags: ["caregiving", "family systems", "stress"],
    stem:
      "An adult child caring for a parent with dementia reports exhaustion, resentment, and social isolation. What should the social worker assess?",
    options: [
      "Caregiver burden, safety, supports, respite options, and family roles",
      "Only whether the adult child is being selfish",
      "Whether the parent should be hospitalized immediately",
    ],
    answerIndex: 0,
    rationale:
      "Caregiving can create stress, safety concerns, isolation, and resource needs that should be assessed systemically.",
    examLens:
      "Family caregiving questions often ask for burden, safety, and supports.",
  },
  {
    id: "asm-023",
    domain: "assessment",
    competency: "Person-in-environment",
    skill: "application",
    difficulty: "foundation",
    tags: ["person-in-environment", "poverty", "systems"],
    stem:
      "A client misses appointments after losing housing and phone access. Which assessment lens is MOST appropriate?",
    options: [
      "Person-in-environment assessment of practical barriers, stressors, resources, and strengths",
      "A conclusion that the client lacks motivation",
      "A focus only on childhood attachment",
    ],
    answerIndex: 0,
    rationale:
      "Person-in-environment assessment considers how social, economic, and environmental factors affect functioning and engagement.",
    examLens:
      "Context matters; behavior is not assessed in isolation.",
  },
  {
    id: "asm-024",
    domain: "assessment",
    competency: "Abuse dynamics across the lifespan",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["abuse", "coercive control", "assessment"],
    stem:
      "A client says a partner checks mileage, controls medication, and threatens to report the client to immigration authorities. What should the social worker assess?",
    options: [
      "Coercive control, safety, exploitation risk, immigration-related threats, and safe communication",
      "Whether the client provokes the partner",
      "Whether couples communication exercises can begin immediately",
    ],
    answerIndex: 0,
    rationale:
      "Control, medication restriction, and immigration threats suggest abuse and exploitation risks requiring careful safety assessment.",
    examLens:
      "Threats tied to dependence or status can be part of abuse dynamics.",
  },
  {
    id: "asm-025",
    domain: "assessment",
    competency: "Exploitation and trafficking indicators",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["trafficking", "exploitation", "safety"],
    stem:
      "A young adult appears fearful, has no control over identification documents, and says someone else keeps their wages. What should the social worker assess?",
    options: [
      "Possible exploitation or trafficking, immediate safety, control, coercion, and resource needs",
      "Whether the young adult is simply irresponsible with money",
      "Only whether the person has a formal diagnosis",
    ],
    answerIndex: 0,
    rationale:
      "Lack of document control, wage control, fear, and coercion can indicate exploitation or trafficking.",
    examLens:
      "Exploitation assessment focuses on control, coercion, safety, and resources.",
  },
  {
    id: "asm-026",
    domain: "assessment",
    competency: "Neurologic and organic symptoms",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["medical red flag", "neurologic", "assessment"],
    stem:
      "A client reports sudden personality change, severe headaches, and new confusion after a fall. What should the social worker do FIRST?",
    options: [
      "Refer for urgent medical evaluation",
      "Begin insight-oriented therapy",
      "Schedule a routine appointment in one month",
    ],
    answerIndex: 0,
    rationale:
      "Sudden cognitive or personality changes after head injury may indicate an urgent medical issue.",
    examLens:
      "New neurologic symptoms are medical red flags.",
  },
  {
    id: "asm-027",
    domain: "assessment",
    competency: "Collateral data",
    skill: "application",
    difficulty: "foundation",
    tags: ["collateral", "assessment", "records"],
    stem:
      "A client provides inconsistent history about school functioning. What is an appropriate assessment step with consent?",
    options: [
      "Obtain relevant collateral information from school records or staff",
      "Conclude the client is intentionally deceptive",
      "Ignore school functioning because therapy is individual",
    ],
    answerIndex: 0,
    rationale:
      "Collateral information can clarify assessment when obtained with appropriate authorization and relevance.",
    examLens:
      "Collateral data supports assessment; consent and purpose still matter.",
  },
  {
    id: "asm-028",
    domain: "assessment",
    competency: "Sensitive information gathering",
    skill: "application",
    difficulty: "applied",
    tags: ["sensitive information", "substance use", "sexual abuse"],
    stem:
      "A client appears ashamed when substance use is mentioned and gives brief answers. What interviewing approach is BEST?",
    options: [
      "Use nonjudgmental, direct, normalized questions and explain why the information matters",
      "Avoid the topic until the client brings it up spontaneously",
      "Tell the client that honesty is required or services will end",
    ],
    answerIndex: 0,
    rationale:
      "Sensitive assessment is improved by nonjudgmental framing, transparency, normalization, and direct but respectful questions.",
    examLens:
      "Safety and accuracy improve when shame is reduced.",
  },
  {
    id: "asm-029",
    domain: "assessment",
    competency: "Psychological and educational testing",
    skill: "application",
    difficulty: "foundation",
    tags: ["testing", "assessment", "school"],
    stem:
      "A school sends psychological testing results to support a client's assessment. How should the social worker use them?",
    options: [
      "Integrate relevant findings with clinical interview, context, strengths, and other data",
      "Accept the test results as the entire assessment",
      "Ignore the results because only social workers can assess clients",
    ],
    answerIndex: 0,
    rationale:
      "Testing can inform assessment but should be integrated with interview, observation, collateral data, and context.",
    examLens:
      "Test results are data points, not the whole clinical picture.",
  },
  {
    id: "asm-030",
    domain: "assessment",
    competency: "Somatization and medical assessment",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["somatic symptoms", "medical", "assessment"],
    stem:
      "A client reports many physical symptoms that worsen during stress. Medical evaluation has not yet occurred. What should the social worker do?",
    options: [
      "Encourage appropriate medical evaluation while assessing stress, functioning, and emotional factors",
      "Assume symptoms are psychological and begin confrontation",
      "Tell the client the symptoms are not real",
    ],
    answerIndex: 0,
    rationale:
      "Physical complaints require appropriate medical consideration while psychosocial factors are assessed.",
    examLens:
      "Do not decide symptoms are psychological before medical issues are considered.",
  },
  {
    id: "asm-031",
    domain: "assessment",
    competency: "Feigning illness",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["feigning", "assessment", "documentation"],
    stem:
      "A client's reported symptoms change dramatically depending on whether a disability payment is discussed. What is the BEST assessment response?",
    options: [
      "Assess inconsistencies carefully, document observations, and avoid unsupported accusations",
      "Accuse the client of lying to stop manipulation",
      "Approve benefits because challenging symptoms is unethical",
    ],
    answerIndex: 0,
    rationale:
      "Possible feigning should be assessed through careful observation, collateral data, documentation, and clinical humility.",
    examLens:
      "Suspicion is not proof; assess and document objectively.",
  },
  {
    id: "asm-032",
    domain: "assessment",
    competency: "Medication side effects",
    skill: "application",
    difficulty: "applied",
    tags: ["medication", "side effects", "coordination"],
    stem:
      "A client recently started a psychotropic medication and reports tremors, restlessness, and muscle stiffness. What should the social worker do?",
    options: [
      "Encourage prompt contact with the prescribing provider and assess safety",
      "Tell the client to stop the medication immediately",
      "Ignore symptoms because side effects are outside social work",
    ],
    answerIndex: 0,
    rationale:
      "Social workers do not prescribe, but they should recognize possible medication concerns, assess safety, and coordinate with prescribers.",
    examLens:
      "Medication concerns require coordination, not independent medical advice.",
  },
  {
    id: "asm-033",
    domain: "assessment",
    competency: "Motivation and resistance",
    skill: "application",
    difficulty: "foundation",
    tags: ["resistance", "readiness", "engagement"],
    stem:
      "A client attends sessions but says, 'My probation officer is the only reason I am here.' What should the social worker assess?",
    options: [
      "Readiness, external pressure, personal goals, ambivalence, and barriers to engagement",
      "Whether the client should be discharged immediately",
      "Whether the probation officer can force insight",
    ],
    answerIndex: 0,
    rationale:
      "Mandated participation requires assessment of motivation, ambivalence, external pressure, and possible client-defined goals.",
    examLens:
      "Resistance often signals ambivalence or context to explore.",
  },
  {
    id: "asm-034",
    domain: "assessment",
    competency: "Ego strengths and coping",
    skill: "application",
    difficulty: "foundation",
    tags: ["ego strengths", "coping", "assessment"],
    stem:
      "A client under severe stress can still name emotions, ask for support, and use problem-solving skills. These are examples of what?",
    options: ["Ego strengths and coping capacities", "Psychotic symptoms", "Treatment noncompliance"],
    answerIndex: 0,
    rationale:
      "Emotional awareness, support-seeking, and problem solving can reflect strengths and coping resources.",
    examLens:
      "Strengths are clinically relevant assessment findings.",
  },
  {
    id: "asm-035",
    domain: "assessment",
    competency: "Level of care",
    skill: "reasoning",
    difficulty: "exam-ready",
    tags: ["level of care", "risk", "placement"],
    stem:
      "A client with substance use disorder reports daily use, withdrawal symptoms, unstable housing, and repeated failed outpatient attempts. What should the social worker assess?",
    options: [
      "Need for a higher level of care based on withdrawal risk, supports, safety, and functioning",
      "Only whether the client promises to try harder",
      "Whether outpatient therapy can be ended permanently",
    ],
    answerIndex: 0,
    rationale:
      "Level of care decisions consider medical risk, severity, supports, environment, functioning, and prior treatment response.",
    examLens:
      "Placement is based on assessed needs, not moral effort.",
  },
  {
    id: "asm-036",
    domain: "assessment",
    competency: "Objective and subjective data",
    skill: "application",
    difficulty: "foundation",
    tags: ["objective data", "subjective data", "assessment"],
    stem:
      "Which pair BEST distinguishes subjective and objective data?",
    options: [
      "Client reports panic; worker observes trembling hands",
      "Worker likes the client; client has a diagnosis",
      "Agency policy; insurance authorization",
    ],
    answerIndex: 0,
    rationale:
      "Subjective data comes from the client's report; objective data includes observable or measurable information.",
    examLens:
      "Assessment quality improves when data types are clear.",
  },
  {
    id: "asm-037",
    domain: "assessment",
    competency: "Reliability and validity",
    skill: "application",
    difficulty: "foundation",
    tags: ["research", "validity", "reliability"],
    stem:
      "A depression screening tool gives similar results when a stable client takes it twice in one week. This MOST directly reflects what concept?",
    options: ["Reliability", "Cultural humility", "Triangulation"],
    answerIndex: 0,
    rationale:
      "Reliability refers to consistency of measurement. Validity concerns whether the tool measures what it intends to measure.",
    examLens:
      "Reliable means consistent; valid means accurate for the intended construct.",
  },
  {
    id: "asm-038",
    domain: "assessment",
    competency: "Cultural identity and discrimination",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["discrimination", "identity", "assessment"],
    stem:
      "A client describes anxiety that worsens after repeated workplace microaggressions. What should the social worker assess?",
    options: [
      "The impact of discrimination, coping, supports, workplace context, identity, and safety",
      "Only whether the client has irrational thoughts",
      "Whether the client is too sensitive to feedback",
    ],
    answerIndex: 0,
    rationale:
      "Assessment should include the impact of discrimination and environmental stressors on behavior, identity, and functioning.",
    examLens:
      "Cultural and institutional context can be clinically central.",
  },
  {
    id: "asm-039",
    domain: "assessment",
    competency: "Out-of-home placement impact",
    skill: "application",
    difficulty: "applied",
    tags: ["placement", "hospitalization", "foster care"],
    stem:
      "A child returns from a sudden foster placement and has nightmares, clinginess, and school refusal. What should the social worker assess?",
    options: [
      "Trauma response, attachment disruptions, placement experience, safety, and supports",
      "Whether the child is manipulating caregivers",
      "Only academic skill deficits",
    ],
    answerIndex: 0,
    rationale:
      "Out-of-home placement can affect attachment, trauma symptoms, functioning, and family relationships.",
    examLens:
      "Placement changes are major life events with developmental and relational impact.",
  },
  {
    id: "int-020",
    domain: "intervention",
    competency: "Interviewing techniques",
    skill: "application",
    difficulty: "foundation",
    tags: ["interviewing", "clarifying", "reflection"],
    stem:
      "A client says, 'Everything is falling apart.' Which response BEST uses clarification?",
    options: [
      "When you say everything, which part feels most urgent today?",
      "You should make a list of solutions immediately",
      "That sounds like catastrophizing",
    ],
    answerIndex: 0,
    rationale:
      "Clarification helps make broad or vague statements more specific while maintaining engagement.",
    examLens:
      "Interviewing skills often ask what response fits the moment.",
  },
  {
    id: "int-021",
    domain: "intervention",
    competency: "Use of interpreters",
    skill: "application",
    difficulty: "applied",
    tags: ["interpreter", "communication", "access"],
    stem:
      "During a session with an interpreter, how should the social worker communicate?",
    options: [
      "Speak directly to the client, use clear language, and check understanding",
      "Speak only to the interpreter because they know the language",
      "Ask the interpreter to summarize only the important parts",
    ],
    answerIndex: 0,
    rationale:
      "The worker should maintain the relationship with the client, use clear language, and preserve accuracy and confidentiality.",
    examLens:
      "Interpreters support communication; they do not replace direct engagement.",
  },
  {
    id: "int-022",
    domain: "intervention",
    competency: "Role play",
    skill: "application",
    difficulty: "foundation",
    tags: ["role play", "skills", "assertiveness"],
    stem:
      "A client wants to practice asking a landlord for repairs but becomes anxious. Which intervention is MOST appropriate?",
    options: [
      "Use role play to rehearse the conversation and build confidence",
      "Tell the client exactly what to say and end the discussion",
      "Avoid the topic until anxiety disappears",
    ],
    answerIndex: 0,
    rationale:
      "Role play helps clients practice skills, receive feedback, and increase confidence before real interactions.",
    examLens:
      "Skill deficits often call for rehearsal, modeling, or coaching.",
  },
  {
    id: "int-023",
    domain: "intervention",
    competency: "Harm reduction",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["harm reduction", "substance use", "safety"],
    stem:
      "A client is not ready to stop injection drug use but wants to reduce health risks. What is the BEST intervention stance?",
    options: [
      "Collaborate on harm reduction strategies while continuing to support readiness for change",
      "Refuse service until the client commits to abstinence",
      "Tell the client harm reduction means the worker approves of drug use",
    ],
    answerIndex: 0,
    rationale:
      "Harm reduction reduces risk and preserves engagement without requiring immediate abstinence.",
    examLens:
      "Meeting the client where they are can still be clinically active.",
  },
  {
    id: "int-024",
    domain: "intervention",
    competency: "Self-monitoring",
    skill: "application",
    difficulty: "foundation",
    tags: ["self-monitoring", "CBT", "coping"],
    stem:
      "A client wants to understand patterns in panic episodes. Which intervention is MOST useful?",
    options: [
      "Track triggers, thoughts, body sensations, behaviors, and coping responses between sessions",
      "Avoid discussing panic outside therapy",
      "Rely only on the worker's memory of session content",
    ],
    answerIndex: 0,
    rationale:
      "Self-monitoring helps identify patterns and supports targeted intervention.",
    examLens:
      "Between-session tracking turns vague symptoms into usable data.",
  },
  {
    id: "int-025",
    domain: "intervention",
    competency: "Conflict resolution",
    skill: "application",
    difficulty: "applied",
    tags: ["conflict resolution", "communication", "mediation"],
    stem:
      "Two family members interrupt and accuse each other whenever a difficult topic arises. What intervention should the social worker use?",
    options: [
      "Structure turn taking, reflect each person's concern, and identify shared goals",
      "Ask the louder family member to leave immediately",
      "Let the argument continue so emotions can be released",
    ],
    answerIndex: 0,
    rationale:
      "Conflict work often requires structure, validation, communication rules, and shared problem definition.",
    examLens:
      "When conflict escalates, manage process before content.",
  },
  {
    id: "int-026",
    domain: "intervention",
    competency: "Anger management",
    skill: "application",
    difficulty: "foundation",
    tags: ["anger management", "coping skills", "triggers"],
    stem:
      "A client wants help with angry outbursts at work. Which intervention is MOST appropriate?",
    options: [
      "Identify triggers, early warning signs, time-out strategies, and alternative responses",
      "Encourage the client to suppress all anger",
      "Focus only on proving coworkers are wrong",
    ],
    answerIndex: 0,
    rationale:
      "Anger management includes trigger awareness, physiological cues, coping strategies, and replacement behaviors.",
    examLens:
      "Anger work is skill-based, not emotion elimination.",
  },
  {
    id: "int-027",
    domain: "intervention",
    competency: "Stress management",
    skill: "application",
    difficulty: "foundation",
    tags: ["stress management", "coping", "self-care"],
    stem:
      "A client under chronic work stress reports poor sleep and constant tension. What intervention is MOST appropriate?",
    options: [
      "Develop a stress management plan with sleep routines, relaxation skills, boundaries, and supports",
      "Tell the client stress is unavoidable and cannot be changed",
      "Recommend quitting the job immediately without assessment",
    ],
    answerIndex: 0,
    rationale:
      "Stress management uses practical coping, routines, boundaries, supports, and problem solving.",
    examLens:
      "Interventions should be concrete and matched to the client's context.",
  },
  {
    id: "int-028",
    domain: "intervention",
    competency: "Displacement and disaster response",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["displacement", "natural disaster", "crisis"],
    stem:
      "A family displaced by a flood arrives at a shelter distressed and unsure where relatives are. What should the social worker prioritize?",
    options: [
      "Immediate stabilization, basic needs, family reunification resources, and safety",
      "A detailed trauma narrative on the first contact",
      "Long-term psychodynamic interpretation",
    ],
    answerIndex: 0,
    rationale:
      "Disaster and displacement interventions first address safety, stabilization, practical needs, and connection to resources.",
    examLens:
      "In acute displacement, practical stabilization comes first.",
  },
  {
    id: "int-029",
    domain: "intervention",
    competency: "Psychodynamic intervention",
    skill: "application",
    difficulty: "applied",
    tags: ["psychodynamic", "patterns", "insight"],
    stem:
      "A client repeatedly expects supervisors to reject them and then withdraws at work. Which intervention is MOST psychodynamic?",
    options: [
      "Explore recurring relational patterns and how past experiences may shape current expectations",
      "Give the client a worksheet only on time management",
      "Tell the client the fear is irrational and should be ignored",
    ],
    answerIndex: 0,
    rationale:
      "Psychodynamic work explores recurring patterns, relational expectations, defenses, and links between past and present.",
    examLens:
      "Psychodynamic answers focus on insight into patterns and relationships.",
  },
  {
    id: "int-030",
    domain: "intervention",
    competency: "Task-centered practice",
    skill: "application",
    difficulty: "foundation",
    tags: ["task-centered", "goals", "problem solving"],
    stem:
      "A client wants help finding childcare so they can attend work. What is MOST consistent with task-centered practice?",
    options: [
      "Define the problem, set a short-term goal, identify tasks, and review progress",
      "Explore childhood memories for several months before action",
      "Tell the client to solve the problem independently",
    ],
    answerIndex: 0,
    rationale:
      "Task-centered practice emphasizes concrete problems, collaborative tasks, short-term goals, and progress review.",
    examLens:
      "Task-centered intervention is structured and action-oriented.",
  },
  {
    id: "int-031",
    domain: "intervention",
    competency: "Partializing",
    skill: "application",
    difficulty: "foundation",
    tags: ["partializing", "problem solving", "overwhelm"],
    stem:
      "A client lists eviction, debt, childcare, and panic symptoms and says, 'I cannot handle any of it.' What technique is MOST useful?",
    options: [
      "Partialize the concerns into manageable priorities and first steps",
      "Ask the client to solve all issues before the next session",
      "Focus only on the least urgent issue",
    ],
    answerIndex: 0,
    rationale:
      "Partializing breaks overwhelming problems into smaller, prioritized parts that can be addressed.",
    examLens:
      "When the problem feels too big, shrink the next step.",
  },
  {
    id: "int-032",
    domain: "intervention",
    competency: "Assertiveness training",
    skill: "application",
    difficulty: "foundation",
    tags: ["assertiveness", "skills", "communication"],
    stem:
      "A client avoids saying no and then feels resentful. Which intervention best matches assertiveness training?",
    options: [
      "Practice clear, respectful statements of needs and limits",
      "Encourage the client to confront others aggressively",
      "Tell the client to avoid all conflict",
    ],
    answerIndex: 0,
    rationale:
      "Assertiveness training teaches direct, respectful communication of needs, rights, and boundaries.",
    examLens:
      "Assertive is neither passive nor aggressive.",
  },
  {
    id: "int-033",
    domain: "intervention",
    competency: "Prevention strategies",
    skill: "application",
    difficulty: "foundation",
    tags: ["prevention", "public health", "community"],
    stem:
      "A community program teaches stress management skills to all high school students before symptoms emerge. What level of prevention is this?",
    options: ["Primary prevention", "Secondary prevention", "Tertiary prevention"],
    answerIndex: 0,
    rationale:
      "Primary prevention aims to reduce risk before a problem develops. Secondary detects early problems; tertiary reduces impact after a condition exists.",
    examLens:
      "Prevention level depends on timing relative to the problem.",
  },
  {
    id: "int-034",
    domain: "intervention",
    competency: "Permanency planning intervention",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["permanency planning", "child welfare", "collaboration"],
    stem:
      "A child in foster care has had multiple disrupted placements. What intervention should the social worker prioritize?",
    options: [
      "Coordinate a stable permanency plan that addresses safety, attachments, family connections, and the child's needs",
      "Move the child quickly without transition planning",
      "Focus only on the foster parents' convenience",
    ],
    answerIndex: 0,
    rationale:
      "Permanency planning aims for safe, stable, lasting arrangements while considering attachment, family connections, and child needs.",
    examLens:
      "Permanency is about stability, safety, and continuity.",
  },
  {
    id: "int-035",
    domain: "intervention",
    competency: "Service networks",
    skill: "application",
    difficulty: "applied",
    tags: ["case management", "service network", "resources"],
    stem:
      "A client needs mental health care, food support, transportation, and legal advocacy. What case management intervention is MOST appropriate?",
    options: [
      "Coordinate a service network with referrals, follow-up, and role clarification",
      "Give the client a long list of phone numbers and close the case",
      "Focus only on therapy because resources are not clinical",
    ],
    answerIndex: 0,
    rationale:
      "Case management coordinates resources, clarifies roles, follows up, and supports access across systems.",
    examLens:
      "Resource linkage includes coordination, not just handing out referrals.",
  },
  {
    id: "int-036",
    domain: "intervention",
    competency: "Program evaluation",
    skill: "application",
    difficulty: "foundation",
    tags: ["program evaluation", "outcomes", "services"],
    stem:
      "An agency wants to know whether a parenting program improves family functioning after completion. What should the social worker help identify?",
    options: [
      "Clear outcomes, data collection methods, and how findings will improve services",
      "Only staff opinions about whether the program feels useful",
      "A way to avoid measuring outcomes",
    ],
    answerIndex: 0,
    rationale:
      "Program evaluation uses defined outcomes and data to assess and improve services.",
    examLens:
      "Evaluation asks what changed and how we know.",
  },
  {
    id: "int-037",
    domain: "intervention",
    competency: "Interdisciplinary collaboration",
    skill: "application",
    difficulty: "applied",
    tags: ["interdisciplinary team", "collaboration", "roles"],
    stem:
      "A hospital discharge team disagrees about a client's plan. What should the social worker do?",
    options: [
      "Clarify roles, communicate client needs, advocate for safety, and collaborate on a coordinated plan",
      "Refuse to meet because other professions do not understand social work",
      "Let the most senior team member decide without discussion",
    ],
    answerIndex: 0,
    rationale:
      "Interdisciplinary work requires role clarity, communication, advocacy, and coordinated planning.",
    examLens:
      "Collaboration is active and client-centered.",
  },
  {
    id: "int-038",
    domain: "intervention",
    competency: "Supervision learning objectives",
    skill: "application",
    difficulty: "foundation",
    tags: ["supervision", "learning objectives", "professional development"],
    stem:
      "A supervisee says, 'I want to get better at crisis assessment.' What should the supervisor do?",
    options: [
      "Develop specific learning objectives, observation or practice opportunities, feedback, and evaluation",
      "Tell the supervisee to learn by trial and error",
      "Avoid crisis cases permanently",
    ],
    answerIndex: 0,
    rationale:
      "Supervision should translate learning needs into specific objectives, practice, feedback, and evaluation.",
    examLens:
      "Good supervision is structured, educational, and accountable.",
  },
  {
    id: "int-039",
    domain: "intervention",
    competency: "Community organizing",
    skill: "reasoning",
    difficulty: "applied",
    tags: ["community organizing", "participation", "social planning"],
    stem:
      "Residents want to address unsafe conditions in a housing complex. What should the social worker do to support community organizing?",
    options: [
      "Help residents identify shared concerns, build participation, develop goals, and plan collective action",
      "Speak for residents without involving them",
      "Tell residents individual therapy is the only social work response",
    ],
    answerIndex: 0,
    rationale:
      "Community organizing emphasizes participation, shared goals, leadership development, and collective action.",
    examLens:
      "Systems practice builds client and community capacity, not dependency.",
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
