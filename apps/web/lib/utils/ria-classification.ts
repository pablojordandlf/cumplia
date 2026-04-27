import type {
  RiaClassificationRules,
  RiaCondition,
  RiaFormAnswers,
  RiskLevel,
} from '@/types/ria-form-template';

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

export function evaluateRiaClassification(
  rules: RiaClassificationRules,
  answers: RiaFormAnswers
): RiskLevel {
  for (const riskLevel of rules.priority) {
    const rule = rules.rules.find((r) => r.result === riskLevel);
    if (!rule) continue;

    const topLevelConditions =
      rule.logic === 'all'
        ? rule.conditions.every((c) => evaluateCondition(c, answers))
        : rule.conditions.some((c) => evaluateCondition(c, answers));

    if (topLevelConditions) {
      return riskLevel;
    }
  }

  return rules.default_result;
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
