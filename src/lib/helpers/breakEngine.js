// src/lib/helpers/breakEngine.js

import { weekLessonToSlot } from './termSchedule';

/**
 * Validates a new break before adding it
 */
export function validateBreak(newBreak, existingBreaks, termSchedule) {
  const {
    lessonsPerWeek,
    startSlot: termStart,
    endSlot: termEnd
  } = termSchedule;

  const startSlot = weekLessonToSlot(
    Number(newBreak.startWeek),
    Number(newBreak.startLesson),
    lessonsPerWeek
  );

  const endSlot = weekLessonToSlot(
    Number(newBreak.endWeek),
    Number(newBreak.endLesson),
    lessonsPerWeek
  );

  if (startSlot > endSlot) {
    return { valid: false, error: 'Break start is after break end' };
  }

  if (startSlot < termStart || endSlot > termEnd) {
    return { valid: false, error: 'Break is outside teaching term' };
  }

  for (const existing of existingBreaks) {
    const existingStart = weekLessonToSlot(
      Number(existing.startWeek),
      Number(existing.startLesson),
      lessonsPerWeek
    );

    const existingEnd = weekLessonToSlot(
      Number(existing.endWeek),
      Number(existing.endLesson),
      lessonsPerWeek
    );

    const overlaps =
      startSlot <= existingEnd && endSlot >= existingStart;

    if (overlaps) {
      return {
        valid: false,
        error: `Break overlaps with "${existing.title}"`
      };
    }
  }

  return {
    valid: true,
    startSlot,
    endSlot
  };
}

/**
 * Applies breaks to a lesson slot timeline
 */
export function applyBreaksToSchedule(termSchedule, breaks) {
  const { startSlot, endSlot } = termSchedule;

  const timeline = [];

  for (let slot = startSlot; slot <= endSlot; slot++) {
    const breakHere = breaks.find(b => {
      return slot >= b.startSlot && slot <= b.endSlot;
    });

    timeline.push({
      slot,
      isBreak: Boolean(breakHere),
      breakTitle: breakHere ? breakHere.title : null
    });
  }

  return timeline;
}
