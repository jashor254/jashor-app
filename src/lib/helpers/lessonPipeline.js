// lib/helpers/lessonPipeline.js

import { allocateLessons } from './lessonAllocator';
import { generateValidatedLesson } from './aiLessonGenerator';

/**
 * Full CBC lesson generation pipeline
 * ----------------------------------
 * 1. Allocates lessons to timeline slots
 * 2. Generates AI lessons per slot
 * 3. Validates every lesson
 * 4. Returns preview-safe scheme data
 */
export async function generateSchemePipeline({
  aiClient,
  timeline,
  selectedSubstrands,
  context,
  curriculumGuide
}) {
  if (!timeline || !selectedSubstrands?.length) {
    throw new Error('Timeline and substrands are required');
  }

  // STEP 1: Allocate lessons to slots
  const allocatedLessons = allocateLessons({
    timeline,
    selectedSubstrands
  });

  const lessons = [];
  const failures = [];

  // STEP 2: Generate lessons one by one (safe & traceable)
  for (const slot of allocatedLessons) {
    const {
      week,
      lesson,
      strand,
      substrand,
      lessonInSubstrand
    } = slot;

    const totalLessonsForSubstrand =
      selectedSubstrands.find(s =>
        s.substrand_title === substrand
      )?.lessons_required || 1;

    const result = await generateValidatedLesson({
      aiClient,
      context: {
        learningArea: context.learningArea,
        grade: context.grade,
        strand,
        substrand,
        lessonNumber: lessonInSubstrand,
        totalLessons: totalLessonsForSubstrand,
        cdGuide: curriculumGuide
      }
    });

    if (result._validated) {
      lessons.push({
        week,
        lesson,
        strand,
        substrand,
        ...result
      });
    } else {
      failures.push({
        week,
        lesson,
        strand,
        substrand,
        error: result.details
      });
    }
  }

  // STEP 3: Return preview-safe structure
  return {
    status: failures.length === 0 ? 'complete' : 'partial',
    summary: {
      totalSlots: allocatedLessons.length,
      generated: lessons.length,
      failed: failures.length
    },
    lessons,
    failures,
    _engine: 'cbc_lesson_pipeline_v1'
  };
}
