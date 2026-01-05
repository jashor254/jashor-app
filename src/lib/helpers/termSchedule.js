// src/lib/helpers/termSchedule.js

/**
 * Builds a normalized term teaching schedule
 * Converts week + lesson into absolute lesson slots
 */
export function buildTermSchedule({
  lessonsPerWeek,
  firstWeek,
  firstLesson,
  lastWeek,
  lastLesson,
  doubleLessonOption = 'single',
  doubleLessonCombination = null
}) {
  if (!lessonsPerWeek) {
    throw new Error('lessonsPerWeek is required');
  }

  const startSlot =
    (firstWeek - 1) * lessonsPerWeek + firstLesson;

  const endSlot =
    (lastWeek - 1) * lessonsPerWeek + lastLesson;

  if (startSlot >= endSlot) {
    throw new Error('Invalid term range: start is after end');
  }

  const totalSlots = endSlot - startSlot + 1;

  return {
    lessonsPerWeek,

    firstWeek,
    firstLesson,
    lastWeek,
    lastLesson,

    startSlot,
    endSlot,
    totalSlots,

    doubleLesson: {
      enabled: doubleLessonOption === 'double',
      combination: doubleLessonCombination
    }
  };
}

/**
 * Converts absolute slot back to week + lesson
 */
export function slotToWeekLesson(slot, lessonsPerWeek) {
  const week = Math.floor((slot - 1) / lessonsPerWeek) + 1;
  const lesson = ((slot - 1) % lessonsPerWeek) + 1;

  return { week, lesson };
}

/**
 * Converts week + lesson to absolute slot
 */
export function weekLessonToSlot(week, lesson, lessonsPerWeek) {
  return (week - 1) * lessonsPerWeek + lesson;
}
