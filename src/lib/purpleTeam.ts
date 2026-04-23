// Purple Team Prompt Architect — Core Analysis Engine
// Spec: v2.1 Quality-Gated Compiler Model

export type ThreatVectorId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Likelihood = "Low" | "Medium" | "High";
export type MitigationStatus = "Unmitigated" | "Partial" | "Mitigated";
export type ReleaseGate = "green" | "warning" | "blocked";

export interface ThreatVector {
  id: ThreatVectorId;
  name: string;
  description: string;
  severity: Severity;
  likelihood: Likelihood;
  mitigation: MitigationStatus;
}

export interface ReliabilityDimension {
  id: string;
  name: string;
  score: number; // 0–5
  rationale: string;
}

export interface ReliabilityScorecard {
  dimensions: ReliabilityDimension[];
  composite: number; // /30
  aboveThreshold: boolean; // composite >= 22 and all dimensions >= 3
  iterationCount: number; // 0, 1, or 2
}

export interface DefensiveElement {
  id: string;
  name: string;
  present: boolean;
  hint: string;
}

export interface PurpleTeamReport {
  threatVectors: ThreatVector[];
  scorecard: ReliabilityScorecard;
  defensiveElements: DefensiveElement[];
  releaseGate: ReleaseGate;
  releaseReasons: string[];
  flags: string[]; // e.g. [BELOW_THRESHOLD], [ASSUMPTION]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(s: string): number {
  return s.split(/[.!?]+/).filter((x) => x.trim()).length;
}

function hasKeywords(s: string, words: string[]): boolean {
  const lower = s.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function hasNumberedList(s: string): boolean {
  return /^\s*\d+[\.\)]/m.test(s);
}

function countInstructionSteps(instructions: string): number {
  const matches = instructions.match(/^\s*\d+[\.\)]/gm);
  return matches ? matches.length : 0;
}

// ─── Threat Vector Analysis ───────────────────────────────────────────────────

const VECTOR_META: Record<ThreatVectorId, { name: string; description: string }> = {
  A: { name: "Scope Creep", description: "Task boundary expansion beyond intent" },
  B: { name: "Instruction Collision", description: "Guardrail conflict between layers" },
  C: { name: "Persona Bleed", description: "Role override or identity drift risk" },
  D: { name: "Output Schema Violation", description: "Format drift from specified contract" },
  E: { name: "Goal Hijacking", description: "Embedded instruction takeover of objectives" },
  F: { name: "Data Exfiltration", description: "System prompt or sensitive data leakage" },
  G: { name: "CoT Poisoning", description: "Cascading reasoning corruption in multi-step flows" },
};

function analyzeVector(
  id: ThreatVectorId,
  sections: Record<string, string>
): ThreatVector {
  const { name, description } = VECTOR_META[id];
  const role = sections.role || "";
  const constraints = sections.constraints || "";
  const goals = sections.goals || "";
  const instructions = sections.instructions || "";
  const output_format = sections.output_format || "";

  let severity: Severity;
  let likelihood: Likelihood;
  let mitigation: MitigationStatus;

  switch (id) {
    case "A": {
      // Scope Creep — mitigated by specific constraints and bounded goals
      severity = "High";
      const hasConstraints = constraints.trim().length > 50;
      const hasLimitWords = hasKeywords(constraints, ["only", "limit", "scope", "restrict", "do not", "never", "must not"]);
      const hasGoalBounds = goals.trim().length > 30 && /\d/.test(goals);
      if (!hasConstraints) likelihood = "High";
      else if (!hasLimitWords) likelihood = "Medium";
      else likelihood = "Low";
      if (hasConstraints && hasLimitWords && hasGoalBounds) mitigation = "Mitigated";
      else if (hasConstraints) mitigation = "Partial";
      else mitigation = "Unmitigated";
      break;
    }
    case "B": {
      // Instruction Collision — constraints vs instructions
      severity = "Medium";
      const hasInstructions = instructions.trim().length > 0;
      const hasConstraintList = constraints.trim().length > 0;
      const instructionsReferenceConstraints = hasKeywords(instructions, [
        "constraint", "must not", "never", "do not", "limit", "boundary",
      ]);
      if (!hasInstructions || !hasConstraintList) likelihood = "Low";
      else if (!instructionsReferenceConstraints) likelihood = "Medium";
      else likelihood = "Low";
      if (instructionsReferenceConstraints) mitigation = "Mitigated";
      else if (hasInstructions && hasConstraintList) mitigation = "Partial";
      else mitigation = "Unmitigated";
      break;
    }
    case "C": {
      // Persona Bleed — role specificity
      severity = "Medium";
      const roleSentences = role.trim() ? countSentences(role) : 0;
      const roleSpecific = hasKeywords(role, [
        "you are a", "specialist", "expert", "engineer", "analyst", "with experience", "you must",
      ]);
      if (roleSentences === 0) likelihood = "High";
      else if (roleSentences > 3 || !roleSpecific) likelihood = "Medium";
      else likelihood = "Low";
      if (roleSentences > 0 && roleSentences <= 3 && roleSpecific) mitigation = "Mitigated";
      else if (roleSentences > 0) mitigation = "Partial";
      else mitigation = "Unmitigated";
      break;
    }
    case "D": {
      // Output Schema Violation — output format specificity
      severity = "High";
      const hasFormat = output_format.trim().length > 0;
      const hasStructure = hasKeywords(output_format, ["json", "markdown", "##", "bullet", "numbered", "table", "```", "format"]);
      const hasFields = hasKeywords(output_format, ["field", "section", "include", "required", "must contain", "|"]);
      if (!hasFormat) likelihood = "High";
      else if (!hasStructure) likelihood = "Medium";
      else likelihood = "Low";
      if (hasFormat && hasStructure && hasFields) mitigation = "Mitigated";
      else if (hasFormat && hasStructure) mitigation = "Partial";
      else if (hasFormat) mitigation = "Partial";
      else mitigation = "Unmitigated";
      break;
    }
    case "E": {
      // Goal Hijacking — measurability of goals
      severity = "High";
      const hasGoals = goals.trim().length > 30;
      const goalsMeasurable = /\d/.test(goals);
      const goalsNumbered = hasNumberedList(goals);
      if (!hasGoals) likelihood = "High";
      else if (!goalsMeasurable) likelihood = "Medium";
      else likelihood = "Low";
      if (hasGoals && goalsMeasurable && goalsNumbered) mitigation = "Mitigated";
      else if (hasGoals) mitigation = "Partial";
      else mitigation = "Unmitigated";
      break;
    }
    case "F": {
      // Data Exfiltration — always Critical; mitigated by explicit data handling constraints
      severity = "Critical";
      likelihood = "Medium"; // external threat — always present
      const hasDataProtection = hasKeywords(constraints, [
        "confidential", "do not expose", "do not share", "sensitive", "private", "secret",
        "do not reveal", "never disclose", "system prompt", "internal",
      ]);
      if (hasDataProtection) mitigation = "Mitigated";
      else if (constraints.trim().length > 0) mitigation = "Partial";
      else mitigation = "Unmitigated";
      break;
    }
    case "G": {
      // CoT Poisoning — multi-step instructions without validation
      severity = "High";
      const steps = countInstructionSteps(instructions);
      const hasValidation = hasKeywords(instructions, [
        "verify", "validate", "check", "confirm", "review", "halt", "stop if",
        "confidence", "threshold", "checkpoint",
      ]);
      if (steps === 0) {
        likelihood = "Low";
        mitigation = "Mitigated"; // not applicable
      } else if (steps <= 3) {
        likelihood = "Low";
        mitigation = hasValidation ? "Mitigated" : "Partial";
      } else {
        likelihood = hasValidation ? "Medium" : "High";
        mitigation = hasValidation ? "Mitigated" : "Unmitigated";
      }
      break;
    }
  }

  return { id, name, description, severity, likelihood, mitigation };
}

// ─── Reliability Scorecard ────────────────────────────────────────────────────

function scoreIntentClarity(sections: Record<string, string>): ReliabilityDimension {
  const role = sections.role || "";
  const goals = sections.goals || "";
  const context = sections.context || "";
  const instructions = sections.instructions || "";

  let score = 0;
  const notes: string[] = [];

  if (role.trim()) { score += 1; } else { notes.push("Role missing"); }
  if (goals.trim()) { score += 1; } else { notes.push("Goals missing"); }
  if (/\d/.test(goals) && goals.trim()) { score += 1; } else if (goals.trim()) { notes.push("Goals lack measurable criteria"); }
  if (context.trim()) { score += 1; } else { notes.push("Context absent"); }
  if (instructions.trim() && hasNumberedList(instructions)) { score += 1; } else { notes.push("Structured instructions missing"); }

  const rationale = score >= 4
    ? "Intent is well-defined with measurable goals and clear context."
    : notes.join("; ") || "Intent is clear.";

  return { id: "intent_clarity", name: "Intent Clarity", score: Math.min(5, score), rationale };
}

function scoreInjectionResistance(sections: Record<string, string>): ReliabilityDimension {
  const constraints = sections.constraints || "";
  const role = sections.role || "";
  const instructions = sections.instructions || "";

  let score = 0;
  const notes: string[] = [];

  if (constraints.trim()) { score += 1; } else { notes.push("No constraints defined"); }
  if (hasKeywords(constraints, ["must not", "never", "do not", "prohibited", "forbidden", "restrict"])) {
    score += 1;
  } else { notes.push("No explicit denial rules in constraints"); }
  if (role.trim() && countSentences(role) <= 3) { score += 1; } else { notes.push("Role is absent or too broad"); }
  if (hasNumberedList(instructions)) { score += 1; } else { notes.push("Instructions not structured (numbered)"); }
  if (hasKeywords(constraints, ["confidential", "sensitive", "system prompt", "authority", "hierarchy", "privilege"])) {
    score += 1;
  } else { notes.push("No authority hierarchy or data protection clauses"); }

  const rationale = score >= 4
    ? "Strong injection resistance with explicit denial rules and bounded role."
    : notes.join("; ") || "Good resistance.";

  return { id: "injection_resistance", name: "Injection Resistance", score: Math.min(5, score), rationale };
}

function scoreOutputDeterminism(sections: Record<string, string>): ReliabilityDimension {
  const output = sections.output_format || "";

  let score = 0;
  const notes: string[] = [];

  if (output.trim()) { score += 1; } else { notes.push("No output format specified"); }
  if (hasKeywords(output, ["json", "markdown", "##", "```", "table", "bullet", "numbered", "list"])) {
    score += 1;
  } else if (output.trim()) { notes.push("Output structure type not specified"); }
  if (hasKeywords(output, ["field", "section", "include", "|", "required", "must contain"])) {
    score += 1;
  } else if (output.trim()) { notes.push("Required fields not enumerated"); }
  if (hasKeywords(output, ["word", "sentence", "character", "length", "concise", "brief", "max", "limit", "under"])) {
    score += 1;
  } else if (output.trim()) { notes.push("Length constraint absent"); }
  if (output.trim().length > 100 && (output.includes("##") || output.includes("```") || output.includes("|"))) {
    score += 1;
  } else if (output.trim()) { notes.push("No example output template"); }

  const rationale = score >= 4
    ? "Output contract is well-specified with structure, fields, and length."
    : notes.join("; ") || "Output format defined.";

  return { id: "output_determinism", name: "Output Determinism", score: Math.min(5, score), rationale };
}

function scoreScopeContainment(sections: Record<string, string>): ReliabilityDimension {
  const constraints = sections.constraints || "";
  const goals = sections.goals || "";
  const invocation = sections.invocation || "";

  let score = 0;
  const notes: string[] = [];

  if (constraints.trim()) { score += 1; } else { notes.push("Constraints absent"); }
  if (hasKeywords(constraints, ["only", "limit", "scope", "restrict", "exclusively", "maximum", "no more than"])) {
    score += 1;
  } else if (constraints.trim()) { notes.push("Constraints lack explicit boundary language"); }
  if (goals.trim() && /\d/.test(goals)) { score += 1; } else { notes.push("Goals not numerically bounded"); }
  if (hasNumberedList(goals)) { score += 1; } else { notes.push("Goals not prioritized/ordered"); }
  if (invocation.trim()) { score += 1; } else { notes.push("Invocation conditions undefined"); }

  const rationale = score >= 4
    ? "Scope is well-contained with explicit limits, numbered goals, and invocation rules."
    : notes.join("; ") || "Scope is contained.";

  return { id: "scope_containment", name: "Scope Containment", score: Math.min(5, score), rationale };
}

function scoreTokenEfficiency(sections: Record<string, string>): ReliabilityDimension {
  const role = sections.role || "";
  const constraints = sections.constraints || "";
  const goals = sections.goals || "";
  const instructions = sections.instructions || "";
  const output = sections.output_format || "";

  let score = 0;
  const notes: string[] = [];

  // Role conciseness
  const roleSentences = role.trim() ? countSentences(role) : 0;
  if (roleSentences > 0 && roleSentences <= 3) { score += 1; }
  else if (roleSentences > 3) { notes.push("Role exceeds 3-sentence guideline"); }
  else { notes.push("Role missing"); }

  // Constraints use bullet/list structure (efficient)
  if (constraints.trim() && (constraints.includes("\n") || constraints.includes("-") || constraints.includes("•"))) {
    score += 1;
  } else if (constraints.trim()) { notes.push("Constraints not in bullet format (verbose)"); }
  else { notes.push("Constraints absent"); }

  // Goals structured
  if (goals.trim() && hasNumberedList(goals)) { score += 1; }
  else if (goals.trim()) { notes.push("Goals not numbered (efficiency loss)"); }
  else { notes.push("Goals absent"); }

  // Instructions structured — numbered avoids ambiguity, reduces tokens needed for clarification
  if (instructions.trim() && hasNumberedList(instructions)) { score += 1; }
  else if (instructions.trim()) { notes.push("Instructions unstructured"); }
  else { notes.push("Instructions absent"); }

  // No duplicate semantics between sections
  const roleWords = new Set(role.toLowerCase().split(/\s+/));
  const constraintWords = constraints.toLowerCase().split(/\s+/);
  const overlapCount = constraintWords.filter((w) => w.length > 5 && roleWords.has(w)).length;
  if (overlapCount < 5) { score += 1; }
  else { notes.push("High semantic overlap between sections (redundancy)"); }

  const rationale = score >= 4
    ? "Prompt is concise and well-structured with minimal redundancy."
    : notes.join("; ") || "Good efficiency.";

  return { id: "token_efficiency", name: "Token Efficiency", score: Math.min(5, score), rationale };
}

function scoreGracefulDegradation(sections: Record<string, string>): ReliabilityDimension {
  const constraints = sections.constraints || "";
  const instructions = sections.instructions || "";
  const goals = sections.goals || "";
  const all = [constraints, instructions, goals].join(" ");

  let score = 0;
  const notes: string[] = [];

  if (hasKeywords(all, ["if ", "when ", "in case", "otherwise", "unless", "except"])) {
    score += 1;
  } else { notes.push("No conditional handling (if/when/unless)"); }

  if (hasKeywords(all, ["fallback", "default", "fail", "error", "cannot", "unavailable", "fallback"])) {
    score += 1;
  } else { notes.push("No fallback/default behavior defined"); }

  if (hasKeywords(all, ["uncertain", "unknown", "may not", "might", "unclear", "ambiguous", "not sure"])) {
    score += 1;
  } else { notes.push("No uncertainty acknowledgment"); }

  if (hasKeywords(all, ["confidence", "threshold", "halt", "stop", "abort", "escalate", "flag"])) {
    score += 1;
  } else { notes.push("No confidence threshold or halt condition"); }

  if (hasKeywords(all, ["partial", "incomplete", "best effort", "limited", "degrade gracefully"])) {
    score += 1;
  } else { notes.push("No partial-output or graceful-degrade clause"); }

  const rationale = score >= 4
    ? "Strong degradation path with fallbacks, confidence thresholds, and uncertainty handling."
    : notes.join("; ") || "Degradation path defined.";

  return { id: "graceful_degradation", name: "Graceful Degradation", score: Math.min(5, score), rationale };
}

function computeScorecard(sections: Record<string, string>): ReliabilityScorecard {
  const dimensions = [
    scoreIntentClarity(sections),
    scoreInjectionResistance(sections),
    scoreOutputDeterminism(sections),
    scoreScopeContainment(sections),
    scoreTokenEfficiency(sections),
    scoreGracefulDegradation(sections),
  ];

  const composite = dimensions.reduce((sum, d) => sum + d.score, 0);
  const belowMinDimension = dimensions.some((d) => d.score < 3);
  const aboveThreshold = composite >= 22 && !belowMinDimension;

  // Iteration count: how many passes would be needed
  let iterationCount = 0;
  if (!aboveThreshold) {
    iterationCount = 1;
    // Simulate one hardening pass: weakest dimensions +1
    const hardened = dimensions.map((d) => ({ ...d, score: Math.min(5, d.score + (d.score < 3 ? 2 : 1)) }));
    const hardenedComposite = hardened.reduce((sum, d) => sum + d.score, 0);
    const hardenedBelowMin = hardened.some((d) => d.score < 3);
    if (hardenedComposite < 22 || hardenedBelowMin) iterationCount = 2;
  }

  return { dimensions, composite, aboveThreshold, iterationCount };
}

// ─── Defensive Architecture Check ────────────────────────────────────────────

function checkDefensiveElements(sections: Record<string, string>): DefensiveElement[] {
  const all = Object.values(sections).join(" ").toLowerCase();
  const constraints = (sections.constraints || "").toLowerCase();
  const instructions = (sections.instructions || "").toLowerCase();
  const role = (sections.role || "").toLowerCase();

  return [
    {
      id: "authority_hierarchy",
      name: "Authority Hierarchy Declaration",
      present: hasKeywords(constraints + " " + role, [
        "authority", "hierarchy", "privilege", "override", "system", "primary", "trust level",
      ]),
      hint: "Add a clause in Role or Constraints declaring the instruction authority hierarchy.",
    },
    {
      id: "trust_boundary",
      name: "Trust Boundary Definition",
      present: hasKeywords(all, [
        "trust", "boundary", "scope", "domain", "external", "internal", "within",
      ]),
      hint: "Define what is in-scope vs out-of-scope using explicit boundary language.",
    },
    {
      id: "refusal_conditions",
      name: "Refusal Conditions",
      present: hasKeywords(constraints, [
        "must not", "never", "do not", "refuse", "prohibited", "forbidden", "reject", "decline",
      ]),
      hint: "Add explicit refusal conditions to Constraints (e.g. 'Never disclose...').",
    },
    {
      id: "assumption_declaration",
      name: "Assumption Declaration Rules",
      present: hasKeywords(all, [
        "assume", "assumption", "[assumption]", "default", "unless specified", "if not provided",
      ]),
      hint: "Define how the agent should handle missing information (state assumptions explicitly).",
    },
    {
      id: "graceful_degradation",
      name: "Graceful Degradation Path",
      present: hasKeywords(all, [
        "fallback", "default", "if unavailable", "cannot", "degraded", "partial", "gracefully",
      ]),
      hint: "Specify fallback behavior when the agent cannot fulfill the full request.",
    },
    {
      id: "output_contract",
      name: "Output Contract Enforcement",
      present: (sections.output_format || "").trim().length > 30,
      hint: "Define a detailed Output Format section with required fields and structure.",
    },
    {
      id: "token_budget",
      name: "Token Budget Awareness",
      present: hasKeywords(all, [
        "word", "token", "length", "concise", "brief", "limit", "maximum", "short", "under",
      ]),
      hint: "Add length/token constraints (e.g. 'Keep responses under 500 words').",
    },
  ];
}

// ─── Release Gate Evaluation ──────────────────────────────────────────────────

function evaluateReleaseGate(
  threatVectors: ThreatVector[],
  scorecard: ReliabilityScorecard
): { gate: ReleaseGate; reasons: string[]; flags: string[] } {
  const reasons: string[] = [];
  const flags: string[] = [];

  const criticalUnmitigated = threatVectors.some(
    (v) => v.severity === "Critical" && v.mitigation === "Unmitigated"
  );
  const multipleBelow3 = scorecard.dimensions.filter((d) => d.score < 3).length > 1;
  const hardFail = scorecard.composite < 18;

  if (criticalUnmitigated) {
    reasons.push("Critical unmitigated threat vector detected (shipping blocked).");
    flags.push("[CRITICAL_VECTOR_UNMITIGATED]");
  }
  if (hardFail) {
    reasons.push(`Composite score ${scorecard.composite}/30 is below hard-fail threshold (18).`);
  }
  if (multipleBelow3) {
    reasons.push("Multiple dimensions score below minimum (3). Targeted hardening required.");
  }

  if (criticalUnmitigated || hardFail || multipleBelow3) {
    return { gate: "blocked", reasons, flags: [...flags, "[BELOW_THRESHOLD]"] };
  }

  if (scorecard.composite < 22) {
    reasons.push(`Composite score ${scorecard.composite}/30 is between 18–21 (soft warning).`);
    const weakDims = scorecard.dimensions.filter((d) => d.score <= 3).map((d) => d.name);
    if (weakDims.length) reasons.push(`Weak dimensions: ${weakDims.join(", ")}.`);
    return { gate: "warning", reasons, flags };
  }

  if (!scorecard.aboveThreshold) {
    const singleWeak = scorecard.dimensions.find((d) => d.score === 3);
    if (singleWeak) reasons.push(`Dimension "${singleWeak.name}" is at minimum score (3).`);
    return { gate: "warning", reasons, flags };
  }

  reasons.push("All gates passed. Composite ≥ 22, no critical vectors, all dimensions ≥ 3.");
  return { gate: "green", reasons, flags };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function analyzePurpleTeam(sections: Record<string, string>): PurpleTeamReport {
  const vectorIds: ThreatVectorId[] = ["A", "B", "C", "D", "E", "F", "G"];
  const threatVectors = vectorIds.map((id) => analyzeVector(id, sections));
  const scorecard = computeScorecard(sections);
  const defensiveElements = checkDefensiveElements(sections);
  const { gate, reasons, flags } = evaluateReleaseGate(threatVectors, scorecard);

  return {
    threatVectors,
    scorecard,
    defensiveElements,
    releaseGate: gate,
    releaseReasons: reasons,
    flags,
  };
}

// ─── JSON Schema Export ───────────────────────────────────────────────────────

export interface ScorecardExport {
  $schema: string;
  version: string;
  generated_at: string;
  prompt_name: string;
  release_gate: ReleaseGate;
  flags: string[];
  composite_score: number;
  ship_threshold: number;
  dimensions: {
    id: string;
    name: string;
    score: number;
    max: number;
    rationale: string;
  }[];
  threat_vectors: {
    id: string;
    name: string;
    severity: Severity;
    likelihood: Likelihood;
    mitigation: MitigationStatus;
  }[];
  defensive_elements: {
    id: string;
    name: string;
    present: boolean;
  }[];
  release_reasons: string[];
}

export function exportScorecardJson(
  report: PurpleTeamReport,
  promptName: string
): ScorecardExport {
  return {
    $schema: "https://promptcrafting.net/schemas/prompt-scorecard/v2.1.json",
    version: "2.1",
    generated_at: new Date().toISOString(),
    prompt_name: promptName,
    release_gate: report.releaseGate,
    flags: report.flags,
    composite_score: report.scorecard.composite,
    ship_threshold: 22,
    dimensions: report.scorecard.dimensions.map((d) => ({
      id: d.id,
      name: d.name,
      score: d.score,
      max: 5,
      rationale: d.rationale,
    })),
    threat_vectors: report.threatVectors.map((v) => ({
      id: v.id,
      name: v.name,
      severity: v.severity,
      likelihood: v.likelihood,
      mitigation: v.mitigation,
    })),
    defensive_elements: report.defensiveElements.map((e) => ({
      id: e.id,
      name: e.name,
      present: e.present,
    })),
    release_reasons: report.releaseReasons,
  };
}
