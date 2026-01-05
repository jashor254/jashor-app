// services/cbe/lessonRules.js

export const OUTCOME_VERB_ORDER = [
  "state",
  "describe",
  "explain",
  "analyze",
  "evaluate",
  "appreciate"
];

export function normalizeOutcomeVerbs(outcomes = []) {
  return outcomes.sort((a, b) => {
    const aIndex = OUTCOME_VERB_ORDER.findIndex(v =>
      a.toLowerCase().startsWith(v)
    );
    const bIndex = OUTCOME_VERB_ORDER.findIndex(v =>
      b.toLowerCase().startsWith(v)
    );
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function minimumOutcomesPerLesson() {
  return 3;
}
