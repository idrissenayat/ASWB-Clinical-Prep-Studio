import type { Difficulty, DomainId, ExamAreaId, QuestionInput, SkillType } from "./exam";

type QuestionDraft = {
  area: ExamAreaId;
  area2026: ExamAreaId;
  competency: string;
  skill: SkillType;
  difficulty: Difficulty;
  tags: string[];
  stem: string;
  correct: string;
  distractors: string[];
  rationale: string;
  examLens: string;
};

type Template = (index: number) => QuestionDraft;

const generatedTargets: Record<DomainId, number> = {
  ethics: 856,
  assessment: 761,
  intervention: 761,
};

const clientProfiles = [
  "a recently divorced parent",
  "an older adult living alone",
  "a college student",
  "a veteran",
  "a young adult in early recovery",
  "a caregiver for a disabled spouse",
  "a teenager referred by school",
  "a client experiencing homelessness",
  "a parent involved with child welfare",
  "a client with chronic pain",
  "a refugee client",
  "a client returning from hospitalization",
  "a client with panic symptoms",
  "a client with trauma history",
  "a mandated client",
  "a client grieving a recent death",
];

const settings = [
  "community mental health clinic",
  "hospital social work department",
  "school-based program",
  "outpatient substance use program",
  "family services agency",
  "telehealth session",
  "crisis walk-in center",
  "domestic violence program",
  "integrated primary care clinic",
  "court-connected service",
  "residential treatment program",
  "senior services agency",
];

const concerns = [
  "missed appointments",
  "family conflict",
  "sleep disruption",
  "financial stress",
  "panic attacks",
  "substance use relapse",
  "housing instability",
  "workplace discrimination",
  "caregiver burnout",
  "recent loss",
  "social isolation",
  "medication concerns",
  "school avoidance",
  "anger outbursts",
  "trauma reminders",
  "relationship violence concerns",
];

const collateralSources = [
  "a parent",
  "an adult sibling",
  "a probation officer",
  "a teacher",
  "a physician",
  "a partner",
  "a case manager",
  "a landlord",
];

const riskStatements = [
  "I cannot keep doing this",
  "someone is going to pay for this",
  "my family would be better without me",
  "I may lose control",
  "I do not trust myself tonight",
  "I have thought about ending it",
  "I want to disappear",
  "I might hurt the person who did this",
];

const culturalContexts = [
  "immigration stress",
  "racial discrimination",
  "religious meaning",
  "language access needs",
  "transgender identity concerns",
  "disability-related stigma",
  "intergenerational conflict",
  "community violence exposure",
];

const interventions = [
  "CBT skills",
  "motivational interviewing",
  "safety planning",
  "case management",
  "trauma-informed stabilization",
  "family sessions",
  "group work",
  "psychoeducation",
  "harm reduction",
  "solution-focused work",
  "assertiveness training",
  "crisis intervention",
];

const scenarioMoments = [
  "At this point",
  "Before choosing a response",
  "For the next clinical decision",
  "Before taking action",
  "At the current stage of service",
  "While deciding what to do next",
  "Before updating the plan",
  "During this contact",
  "For this practice decision",
  "Before making an outside contact",
  "Before documenting the next step",
  "During the focused clinical discussion",
  "Before selecting an intervention",
  "While reviewing responsibilities",
  "Before changing the service plan",
  "At this point in the assessment",
  "Before moving further",
];

const scenarioNotes = [
  "use only the facts provided",
  "avoid assumptions beyond the stem",
  "no final plan has been made",
  "choose from the information given",
  "focus on the most directly supported response",
  "no additional verified facts are available",
  "do not add facts that are not stated",
  "base the response on confirmed information",
  "the stem gives the information needed for the next step",
  "choose the response that follows from the stated facts",
  "the next step should match the presented concern",
  "respond to the facts available",
  "the answer should not assume missing details",
  "work from the stated client information",
  "select the response supported by the scenario",
  "ground the decision in what is known",
  "consider only facts that are given",
  "respond to the stated priority",
  "choose the best-supported next step",
];

function scenarioContext(domain: DomainId, number: number) {
  const domainOffset: Record<DomainId, number> = {
    ethics: 1,
    assessment: 2,
    intervention: 3,
  };

  return `${pick(scenarioMoments, number, domainOffset[domain])}, ${pick(
    scenarioNotes,
    number,
    domainOffset[domain] + 3,
  )}.`;
}

function contextualizeStem(stem: string, domain: DomainId, number: number) {
  const promptMatch = stem.match(/(?:^|\s)((?:What|Which|How|At approximately)\b[\s\S]*\?)$/);
  const context = scenarioContext(domain, number);

  if (!promptMatch || typeof promptMatch.index !== "number") {
    return sentenceCase(stem.trim().endsWith("?") ? `${context} ${stem}` : `${stem} ${context}`);
  }

  const lead = stem.slice(0, promptMatch.index).trimEnd();
  const contextualizedStem = lead
    ? `${lead} ${context} ${promptMatch[1]}`
    : `${context} ${promptMatch[1]}`;
  return sentenceCase(contextualizedStem);
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pick<T>(items: T[], index: number, offset = 0) {
  return items[(index * 7 + offset * 11) % items.length];
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function shuffleOptions(options: string[], seed: string) {
  const keyed = options.map((option, index) => ({
    option,
    key: hashString(`${seed}-${index}-${option}`),
  }));

  return keyed.sort((a, b) => a.key - b.key).map((item) => item.option);
}

function createQuestion(domain: DomainId, number: number, draft: QuestionDraft): QuestionInput {
  const id = `gen-${domain}-${number.toString().padStart(4, "0")}`;
  const options = shuffleOptions([draft.correct, ...draft.distractors], id);

  return {
    id,
    domain,
    area: draft.area,
    area2026: draft.area2026,
    competency: draft.competency,
    skill: draft.skill,
    difficulty: draft.difficulty,
    tags: draft.tags,
    stem: contextualizeStem(draft.stem, domain, number),
    options,
    answerIndex: options.indexOf(draft.correct),
    rationale: draft.rationale,
    examLens: draft.examLens,
  };
}

const ethicsTemplates: Template[] = [
  (index) => {
    const source = pick(collateralSources, index, 1);
    const profile = pick(clientProfiles, index, 2);
    const setting = pick(settings, index, 3);
    return {
      area: "IVB",
      area2026: "IA",
      competency: "Confidentiality and collateral contacts",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["confidentiality", "collateral", "release of information"],
      stem: `In a ${setting}, ${source} asks whether ${profile} is receiving services and requests details about ${pick(concerns, index, 4)}. What should the social worker do FIRST?`,
      correct:
        "Decline to confirm or share information without valid authorization or another applicable exception",
      distractors: [
        "Verify the caller's relationship and then confirm only whether services are active",
        "Offer general reassurance that the client has support without discussing symptoms",
        "Ask the caller to obtain a release before any details are discussed",
      ],
      rationale:
        "Confidentiality includes the fact that someone is a client. Disclosure requires proper authorization or a valid legal or safety exception.",
      examLens:
        "When someone asks about a client, protect the relationship before being helpful.",
    };
  },
  (index) => {
    const setting = pick(settings, index, 1);
    const profile = pick(clientProfiles, index, 2);
    return {
      area: "IVA",
      area2026: "IA",
      competency: "Informed consent and role clarity",
      skill: "application",
      difficulty: "foundation",
      tags: ["informed consent", "role clarity", "confidentiality"],
      stem: `${profile} begins disclosing sensitive information during an intake at a ${setting}. The service has reporting and documentation requirements the client may not understand. What should the social worker do?`,
      correct:
        "Explain the role, purpose of services, confidentiality limits, and how information may be used before proceeding",
      distractors: [
        "Complete the intake and review confidentiality limits at the end of the first session",
        "Give a general privacy handout and explain reporting duties only if they become relevant",
        "Begin with treatment goals and return to documentation requirements after rapport is stronger",
      ],
      rationale:
        "Clients need informed consent and role clarity before sharing sensitive information, especially when there are reporting or evaluative conditions.",
      examLens:
        "Orient before collecting sensitive information.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const boundaryIssue = pick(
      ["an expensive gift", "a social media request", "an invitation to a family event", "a request for a personal favor"],
      index,
      2,
    );
    return {
      area: "IVA",
      area2026: "IB",
      competency: "Professional boundaries",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["boundaries", "dual relationship", "clinical judgment"],
      stem: `${profile} presents ${boundaryIssue} and says accepting it would show respect for the relationship. What is the BEST response?`,
      correct:
        "Explore the meaning, discuss professional boundaries, consult if needed, and document the decision",
      distractors: [
        "Accept the request or gift once and process the boundary meaning in the next session",
        "Apply a blanket refusal policy and document that the boundary was maintained",
        "Refer the client solely because the request creates a possible dual relationship",
      ],
      rationale:
        "Boundary decisions should consider clinical meaning, culture, power, client welfare, consultation, and documentation.",
      examLens:
        "Boundary management is thoughtful risk management, not automatic rigidity.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 3);
    const risk = pick(["child neglect", "elder exploitation", "vulnerable adult abuse", "a credible threat of serious harm"], index, 4);
    return {
      area: "IVB",
      area2026: "IB",
      competency: "Mandatory reporting and protective duties",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["mandated reporting", "safety", "protective action"],
      stem: `During a session, ${profile} describes facts that create reasonable suspicion of ${risk}. What should the social worker do?`,
      correct:
        "Follow mandated reporting or protective action requirements and address immediate safety needs",
      distractors: [
        "Consult after the session and delay action until the facts are independently verified",
        "Encourage the client to make a voluntary report before deciding whether the worker must act",
        "Preserve confidentiality unless the possible victim confirms the concern directly",
      ],
      rationale:
        "Mandated reporting and protective duties are triggered by reasonable suspicion or credible risk, not proof.",
      examLens:
        "Safety and legal duties can override routine confidentiality.",
    };
  },
  (index) => {
    const recordIssue = pick(
      ["a subpoena", "a broad release of information", "a request for the complete chart", "a request to correct a factual note error"],
      index,
      5,
    );
    return {
      area: "IVB",
      area2026: "IB",
      competency: "Records and documentation integrity",
      skill: "application",
      difficulty: "applied",
      tags: ["records", "documentation", "confidentiality"],
      stem: `A social worker receives ${recordIssue} involving a current client. What principle should guide the response?`,
      correct:
        "Follow law and agency policy, disclose only what is authorized or required, and preserve record integrity",
      distractors: [
        "Provide a clinical summary before confirming the exact scope of the request",
        "Withhold all information until the client authorizes disclosure, even if law requires action",
        "Revise older notes so they better match the current understanding of the case",
      ],
      rationale:
        "Record handling requires legal-policy alignment, confidentiality, minimum necessary disclosure, and truthful documentation.",
      examLens:
        "Records are legal and clinical documents; handle them deliberately.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const refusal = pick(["medication evaluation", "group therapy", "residential placement", "family involvement"], index, 2);
    return {
      area: "IVC",
      area2026: "IB",
      competency: "Self-determination",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["self-determination", "capacity", "refusal"],
      stem: `${profile} has decision-making capacity and refuses ${refusal}. There is no imminent safety concern. What should the social worker do?`,
      correct:
        "Respect the refusal while exploring reasons, risks, alternatives, and supports",
      distractors: [
        "Make continued services conditional on accepting the recommendation",
        "Invite family members to explain the benefits before revisiting the client's choice",
        "Document the refusal and avoid further discussion so the client does not feel pressured",
      ],
      rationale:
        "A capable client may refuse recommended services. The worker can explore concerns and alternatives without coercion.",
      examLens:
        "Client choice stays central when safety and capacity do not require override.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 2);
    const specialty = pick(["complex trauma", "eating disorders", "neurocognitive disorders", "forensic evaluations"], index, 3);
    return {
      area: "IVC",
      area2026: "IA",
      competency: "Competence and consultation",
      skill: "application",
      difficulty: "foundation",
      tags: ["competence", "consultation", "scope"],
      stem: `A social worker is assigned ${profile} whose needs involve ${specialty}, an area outside the worker's training. What is the BEST next step?`,
      correct:
        "Seek supervision, consultation, training, or referral to ensure competent service",
      distractors: [
        "Continue services while independently reading about the specialty between sessions",
        "Transfer the client immediately without discussing continuity or interim risk",
        "Let the client decide whether the worker's general experience is sufficient",
      ],
      rationale:
        "Ethical practice requires working within competence and protecting continuity through consultation, supervision, training, or referral.",
      examLens:
        "Competence questions reward support and referral, not abandonment.",
    };
  },
  (index) => {
    const issue = pick(["appears impaired", "misses required documentation", "uses demeaning language", "ignores safety procedures"], index, 4);
    return {
      area: "IVA",
      area2026: "IA",
      competency: "Responsibilities to colleagues and clients",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["colleagues", "impairment", "client safety"],
      stem: `A social worker observes that a colleague ${issue} before meeting clients. What should guide the social worker's response?`,
      correct:
        "Protect clients, use appropriate supervisory or consultation channels, and escalate when risk is immediate",
      distractors: [
        "Address it informally later to preserve the working relationship",
        "Tell clients to reschedule without using supervisory or agency channels",
        "Document personal impressions and wait for several more examples before acting",
      ],
      rationale:
        "Responsibilities to colleagues do not override client welfare. The level of urgency depends on immediacy of risk.",
      examLens:
        "Client safety determines how quickly and directly to act.",
    };
  },
  (index) => {
    const techIssue = pick(["a lost device", "a telehealth client in another state", "a request to text clinical details", "a family member joining off-camera"], index, 5);
    return {
      area: "IVB",
      area2026: "IB",
      competency: "Technology-assisted practice",
      skill: "application",
      difficulty: "applied",
      tags: ["telehealth", "technology", "privacy"],
      stem: `During technology-assisted practice, the social worker encounters ${techIssue}. What is the BEST response?`,
      correct:
        "Address privacy, consent, location, emergency planning, and applicable policy before continuing",
      distractors: [
        "Continue after reminding the client to find as much privacy as possible",
        "Document the technology concern after the session and keep the usual treatment plan",
        "Ask the client whether they believe location or emergency planning rules apply",
      ],
      rationale:
        "Technology practice requires attention to confidentiality, consent, jurisdiction, emergency response, and agency policy.",
      examLens:
        "Telehealth adds logistics to ordinary ethical duties.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 2);
    const ending = pick(["the worker is leaving the agency", "the client has met goals", "the client is moving", "fees have become a barrier"], index, 3);
    return {
      area: "IVA",
      area2026: "IB",
      competency: "Termination and continuity",
      skill: "application",
      difficulty: "foundation",
      tags: ["termination", "continuity", "abandonment"],
      stem: `${profile} is approaching termination because ${ending}. What should the social worker include?`,
      correct:
        "Review progress, plan next supports, provide referrals when needed, and document continuity steps",
      distractors: [
        "Provide referral information but postpone discussion of progress and reactions",
        "Give the client a final date and close the case after the last scheduled session",
        "Complete the transfer administratively and let the next provider explain the change",
      ],
      rationale:
        "Ethical termination is planned, clinically responsive, documented, and oriented toward continuity of care.",
      examLens:
        "Termination should be prepared, not sprung on the client.",
    };
  },
  (index) => {
    const context = pick(culturalContexts, index, 2);
    const setting = pick(settings, index, 3);
    return {
      area: "IVA",
      area2026: "IC",
      competency: "Diversity and social justice",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["social justice", "anti-oppressive practice", "bias", "culture"],
      stem: `In a ${setting}, a client describes how ${context} is shaping access to care and trust in providers. What should guide the social worker's response?`,
      correct:
        "Explore the client's meaning, identify barriers and bias, and support access using culturally responsive and anti-oppressive practice",
      distractors: [
        "Assess symptoms first and return to access concerns after diagnosis is clarified",
        "Validate the concern but use the standard plan until the client requests accommodations",
        "Refer to a specialized provider before exploring what support the client wants",
      ],
      rationale:
        "Diversity and social justice questions require attention to meaning, access, power, bias, and culturally responsive service delivery.",
      examLens:
        "Identity and oppression are clinically relevant context, not distractions.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 4);
    const barrier = pick(["language access needs", "disability-related stigma", "immigration stress", "racial discrimination"], index, 5);
    return {
      area: "IVA",
      area2026: "IC",
      competency: "Accessibility and client rights",
      skill: "application",
      difficulty: "foundation",
      tags: ["accessibility", "language access", "equity", "client rights"],
      stem: `${profile} says ${barrier} makes it difficult to participate fully in services. What should the social worker do NEXT?`,
      correct:
        "Collaborate with the client to remove access barriers and arrange appropriate supports or accommodations",
      distractors: [
        "Offer the standard service and note the barrier for later treatment planning",
        "Ask the client to bring someone they trust to help them participate",
        "Delay nonurgent clinical work until accommodations are independently arranged",
      ],
      rationale:
        "Ethical and equitable practice includes reasonable access supports that protect privacy, dignity, and meaningful participation.",
      examLens:
        "Access is part of ethical service, not an optional courtesy.",
    };
  },
  (index) => {
    const limit = pick(["harm to self or others", "abuse reporting", "court order requirements", "professional consultation"], index, 1);
    return {
      area: "IVA",
      area2026: "IA",
      competency: "Informed consent and confidentiality limits",
      skill: "recall",
      difficulty: "foundation",
      tags: ["informed consent", "confidentiality", "ethics"],
      stem: `Which concept BEST describes explaining services, risks, alternatives, confidentiality limits such as ${limit}, and client rights before clinical work proceeds?`,
      correct:
        "Informed consent",
      distractors: [
        "Authorization for release of information",
        "Treatment contracting",
        "General agency orientation",
      ],
      rationale:
        "Informed consent means the client understands the service, expected use of information, limits of confidentiality, risks, benefits, alternatives, and rights.",
      examLens:
        "Recall items often ask for the professional concept that matches the practice task.",
    };
  },
  (index) => {
    const strain = pick(["emotional exhaustion", "reduced empathy", "intrusive trauma reminders", "feeling detached from clients"], index, 2);
    return {
      area: "IVC",
      area2026: "IA",
      competency: "Professional development and self-care",
      skill: "recall",
      difficulty: "foundation",
      tags: ["self-care", "burnout", "secondary trauma", "professional development"],
      stem: `A clinician notices ${strain} after repeated exposure to client trauma. Which professional responsibility is MOST directly involved?`,
      correct:
        "Using supervision, consultation, self-care, and professional development to protect competent practice",
      distractors: [
        "Using personal therapy alone without considering client-service impact",
        "Discussing the concern only after a formal performance problem is identified",
        "Reducing the caseload without consultation or continuity planning",
      ],
      rationale:
        "Burnout, secondary trauma, and compassion fatigue can affect competent service, so the worker should use support, self-care, and professional development.",
      examLens:
        "Use-of-self questions connect worker well-being to client welfare and competence.",
    };
  },
];

const assessmentTemplates: Template[] = [
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const statement = pick(riskStatements, index, 2);
    return {
      area: "IIB",
      area2026: "IIB",
      competency: "Risk assessment",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["risk", "safety", "assessment"],
      stem: `${profile} says, "${statement}." What should the social worker assess FIRST?`,
      correct:
        "Intent, plan, access to means, immediacy, past behavior, protective factors, and supports",
      distractors: [
        "Recent triggers, coping history, and family patterns before asking directly about means",
        "Current diagnosis, medication adherence, and therapy attendance before asking about intent",
        "Available supports and treatment goals before clarifying the level of immediate danger",
      ],
      rationale:
        "Ambiguous or direct risk statements require structured assessment of seriousness, immediacy, means, history, and protection.",
      examLens:
        "Risk assessment comes before deeper clinical exploration.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 2);
    const concern = pick(concerns, index, 3);
    return {
      area: "IIA",
      area2026: "IIA",
      competency: "Biopsychosocial assessment",
      skill: "application",
      difficulty: "foundation",
      tags: ["biopsychosocial", "strengths", "assessment"],
      stem: `${profile} presents with ${concern}, health concerns, family stress, and one reliable support. What assessment approach is MOST appropriate?`,
      correct:
        "Assess biological, psychological, social, cultural, spiritual, risk, and strength factors",
      distractors: [
        "Prioritize symptoms and medical history first, then add social context if treatment stalls",
        "Focus on environmental stressors because they appear to explain most symptoms",
        "Use the reliable support as the main collateral source before broadening the interview",
      ],
      rationale:
        "A biopsychosocial assessment integrates needs, context, culture, risk, and protective factors.",
      examLens:
        "Clinical assessment is broad before it narrows.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 3);
    const setting = pick(settings, index, 4);
    const pressure = pick(
      ["poverty-related stress", "school system pressure", "limited community resources", "family role changes", "neighborhood safety concerns"],
      index,
      5,
    );
    return {
      area: "IB",
      area2026: "IIA",
      competency: "Person-in-environment and social systems",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["person-in-environment", "systems", "social environment"],
      stem: `At a ${setting}, ${profile} connects current functioning to ${pressure}. What should the social worker assess?`,
      correct:
        "The interaction among individual functioning, relationships, environment, resources, and systems affecting the client",
      distractors: [
        "Primary symptom severity first, with systems factors added during treatment planning",
        "Agency eligibility and resource availability before exploring the client's functioning",
        "Which environmental stressor the client wants solved before assessing relational patterns",
      ],
      rationale:
        "Person-in-environment assessment considers how individual, relational, community, and institutional factors shape functioning and needs.",
      examLens:
        "ASWB questions often expect you to include environment when it affects functioning.",
    };
  },
  (index) => {
    const relationship = pick(["family conflict", "group pressure", "caregiver stress", "interpersonal conflict", "community disconnection"], index, 1);
    const impact = pick(["school functioning", "treatment engagement", "daily routines", "support seeking", "coping patterns"], index, 2);
    return {
      area: "IB",
      area2026: "IIA",
      competency: "Family and social environment dynamics",
      skill: "application",
      difficulty: "foundation",
      tags: ["family dynamics", "social environment", "support systems"],
      stem: `A client reports that ${relationship} is affecting ${impact}. What assessment focus is MOST appropriate?`,
      correct:
        "Assess relationship patterns, roles, supports, stressors, safety, and the client's functioning in context",
      distractors: [
        "Assess current symptom severity before asking about family or social roles",
        "Use the most involved family member as the primary source of context",
        "Consider family involvement after a diagnosis and treatment modality are selected",
      ],
      rationale:
        "Family and social environment dynamics are part of assessing client functioning, stress, supports, and risk.",
      examLens:
        "Clinical assessment includes the systems around the client.",
    };
  },
  (index) => {
    const symptom = pick(
      ["new confusion", "visual hallucinations", "sudden personality change", "severe headaches", "memory gaps", "tremors and stiffness"],
      index,
      4,
    );
    const trigger = pick(["after a fall", "after a medication change", "during withdrawal", "with fever", "after days without sleep"], index, 5);
    return {
      area: "IIB",
      area2026: "IIB",
      competency: "Medical and differential assessment",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["medical red flag", "differential diagnosis", "assessment"],
      stem: `A client reports ${symptom} ${trigger}. What should the social worker do FIRST?`,
      correct:
        "Assess safety and arrange appropriate medical or prescribing-provider evaluation",
      distractors: [
        "Complete a mental status exam and schedule routine therapy follow-up",
        "Explore psychosocial meaning while monitoring whether the symptom improves",
        "Document the symptom and suggest medical contact if it becomes more severe",
      ],
      rationale:
        "Sudden cognitive, neurologic, medication-related, or withdrawal symptoms may require medical evaluation.",
      examLens:
        "Medical red flags outrank routine psychotherapy.",
    };
  },
  (index) => {
    const profile = pick(["a preschool child", "an adolescent", "an older adult", "a new parent", "a young school-age child"], index, 1);
    const sign = pick(["regression", "peer withdrawal", "caregiver role strain", "developmental delays", "attachment distress"], index, 2);
    return {
      area: "IA",
      area2026: "IIA",
      competency: "Human development",
      skill: "application",
      difficulty: "foundation",
      tags: ["development", "lifespan", "assessment"],
      stem: `During assessment of ${profile}, the social worker notices ${sign}. What should guide the next step?`,
      correct:
        "Consider developmental stage, context, culture, safety, supports, and functioning",
      distractors: [
        "Compare the behavior with age expectations before assessing culture or safety",
        "Use the caregiver's explanation as the main developmental context",
        "Choose a diagnosis from the age-based symptom pattern before assessing functioning",
      ],
      rationale:
        "Developmental meaning depends on age, context, functioning, culture, and safety.",
      examLens:
        "Developmental questions ask you to match behavior with context.",
    };
  },
  (index) => {
    const context = pick(culturalContexts, index, 3);
    const concern = pick(concerns, index, 4);
    return {
      area: "IC",
      area2026: "IIA",
      competency: "Culture, identity, and discrimination",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["culture", "discrimination", "identity"],
      stem: `A client connects ${concern} to ${context}. What should the social worker assess?`,
      correct:
        "The client's meaning, identity context, discrimination stressors, supports, coping, and safety",
      distractors: [
        "Symptom frequency and severity before exploring identity or discrimination context",
        "Coping and supports while treating discrimination concerns as a referral issue",
        "Diagnostic criteria first so cultural meaning does not overly shape the assessment",
      ],
      rationale:
        "Culturally responsive assessment includes meaning, identity, oppression, coping, and environmental context.",
      examLens:
        "Culture and discrimination are assessment data, not side notes.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const condition = pick(["daily alcohol use", "opioid relapse", "stimulant use", "co-occurring depression", "unstable housing"], index, 2);
    return {
      area: "IIB",
      area2026: "IIC",
      competency: "Substance use and level of care",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["substance use", "level of care", "withdrawal"],
      stem: `${profile} reports ${condition}, limited supports, and difficulty staying safe between sessions. What should the social worker assess?`,
      correct:
        "Withdrawal risk, safety, supports, functioning, prior treatment response, and appropriate level of care",
      distractors: [
        "Motivation for abstinence and willingness to attend weekly outpatient therapy",
        "Relapse triggers and coping skills before considering medical or environmental risk",
        "Attendance history and treatment compliance as the main level-of-care indicators",
      ],
      rationale:
        "Substance use assessment considers safety, medical risk, environment, supports, and level of care needs.",
      examLens:
        "Level of care is based on assessed risk and support, not willpower.",
    };
  },
  (index) => {
    const source = pick(collateralSources, index, 2);
    const concern = pick(concerns, index, 3);
    return {
      area: "IIA",
      area2026: "IIB",
      competency: "Collateral data and testing",
      skill: "application",
      difficulty: "foundation",
      tags: ["collateral", "testing", "assessment"],
      stem: `A client's report about ${concern} differs from information provided by ${source}. What should the social worker do?`,
      correct:
        "With proper consent, integrate relevant collateral information with interview, observation, and context",
      distractors: [
        "Use the collateral report to challenge inconsistencies after consent is obtained",
        "Prioritize the collateral source because it may be more objective than self-report",
        "Wait to compare reports until treatment goals have been completed",
      ],
      rationale:
        "Collateral data can clarify assessment but must be obtained and interpreted ethically and contextually.",
      examLens:
        "Good assessment triangulates information without jumping to conclusions.",
    };
  },
  (index) => {
    const quote = pick(
      ["I know this is a problem, but I am not ready to change", "Everyone else thinks I need help, but I am not sure", "I want things different, but I am scared to start", "I only came because I was told to"],
      index,
      4,
    );
    return {
      area: "IIB",
      area2026: "IIB",
      competency: "Motivation and readiness",
      skill: "application",
      difficulty: "applied",
      tags: ["readiness", "motivation", "stages of change"],
      stem: `A client says, "${quote}." What should the social worker assess?`,
      correct:
        "Readiness, ambivalence, external pressure, goals, barriers, and possible change supports",
      distractors: [
        "The referral source's compliance expectations before exploring client-defined goals",
        "Specific action steps that will increase accountability before assessing ambivalence",
        "The presenting diagnosis and symptom severity before discussing readiness",
      ],
      rationale:
        "Statements of ambivalence or external pressure should lead to assessment of readiness and engagement factors.",
      examLens:
        "Resistance is often information about readiness.",
    };
  },
  (index) => {
    const indicator = pick(
      ["someone controls the client's documents", "a partner monitors phone use", "a caregiver withholds food", "wages are taken by another person", "threats are tied to immigration status"],
      index,
      5,
    );
    return {
      area: "IIB",
      area2026: "IIA",
      competency: "Abuse, neglect, and exploitation",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["abuse", "exploitation", "safety"],
      stem: `During assessment, the social worker learns that ${indicator}. What should be assessed FIRST?`,
      correct:
        "Immediate safety, coercion, exploitation, supports, reporting duties, and safe communication",
      distractors: [
        "Relationship history and communication patterns before asking about safe contact",
        "The client's preferred long-term goals before assessing coercion or immediate risk",
        "Family mediation options before determining whether protective action is required",
      ],
      rationale:
        "Control, threats, withholding resources, and exploitation require safety-focused assessment and possible reporting.",
      examLens:
        "Abuse dynamics often hide in control of resources, movement, or status.",
    };
  },
  (index) => {
    const finding = pick(["disorientation", "flat affect", "pressured speech", "poor impulse control", "paranoid thought content"], index, 2);
    return {
      area: "IIB",
      area2026: "IIB",
      competency: "Mental status examination",
      skill: "application",
      difficulty: "foundation",
      tags: ["mental status exam", "assessment", "diagnosis"],
      stem: `A mental status examination notes ${finding}. How should the social worker use this information?`,
      correct:
        "Integrate it with history, risk, functioning, medical factors, and client context",
      distractors: [
        "Use it to form a provisional diagnosis before reviewing history or risk",
        "Treat it as objective data but defer safety assessment until later in treatment",
        "Share it with collateral contacts if it may help explain the client's behavior",
      ],
      rationale:
        "Mental status findings are important assessment data but must be interpreted with broader clinical context.",
      examLens:
        "MSE findings inform assessment; they do not stand alone.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 3);
    const goal = pick(["reduce panic-related avoidance", "stabilize housing and treatment attendance", "increase safe coping after trauma reminders", "support recovery while reducing relapse risk"], index, 4);
    return {
      area: "IIC",
      area2026: "IIC",
      competency: "Treatment planning and resources",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["treatment planning", "resources", "service plan", "modality"],
      stem: `${profile} wants to ${goal}, but has limited supports and practical barriers. What should the social worker include in the assessment plan?`,
      correct:
        "Identify client goals, strengths, barriers, resource needs, level of care, and culturally appropriate intervention options",
      distractors: [
        "Select a likely modality from the presenting goal, then address resources later",
        "Write measurable goals from the agency's available services and revise if needed",
        "Focus on practical barriers during discharge planning if attendance declines",
      ],
      rationale:
        "Assessment practices connect assessed needs and strengths to service planning, resources, treatment modality selection, and level of care.",
      examLens:
        "A good plan grows from assessment data, not from provider convenience.",
    };
  },
  (index) => {
    const factor = pick(["medical status", "family support", "culture", "housing", "spiritual meaning"], index, 1);
    return {
      area: "IIA",
      area2026: "IIA",
      competency: "Biopsychosocial and person-in-environment concepts",
      skill: "recall",
      difficulty: "foundation",
      tags: ["biopsychosocial", "person-in-environment", "assessment"],
      stem: `Which assessment model BEST fits integrating symptoms, strengths, environment, relationships, and ${factor}?`,
      correct:
        "Biopsychosocial person-in-environment assessment",
      distractors: [
        "Problem-focused symptom inventory",
        "Resource eligibility screening",
        "Clinical treatment contracting",
      ],
      rationale:
        "Biopsychosocial and person-in-environment assessment integrates individual functioning with relationships, culture, resources, and environmental conditions.",
      examLens:
        "Recall questions may test the name of a broad assessment concept.",
    };
  },
  (index) => {
    const observation = pick(["appearance and behavior", "mood and affect", "thought process", "orientation", "insight and judgment"], index, 2);
    return {
      area: "IIB",
      area2026: "IIB",
      competency: "Mental status examination",
      skill: "recall",
      difficulty: "foundation",
      tags: ["mental status exam", "assessment", "diagnosis"],
      stem: `A mental status examination includes ${observation}. This finding is BEST understood as what type of information?`,
      correct:
        "Current clinical observation that must be interpreted with history, risk, and context",
      distractors: [
        "A diagnostic conclusion that determines the initial treatment plan",
        "Collateral data that is more reliable than the client's report",
        "A stable trait that should be interpreted apart from the current context",
      ],
      rationale:
        "Mental status findings document current observations and should be integrated with broader assessment data.",
      examLens:
        "MSE recall questions test what the observation means and what it can and cannot prove.",
    };
  },
];

const interventionTemplates: Template[] = [
  (index) => {
    const profile = pick(clientProfiles, index, 2);
    const concern = pick(concerns, index, 3);
    return {
      area: "IIIA",
      area2026: "IIIA",
      competency: "Helping relationship and practice concepts",
      skill: "application",
      difficulty: "foundation",
      tags: ["helping relationship", "strengths-based", "problem-solving process"],
      stem: `${profile} is hesitant to discuss ${concern} and says previous providers did not listen. What should the social worker do FIRST?`,
      correct:
        "Use empathy, acceptance, strengths-based engagement, and collaborative problem definition",
      distractors: [
        "Normalize the concern and offer a practical technique before exploring goals",
        "Clarify agency expectations first and return to mistrust once the role is established",
        "Select an intervention from the referral concern and refine goals after rapport improves",
      ],
      rationale:
        "Practice concepts include building and maintaining the helping relationship, using strengths-based engagement, and collaborating in problem solving.",
      examLens:
        "When trust is fragile, build the relationship and define the problem together.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const crisis = pick(["a community shooting", "sudden eviction", "a panic episode", "a recent assault", "a disaster displacement"], index, 2);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Crisis intervention",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["crisis", "stabilization", "safety"],
      stem: `${profile} arrives immediately after ${crisis}, overwhelmed and unable to plan. What should the social worker do FIRST?`,
      correct:
        "Address immediate safety, stabilization, grounding, basic needs, and short-term supports",
      distractors: [
        "Begin a brief incident narrative to understand the trauma exposure before grounding",
        "Identify long-term treatment goals once the client can describe the event coherently",
        "Arrange referral and discharge resources after documenting the presenting crisis",
      ],
      rationale:
        "Crisis intervention starts with safety, stabilization, immediate needs, and support.",
      examLens:
        "In crisis, stabilize before processing.",
    };
  },
  (index) => {
    const changeTarget = pick(
      ["drinking", "cannabis use", "missing appointments", "avoiding family conversations", "angry outbursts", "gambling", "isolating from supports"],
      index,
      2,
    );
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Motivational interviewing",
      skill: "application",
      difficulty: "applied",
      tags: ["motivational interviewing", "ambivalence", "engagement"],
      stem: `A client says, "Part of me wants to change ${changeTarget}, but part of me does not want to give it up." Which response BEST fits motivational interviewing?`,
      correct:
        "You are pulled in two directions: one part sees reasons to change, and another part is not ready",
      distractors: [
        "You already know change is needed, so let's focus on the reasons to stop",
        "What would convince the part that does not want change to choose a healthier option?",
        "It sounds like the next step is choosing a plan that keeps you accountable",
      ],
      rationale:
        "MI reflects ambivalence, supports autonomy, and avoids arguing for change prematurely.",
      examLens:
        "MI sounds collaborative, reflective, and autonomy-supportive.",
    };
  },
  (index) => {
    const thought = pick(
      ["Everyone will reject me", "I will fail immediately", "I am not safe anywhere", "One mistake means I am worthless"],
      index,
      3,
    );
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Cognitive behavioral intervention",
      skill: "application",
      difficulty: "foundation",
      tags: ["CBT", "cognitive restructuring", "anxiety"],
      stem: `A client reports the thought, "${thought}." Which intervention is MOST consistent with CBT?`,
      correct:
        "Examine evidence for and against the thought and develop a balanced alternative",
      distractors: [
        "Identify the early experience that first created the thought",
        "Practice thought-stopping whenever the thought appears",
        "Provide reassurance that the feared outcome is unlikely",
      ],
      rationale:
        "CBT works with links among thoughts, feelings, behaviors, evidence, and skill practice.",
      examLens:
        "CBT answers often test or reframe thoughts and behaviors.",
    };
  },
  (index) => {
    const symptom = pick(["dissociation", "nightmares", "hypervigilance", "avoidance", "emotional flooding"], index, 4);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Trauma-informed intervention",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["trauma", "stabilization", "sequencing"],
      stem: `A trauma survivor wants to process details, but current sessions show frequent ${symptom}. What should the social worker prioritize?`,
      correct:
        "Stabilization, coping skills, grounding, safety, and readiness before intensive processing",
      distractors: [
        "Honor the client's request by beginning processing while adding grounding afterward",
        "Shift to psychoeducation only until trauma symptoms are no longer present",
        "Use cognitive restructuring to challenge trauma beliefs before stabilization",
      ],
      rationale:
        "Trauma-informed sequencing addresses safety and stabilization before intensive processing when symptoms overwhelm capacity.",
      examLens:
        "Readiness and stabilization protect trauma work.",
    };
  },
  (index) => {
    const groupIssue = pick(["one member dominates", "members argue", "a quiet member withdraws", "confidentiality is questioned"], index, 5);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Group and family process",
      skill: "application",
      difficulty: "applied",
      tags: ["group work", "family work", "process"],
      stem: `During a clinical group or family session, ${groupIssue}. What should the social worker do?`,
      correct:
        "Structure the process, validate concerns, reinforce expectations, and invite balanced participation",
      distractors: [
        "Move quickly to solving the content issue so group tension decreases",
        "Meet with the most distressed participant later and let the group continue",
        "Review group rules privately after session without addressing the current process",
      ],
      rationale:
        "Group and family work requires active management of safety, participation, norms, and communication.",
      examLens:
        "When process breaks down, structure the process before solving content.",
    };
  },
  (index) => {
    const barrier = pick(["transportation loss", "childcare instability", "insurance denial", "food insecurity", "limited phone access"], index, 1);
    return {
      area: "IIIC",
      area2026: "IIIB",
      competency: "Case management and access",
      skill: "application",
      difficulty: "applied",
      tags: ["case management", "resources", "access"],
      stem: `A client misses treatment because of ${barrier}. What intervention is MOST appropriate?`,
      correct:
        "Explore barriers and coordinate practical resources, referrals, follow-up, or service alternatives",
      distractors: [
        "Review attendance expectations and ask the client to recommit to treatment",
        "Explore motivation for treatment before addressing concrete access barriers",
        "Refer to a separate case manager without coordinating follow-up",
      ],
      rationale:
        "Social work intervention includes addressing access barriers that interfere with care and functioning.",
      examLens:
        "Missed services may be a systems problem.",
    };
  },
  (index) => {
    const profile = pick(clientProfiles, index, 3);
    const risk = pick(["suicidal urges", "self-harm urges", "unsafe conflict at home", "relapse triggers", "panic escalation"], index, 4);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Safety planning and coping skills",
      skill: "application",
      difficulty: "exam-ready",
      tags: ["safety planning", "coping", "risk"],
      stem: `${profile} reports intermittent ${risk} but can collaborate in planning. What should the social worker do?`,
      correct:
        "Develop a concrete plan with warning signs, coping steps, supports, emergency resources, and follow-up",
      distractors: [
        "Review coping skills generally and schedule an earlier follow-up appointment",
        "Ask the client to contact a crisis line if urges increase and continue the session agenda",
        "Document denial of current intent and revisit the topic if risk escalates",
      ],
      rationale:
        "Safety planning is collaborative, specific, practical, and linked to supports and follow-up.",
      examLens:
        "Risk intervention needs concrete next steps.",
    };
  },
  (index) => {
    const result = pick(["symptoms are unchanged", "goals have been met", "attendance has dropped", "new barriers have emerged"], index, 2);
    return {
      area: "IIIB",
      area2026: "IIIC",
      competency: "Evaluation and termination",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["evaluation", "termination", "treatment planning"],
      stem: `After several sessions, ${result}. What should the social worker do?`,
      correct:
        "Review progress with the client, update the plan, and address termination or referrals when appropriate",
      distractors: [
        "Continue the current plan until the next scheduled formal treatment review",
        "Use outcome information internally before discussing any changes with the client",
        "Prepare termination or referral only after several additional sessions confirm the pattern",
      ],
      rationale:
        "Ongoing evaluation uses client feedback and outcomes to adjust treatment, plan transition, or consolidate gains.",
      examLens:
        "Evaluate, discuss, and adjust.",
    };
  },
  (index) => {
    const outcome = pick(["dropout rates increased", "client goal completion improved", "referral follow-through decreased", "waitlist times changed"], index, 4);
    return {
      area: "IIIC",
      area2026: "IIIC",
      competency: "Practice evaluation and outcomes",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["evaluation", "outcomes", "program", "quality assurance"],
      stem: `A clinic reviews service data and finds that ${outcome}. What should the social worker consider NEXT?`,
      correct:
        "Compare outcomes with program objectives, assess data quality, and identify practice or service changes to evaluate",
      distractors: [
        "Compare the finding with staff impressions before deciding whether procedures matter",
        "Use the finding to select a new service model and evaluate it after implementation",
        "Report the metric as success or failure before reviewing data quality and objectives",
      ],
      rationale:
        "Practice evaluation uses outcomes, program objectives, data quality, and service impact to guide improvement.",
      examLens:
        "Evaluation questions ask what the evidence says and how practice should respond.",
    };
  },
  (index) => {
    const approach = pick(["harm reduction", "assertiveness training", "self-monitoring", "role play", "stress management"], index, 3);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Skills-based intervention",
      skill: "application",
      difficulty: "foundation",
      tags: ["skills", "coping", "practice"],
      stem: `A client needs a practical way to use ${approach} between sessions. What should the social worker do?`,
      correct:
        "Collaboratively teach, rehearse, tailor, and review the skill in the client's real-life context",
      distractors: [
        "Explain the skill and ask the client to try it independently before the next session",
        "Provide written instructions and review the skill only if the client reports difficulty",
        "Choose the skill that works best for similar clients and assign it as homework",
      ],
      rationale:
        "Skills interventions work best when taught, practiced, tailored, and reviewed collaboratively.",
      examLens:
        "Practical interventions need practice and follow-up.",
    };
  },
  (index) => {
    const system = pick(["housing", "school", "health care", "criminal justice", "public benefits"], index, 4);
    return {
      area: "IIID",
      area2026: "IIIA",
      competency: "Advocacy and interdisciplinary practice",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["advocacy", "collaboration", "systems"],
      stem: `A client needs help navigating the ${system} system while continuing clinical care. What should the social worker do?`,
      correct:
        "Clarify client goals, obtain consent, coordinate with relevant systems, and support client advocacy",
      distractors: [
        "Contact the system to explain professional recommendations before obtaining consent",
        "Coach the client to navigate the system independently before considering coordination",
        "Focus on clinical symptoms first and return to systems after functioning improves",
      ],
      rationale:
        "Systems intervention includes consent, coordination, advocacy, and support for client self-determination.",
      examLens:
        "Advocacy should increase client power, not replace it.",
    };
  },
  (index) => {
    const supervisionIssue = pick(["countertransference", "unclear learning goals", "a complex risk case", "a boundary concern"], index, 2);
    return {
      area: "IIID",
      area2026: "IIID",
      competency: "Supervision and consultation",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["supervision", "consultation", "client welfare"],
      stem: `During supervision, a clinician identifies ${supervisionIssue} affecting service delivery. What should the social worker do?`,
      correct:
        "Use supervision or consultation to clarify risk, learning needs, ethical duties, and next practice steps",
      distractors: [
        "Document the concern and continue the current approach while monitoring impact",
        "Use supervision to discuss learning needs but keep risk decisions unchanged",
        "Ask the supervisor to take over the case without clinician reflection or planning",
      ],
      rationale:
        "Supervision and consultation support ethical practice, client welfare, self-assessment, and appropriate decision-making.",
      examLens:
        "Supervision questions reward reflection, consultation, and protection of client welfare.",
    };
  },
  (index) => {
    const agencyIssue = pick(["a privacy breach pattern", "inconsistent crisis procedures", "unsafe record access", "unclear referral workflows"], index, 3);
    return {
      area: "IIID",
      area2026: "IIID",
      competency: "Policy and administration",
      skill: "application",
      difficulty: "exam-ready",
      tags: ["administration", "policy and procedure", "risk management", "organizations"],
      stem: `An agency identifies ${agencyIssue} that could affect multiple clients. What administrative response is MOST appropriate?`,
      correct:
        "Review policy, clarify procedures, train staff, monitor implementation, and evaluate whether risk decreases",
      distractors: [
        "Remind staff of the existing policy and handle future incidents individually",
        "Create a new policy before reviewing causes or implementation barriers",
        "Document the pattern and wait for the quality committee's next scheduled review",
      ],
      rationale:
        "Administrative practice includes policy development, risk reduction, staff training, implementation, and evaluation.",
      examLens:
        "System-level risk needs a system-level response.",
    };
  },
  (index) => {
    const target = pick(["reducing overdose risk", "safer substance use planning", "reducing injury risk", "linking the client to practical supports"], index, 1);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Harm reduction",
      skill: "recall",
      difficulty: "foundation",
      tags: ["harm reduction", "substance use", "intervention"],
      stem: `Which intervention approach is MOST associated with ${target} even when abstinence is not the client's immediate goal?`,
      correct:
        "Harm reduction",
      distractors: [
        "Motivational interviewing",
        "Relapse prevention planning",
        "Substance-use psychoeducation",
      ],
      rationale:
        "Harm reduction focuses on decreasing risk and increasing safety while respecting client autonomy and readiness.",
      examLens:
        "Recall items can ask you to match a named intervention to its main purpose.",
    };
  },
  (index) => {
    const task = pick(["reviewing progress", "planning follow-up supports", "discussing relapse prevention", "consolidating gains"], index, 2);
    return {
      area: "IIIB",
      area2026: "IIIB",
      competency: "Planned termination",
      skill: "recall",
      difficulty: "foundation",
      tags: ["termination", "follow-up", "intervention"],
      stem: `Which treatment phase is MOST associated with ${task} and preparing the client for continuity after services end?`,
      correct:
        "Termination",
      distractors: [
        "Evaluation",
        "Follow-up",
        "Engagement",
      ],
      rationale:
        "Planned termination includes reviewing goals, consolidating progress, arranging follow-up, and preparing for continuity.",
      examLens:
        "Termination questions usually reward preparation and continuity, not abrupt ending.",
    };
  },
];

function buildDomainQuestions(domain: DomainId, templates: Template[]) {
  return Array.from({ length: generatedTargets[domain] }, (_, index) => {
    const template = templates[index % templates.length];
    return createQuestion(domain, index + 1, template(index));
  });
}

export const generatedQuestions: QuestionInput[] = [
  ...buildDomainQuestions("ethics", ethicsTemplates),
  ...buildDomainQuestions("assessment", assessmentTemplates),
  ...buildDomainQuestions("intervention", interventionTemplates),
];
