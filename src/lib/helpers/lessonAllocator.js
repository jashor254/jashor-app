// lib/helpers/lessonAllocator.js

/**
 * Allocates lessons to available teaching slots
 * Break slots are automatically skipped
 */
export function allocateLessons({
  timeline,
  selectedSubstrands
}) {
  if (!timeline || !selectedSubstrands) {
    throw new Error("Timeline and substrands are required for lesson allocation");
  }

  // Filter only teaching slots (no breaks)
  const teachingSlots = timeline.filter(slot => !slot.isBreak);

  let allocatedLessons = [];
  let slotPointer = 0;

  for (const substrand of selectedSubstrands) {
    const {
      strand_title,
      substrand_title,
      lessons_required
    } = substrand;

    if (!lessons_required || lessons_required < 1) {
      throw new Error(
        `Invalid lessons_required for ${substrand_title}`
      );
    }

    for (let lessonIndex = 1; lessonIndex <= lessons_required; lessonIndex++) {
      const currentSlot = teachingSlots[slotPointer];

      if (!currentSlot) {
        throw new Error(
          "Not enough teaching slots to allocate all lessons"
        );
      }

      allocatedLessons.push({
        slotIndex: currentSlot.slotIndex,
        week: currentSlot.week,
        lesson: currentSlot.lesson,
        strand: strand_title,
        substrand: substrand_title,
        lessonInSubstrand: lessonIndex,
        _source: "allocator"
      });

      slotPointer++;
    }
  }

  return allocatedLessons;
}
