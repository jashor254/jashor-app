// lib/helpers/aiLessonGenerator.js

import { validateLesson } from './validators';

const MAX_RETRIES = 3;
const MAX_CONFIDENCE = 0.92;

/**
 * Builds a strict CBC-compliant prompt
 */
function buildLessonPrompt({
  learningArea,
  grade,
  strand,
  substrand,
  lessonNumber,
  totalLessons,
  cdGuide
}) {
  return `
You are a Kenyan CBC teacher preparing ONE lesson only.

STRICT RULES:
- Follow KICD curriculum design guidance ONLY
- NO exams, NO tests, NO marks
- Learner-centered activities
- Real Kenyan classroom context
- NO hallucinations

SUBJECT DETAILS:
Learning Area: ${learningArea}
Grade: ${grade}
Strand: ${strand}
Substrand: ${substrand}
Lesson: ${lessonNumber} of ${totalLessons}

CURRICULUM DESIGN GUIDANCE:
${cdGuide}

MANDATORY OUTPUT FORMAT (JSON ONLY):

{
  "learning_outcomes": [
    "State ...",
    "Explain ...",
    "Apply/Appreciate ..."
  ],
  "learning_experiences": [
    "Learners work in groups to ...",
    "Learners discuss ..."
  ],
  "key_inquiry_questions": [
    "Why ...?",
    "How ...?"
  ],
  "assessment_methods": [
    "Observation",
    "Discussion"
  ],
  "learning_resources": [
    "Textbooks",
    "Charts"
  ]
}

IMPORTANT:
- At least 3 learning outcomes
- Outcomes verbs MUST progress: state → explain → apply/appreciate
- Use the substrand focus explicitly
- Output VALID JSON ONLY
`;
}

/**
 * AI → Validate → Retry loop
 */
export async function generateValidatedLesson({
  aiClient,
  context
}) {
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    attempt++;

    const prompt = buildLessonPrompt(context);

    let aiResponse;
    try {
      aiResponse = await aiClient.generate({
        prompt,
        temperature: 0.3
      });
    } catch (err) {
      lastError = 'AI request failed';
      continue;
    }

    let lesson;
    try {
      lesson = JSON.parse(aiResponse);
    } catch {
      lastError = 'AI returned invalid JSON';
      continue;
    }

    const validation = validateLesson(
      lesson,
      context.substrand
    );

    if (validation.isValid) {
      return {
        ...lesson,
        _validated: true,
        _confidence: Math.min(
          0.85 + attempt * 0.03,
          MAX_CONFIDENCE
        ),
        _source: 'ai_cbc_generator'
      };
    }

    lastError = validation.issues.join('; ');
  }

  return {
    error: 'Lesson failed validation',
    details: lastError,
    _validated: false,
    _source: 'ai_cbc_generator'
  };
}
