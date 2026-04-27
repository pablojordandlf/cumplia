import type {
  RiaClassificationRules,
  RiaCondition,
  RiaFormAnswers,
  RiaFormStructure,
  RiskLevel,
} from '@/types/ria-form-template';

// Risk levels ordered from most to least severe
const RISK_ORDER: RiskLevel[] = [
  'prohibited',
  'high_risk',
  'gpai_regime',
  'limited_risk',
  'minimal_risk',
];

function evaluateCondition(condition: RiaCondition, answers: RiaFormAnswers): boolean {
  if (condition.type === 'field_equals') {
    return answers[condition.field] === condition.value;
  }

  if (condition.type === 'all') {
    return condition.conditions.every((c) => evaluateCondition(c, answers));
  }

  if (condition.type === 'any') {
    return condition.conditions.some((c) => evaluateCondition(c, answers));
  }

  return false;
}

/**
 * Collect all question keys covered by the static classification rules so we
 * can tell which template questions are "new" (custom).
 */
function collectCoveredKeys(rules: RiaClassificationRules): Set<string> {
  const keys = new Set<string>();

  function walk(condition: RiaCondition) {
    if (condition.type === 'field_equals') {
      keys.add(condition.field);
    } else if (condition.type === 'all' || condition.type === 'any') {
      condition.conditions.forEach(walk);
    }
  }

  for (const rule of rules.rules) {
    rule.conditions.forEach(walk);
  }
  if (rules.transparency_rules?.conditions) {
    rules.transparency_rules.conditions.forEach(walk);
  }

  return keys;
}

/**
 * Evaluate the risk classification from rules + optional template structure.
 *
 * When `structure` is provided the engine also checks questions that have
 * `affects_classification: true` but are NOT already part of the static rules
 * (i.e. questions added via the template editor).  If any of those custom
 * questions is answered "yes" the result is escalated to at least `high_risk`.
 */
export function evaluateRiaClassification(
  rules: RiaClassificationRules,
  answers: RiaFormAnswers,
  structure?: RiaFormStructure
): RiskLevel {
  // 1. Evaluate static rules in priority order
  let result: RiskLevel = rules.default_result;

  for (const riskLevel of rules.priority) {
    const rule = rules.rules.find((r) => r.result === riskLevel);
    if (!rule) continue;

    const matched =
      rule.logic === 'all'
        ? rule.conditions.every((c) => evaluateCondition(c, answers))
        : rule.conditions.some((c) => evaluateCondition(c, answers));

    if (matched) {
      result = riskLevel;
      break;
    }
  }

  // 2. Check custom questions with affects_classification: true
  if (structure) {
    const coveredKeys = collectCoveredKeys(rules);

    const hasCustomHighRisk = structure.steps.some((step) =>
      (step.sections ?? []).some((section) =>
        section.questions.some(
          (q) =>
            q.affects_classification &&
            !coveredKeys.has(q.key) &&
            answers[q.key] === 'yes'
        )
      )
    );

    if (hasCustomHighRisk) {
      const currentIdx = RISK_ORDER.indexOf(result);
      const highRiskIdx = RISK_ORDER.indexOf('high_risk');
      // Only escalate, never de-escalate
      if (currentIdx > highRiskIdx) {
        result = 'high_risk';
      }
    }
  }

  return result;
}

export function evaluateTransparencyRequired(
  rules: RiaClassificationRules,
  answers: RiaFormAnswers
): boolean {
  const { transparency_rules } = rules;
  if (!transparency_rules?.conditions?.length) return false;

  return transparency_rules.logic === 'all'
    ? transparency_rules.conditions.every((c) => evaluateCondition(c, answers))
    : transparency_rules.conditions.some((c) => evaluateCondition(c, answers));
}
