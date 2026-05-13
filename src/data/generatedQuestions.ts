import type { Difficulty, DomainId, Question, SkillType } from "./exam";

type QuestionDraft = {
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

function createQuestion(domain: DomainId, number: number, draft: QuestionDraft): Question {
  const id = `gen-${domain}-${number.toString().padStart(4, "0")}`;
  const options = shuffleOptions([draft.correct, ...draft.distractors], id);

  return {
    id,
    domain,
    competency: draft.competency,
    skill: draft.skill,
    difficulty: draft.difficulty,
    tags: draft.tags,
    stem: draft.stem,
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
      competency: "Confidentiality and collateral contacts",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["confidentiality", "collateral", "release of information"],
      stem: `In a ${setting}, ${source} asks whether ${profile} is receiving services and requests details about ${pick(concerns, index, 4)}. What should the social worker do FIRST?`,
      correct:
        "Decline to confirm or share information without valid authorization or another applicable exception",
      distractors: [
        "Confirm attendance but avoid sharing the diagnosis",
        "Share only the most helpful clinical details because the caller is concerned",
        "Ask the caller to summarize the concern publicly in writing",
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
      competency: "Informed consent and role clarity",
      skill: "application",
      difficulty: "foundation",
      tags: ["informed consent", "role clarity", "confidentiality"],
      stem: `${profile} begins disclosing sensitive information during an intake at a ${setting}. The service has reporting and documentation requirements the client may not understand. What should the social worker do?`,
      correct:
        "Explain the role, purpose of services, confidentiality limits, and how information may be used before proceeding",
      distractors: [
        "Complete the full assessment before discussing limits so rapport is not disrupted",
        "Promise complete privacy unless the client signs a release",
        "Tell the client details can be discussed after treatment goals are written",
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
      competency: "Professional boundaries",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["boundaries", "dual relationship", "clinical judgment"],
      stem: `${profile} presents ${boundaryIssue} and says accepting it would show respect for the relationship. What is the BEST response?`,
      correct:
        "Explore the meaning, discuss professional boundaries, consult if needed, and document the decision",
      distractors: [
        "Accept immediately to avoid harming rapport",
        "Refuse without discussion because every boundary issue has the same answer",
        "End services because the client has crossed a boundary",
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
      competency: "Mandatory reporting and protective duties",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["mandated reporting", "safety", "protective action"],
      stem: `During a session, ${profile} describes facts that create reasonable suspicion of ${risk}. What should the social worker do?`,
      correct:
        "Follow mandated reporting or protective action requirements and address immediate safety needs",
      distractors: [
        "Wait for proof before taking action",
        "Ask the alleged victim to investigate and report back",
        "Avoid reporting unless the client gives written permission",
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
      competency: "Records and documentation integrity",
      skill: "application",
      difficulty: "applied",
      tags: ["records", "documentation", "confidentiality"],
      stem: `A social worker receives ${recordIssue} involving a current client. What principle should guide the response?`,
      correct:
        "Follow law and agency policy, disclose only what is authorized or required, and preserve record integrity",
      distractors: [
        "Release the full record whenever another professional asks",
        "Delete old notes to reduce risk",
        "Let convenience determine what is shared",
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
      competency: "Self-determination",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["self-determination", "capacity", "refusal"],
      stem: `${profile} has decision-making capacity and refuses ${refusal}. There is no imminent safety concern. What should the social worker do?`,
      correct:
        "Respect the refusal while exploring reasons, risks, alternatives, and supports",
      distractors: [
        "End services because refusal means noncompliance",
        "Ask family members to pressure the client",
        "Override the decision because the worker's recommendation is clinically sound",
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
      competency: "Competence and consultation",
      skill: "application",
      difficulty: "foundation",
      tags: ["competence", "consultation", "scope"],
      stem: `A social worker is assigned ${profile} whose needs involve ${specialty}, an area outside the worker's training. What is the BEST next step?`,
      correct:
        "Seek supervision, consultation, training, or referral to ensure competent service",
      distractors: [
        "Proceed independently because all clinical skills transfer equally",
        "Refuse all contact with the client without transition planning",
        "Ask the client to educate the worker about the specialty",
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
      competency: "Responsibilities to colleagues and clients",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["colleagues", "impairment", "client safety"],
      stem: `A social worker observes that a colleague ${issue} before meeting clients. What should guide the social worker's response?`,
      correct:
        "Protect clients, use appropriate supervisory or consultation channels, and escalate when risk is immediate",
      distractors: [
        "Ignore the behavior because colleague issues are private",
        "Warn clients directly before gathering any context",
        "Post a concern anonymously so others can decide",
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
      competency: "Technology-assisted practice",
      skill: "application",
      difficulty: "applied",
      tags: ["telehealth", "technology", "privacy"],
      stem: `During technology-assisted practice, the social worker encounters ${techIssue}. What is the BEST response?`,
      correct:
        "Address privacy, consent, location, emergency planning, and applicable policy before continuing",
      distractors: [
        "Continue as usual because technology does not change clinical duties",
        "Stop all services permanently whenever technology creates a question",
        "Ask the client to decide which legal rules apply",
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
      competency: "Termination and continuity",
      skill: "application",
      difficulty: "foundation",
      tags: ["termination", "continuity", "abandonment"],
      stem: `${profile} is approaching termination because ${ending}. What should the social worker include?`,
      correct:
        "Review progress, plan next supports, provide referrals when needed, and document continuity steps",
      distractors: [
        "End abruptly to promote independence",
        "Avoid discussing termination because it may upset the client",
        "Transfer the client without explanation",
      ],
      rationale:
        "Ethical termination is planned, clinically responsive, documented, and oriented toward continuity of care.",
      examLens:
        "Termination should be prepared, not sprung on the client.",
    };
  },
];

const assessmentTemplates: Template[] = [
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const statement = pick(riskStatements, index, 2);
    return {
      competency: "Risk assessment",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["risk", "safety", "assessment"],
      stem: `${profile} says, "${statement}." What should the social worker assess FIRST?`,
      correct:
        "Intent, plan, access to means, immediacy, past behavior, protective factors, and supports",
      distractors: [
        "Long-term childhood themes before discussing safety",
        "Whether the client can complete homework before the next session",
        "Only the client's diagnosis",
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
      competency: "Biopsychosocial assessment",
      skill: "application",
      difficulty: "foundation",
      tags: ["biopsychosocial", "strengths", "assessment"],
      stem: `${profile} presents with ${concern}, health concerns, family stress, and one reliable support. What assessment approach is MOST appropriate?`,
      correct:
        "Assess biological, psychological, social, cultural, spiritual, risk, and strength factors",
      distractors: [
        "Focus only on symptoms to avoid overwhelming the client",
        "Delay assessment until every external problem is solved",
        "Assess only the strongest support because strengths matter most",
      ],
      rationale:
        "A biopsychosocial assessment integrates needs, context, culture, risk, and protective factors.",
      examLens:
        "Clinical assessment is broad before it narrows.",
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
      competency: "Medical and differential assessment",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["medical red flag", "differential diagnosis", "assessment"],
      stem: `A client reports ${symptom} ${trigger}. What should the social worker do FIRST?`,
      correct:
        "Assess safety and arrange appropriate medical or prescribing-provider evaluation",
      distractors: [
        "Begin insight-oriented therapy immediately",
        "Assume the symptom is attention-seeking",
        "Wait several sessions to see whether the symptom resolves",
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
      competency: "Human development",
      skill: "application",
      difficulty: "foundation",
      tags: ["development", "lifespan", "assessment"],
      stem: `During assessment of ${profile}, the social worker notices ${sign}. What should guide the next step?`,
      correct:
        "Consider developmental stage, context, culture, safety, supports, and functioning",
      distractors: [
        "Assume the behavior has the same meaning at every age",
        "Focus only on the caregiver's explanation",
        "Skip developmental context and move directly to diagnosis",
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
      competency: "Culture, identity, and discrimination",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["culture", "discrimination", "identity"],
      stem: `A client connects ${concern} to ${context}. What should the social worker assess?`,
      correct:
        "The client's meaning, identity context, discrimination stressors, supports, coping, and safety",
      distractors: [
        "Whether the client is overreacting to ordinary stress",
        "Only symptoms that fit a diagnosis",
        "Whether the client can avoid discussing identity in therapy",
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
      competency: "Substance use and level of care",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["substance use", "level of care", "withdrawal"],
      stem: `${profile} reports ${condition}, limited supports, and difficulty staying safe between sessions. What should the social worker assess?`,
      correct:
        "Withdrawal risk, safety, supports, functioning, prior treatment response, and appropriate level of care",
      distractors: [
        "Whether the client can promise perfect attendance",
        "Only the client's motivation to stop",
        "Whether therapy should end because relapse occurred",
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
      competency: "Collateral data and testing",
      skill: "application",
      difficulty: "foundation",
      tags: ["collateral", "testing", "assessment"],
      stem: `A client's report about ${concern} differs from information provided by ${source}. What should the social worker do?`,
      correct:
        "With proper consent, integrate relevant collateral information with interview, observation, and context",
      distractors: [
        "Assume the client is lying",
        "Accept collateral information as automatically more accurate",
        "Ignore collateral data because it is not clinical",
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
      competency: "Motivation and readiness",
      skill: "application",
      difficulty: "applied",
      tags: ["readiness", "motivation", "stages of change"],
      stem: `A client says, "${quote}." What should the social worker assess?`,
      correct:
        "Readiness, ambivalence, external pressure, goals, barriers, and possible change supports",
      distractors: [
        "Whether the client should be discharged for resistance",
        "Whether the client can be forced to develop insight",
        "Only the presenting diagnosis",
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
      competency: "Abuse, neglect, and exploitation",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["abuse", "exploitation", "safety"],
      stem: `During assessment, the social worker learns that ${indicator}. What should be assessed FIRST?`,
      correct:
        "Immediate safety, coercion, exploitation, supports, reporting duties, and safe communication",
      distractors: [
        "Whether the client caused the situation",
        "Couples communication skills before safety",
        "Long-term insight before basic protection",
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
      competency: "Mental status examination",
      skill: "application",
      difficulty: "foundation",
      tags: ["mental status exam", "assessment", "diagnosis"],
      stem: `A mental status examination notes ${finding}. How should the social worker use this information?`,
      correct:
        "Integrate it with history, risk, functioning, medical factors, and client context",
      distractors: [
        "Treat it as a complete diagnosis by itself",
        "Ignore it because only psychiatrists use mental status findings",
        "Share it with family without consent",
      ],
      rationale:
        "Mental status findings are important assessment data but must be interpreted with broader clinical context.",
      examLens:
        "MSE findings inform assessment; they do not stand alone.",
    };
  },
];

const interventionTemplates: Template[] = [
  (index) => {
    const profile = pick(clientProfiles, index, 1);
    const crisis = pick(["a community shooting", "sudden eviction", "a panic episode", "a recent assault", "a disaster displacement"], index, 2);
    return {
      competency: "Crisis intervention",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["crisis", "stabilization", "safety"],
      stem: `${profile} arrives immediately after ${crisis}, overwhelmed and unable to plan. What should the social worker do FIRST?`,
      correct:
        "Address immediate safety, stabilization, grounding, basic needs, and short-term supports",
      distractors: [
        "Ask for a detailed trauma narrative before stabilization",
        "Begin long-term interpretation of family patterns",
        "Focus on discharge before assessing current safety",
      ],
      rationale:
        "Crisis intervention starts with safety, stabilization, immediate needs, and support.",
      examLens:
        "In crisis, stabilize before processing.",
    };
  },
  (index) => {
    const concern = pick(concerns, index, 2);
    return {
      competency: "Motivational interviewing",
      skill: "application",
      difficulty: "applied",
      tags: ["motivational interviewing", "ambivalence", "engagement"],
      stem: `A client says, "Part of me wants to change ${concern}, but part of me does not want to give it up." Which response BEST fits motivational interviewing?`,
      correct:
        "You are pulled in two directions: one part sees reasons to change, and another part is not ready",
      distractors: [
        "You need to decide today or treatment cannot work",
        "The part that does not want change is the unhealthy part",
        "Let me explain why change is the only reasonable choice",
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
      competency: "Cognitive behavioral intervention",
      skill: "application",
      difficulty: "foundation",
      tags: ["CBT", "cognitive restructuring", "anxiety"],
      stem: `A client reports the thought, "${thought}." Which intervention is MOST consistent with CBT?`,
      correct:
        "Examine evidence for and against the thought and develop a balanced alternative",
      distractors: [
        "Tell the client the thought is irrational and should stop immediately",
        "Avoid discussing thoughts and focus only on childhood history",
        "Insist the thought is accurate until proven otherwise",
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
      competency: "Trauma-informed intervention",
      skill: "reasoning",
      difficulty: "exam-ready",
      tags: ["trauma", "stabilization", "sequencing"],
      stem: `A trauma survivor wants to process details, but current sessions show frequent ${symptom}. What should the social worker prioritize?`,
      correct:
        "Stabilization, coping skills, grounding, safety, and readiness before intensive processing",
      distractors: [
        "Begin exposure immediately because the client requested it",
        "Avoid all trauma treatment permanently",
        "Challenge the client for resisting treatment",
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
      competency: "Group and family process",
      skill: "application",
      difficulty: "applied",
      tags: ["group work", "family work", "process"],
      stem: `During a clinical group or family session, ${groupIssue}. What should the social worker do?`,
      correct:
        "Structure the process, validate concerns, reinforce expectations, and invite balanced participation",
      distractors: [
        "Let the process continue without intervention",
        "Side with the most distressed person immediately",
        "End the service because conflict occurred",
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
      competency: "Case management and access",
      skill: "application",
      difficulty: "applied",
      tags: ["case management", "resources", "access"],
      stem: `A client misses treatment because of ${barrier}. What intervention is MOST appropriate?`,
      correct:
        "Explore barriers and coordinate practical resources, referrals, follow-up, or service alternatives",
      distractors: [
        "Label the behavior as resistance without further exploration",
        "Close the case for noncompliance immediately",
        "Ignore concrete needs because therapy should focus only on feelings",
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
      competency: "Safety planning and coping skills",
      skill: "application",
      difficulty: "exam-ready",
      tags: ["safety planning", "coping", "risk"],
      stem: `${profile} reports intermittent ${risk} but can collaborate in planning. What should the social worker do?`,
      correct:
        "Develop a concrete plan with warning signs, coping steps, supports, emergency resources, and follow-up",
      distractors: [
        "Offer vague reassurance that the client will be fine",
        "Avoid discussing risk because it may increase distress",
        "Rely only on a promise that the client will not act",
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
      competency: "Evaluation and termination",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["evaluation", "termination", "treatment planning"],
      stem: `After several sessions, ${result}. What should the social worker do?`,
      correct:
        "Review progress with the client, update the plan, and address termination or referrals when appropriate",
      distractors: [
        "Continue the same plan without discussion",
        "End services abruptly",
        "Avoid outcome review because it can feel judgmental",
      ],
      rationale:
        "Ongoing evaluation uses client feedback and outcomes to adjust treatment, plan transition, or consolidate gains.",
      examLens:
        "Evaluate, discuss, and adjust.",
    };
  },
  (index) => {
    const approach = pick(["harm reduction", "assertiveness training", "self-monitoring", "role play", "stress management"], index, 3);
    return {
      competency: "Skills-based intervention",
      skill: "application",
      difficulty: "foundation",
      tags: ["skills", "coping", "practice"],
      stem: `A client needs a practical way to use ${approach} between sessions. What should the social worker do?`,
      correct:
        "Collaboratively teach, rehearse, tailor, and review the skill in the client's real-life context",
      distractors: [
        "Assign the skill without explanation or review",
        "Avoid skills because insight is always the first intervention",
        "Tell the client to master the skill before returning",
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
      competency: "Advocacy and interdisciplinary practice",
      skill: "reasoning",
      difficulty: "applied",
      tags: ["advocacy", "collaboration", "systems"],
      stem: `A client needs help navigating the ${system} system while continuing clinical care. What should the social worker do?`,
      correct:
        "Clarify client goals, obtain consent, coordinate with relevant systems, and support client advocacy",
      distractors: [
        "Take over all decisions because systems are difficult",
        "Avoid systems work because it is not clinical",
        "Contact every agency involved without consent",
      ],
      rationale:
        "Systems intervention includes consent, coordination, advocacy, and support for client self-determination.",
      examLens:
        "Advocacy should increase client power, not replace it.",
    };
  },
];

function buildDomainQuestions(domain: DomainId, templates: Template[]) {
  return Array.from({ length: generatedTargets[domain] }, (_, index) => {
    const template = templates[index % templates.length];
    return createQuestion(domain, index + 1, template(index));
  });
}

export const generatedQuestions: Question[] = [
  ...buildDomainQuestions("ethics", ethicsTemplates),
  ...buildDomainQuestions("assessment", assessmentTemplates),
  ...buildDomainQuestions("intervention", interventionTemplates),
];
