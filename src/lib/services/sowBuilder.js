// src/lib/services/sowBuilder.js
import { googleGenerate } from './googleClient.js';

/**
 * computeLessonSlots and allocateSubstrandsToSlots functions as earlier described
 * Keep them here; code trimmed for brevity.
 */

export function computeLessonSlots({ startWeek, startLesson, endWeek, endLesson, lessonsPerWeek, breaks = [], lessonStructure }) {
  const slots = [];
  let week = Number(startWeek);
  let lesson = Number(startLesson);

  const isInBreak = (w, l) => {
    for (const b of breaks) {
      const sW = Number(b.startWeek), sL = Number(b.startLesson);
      const eW = Number(b.endWeek), eL = Number(b.endLesson);
      if (w < sW || w > eW) continue;
      if (sW === eW) {
        if (w === sW && l >= sL && l <= eL) return true;
      } else {
        if (w === sW && l >= sL) return true;
        if (w === eW && l <= eL) return true;
        if (w > sW && w < eW) return true;
      }
    }
    return false;
  };

  const doubleCombo = lessonStructure.double_lesson_combination;
  const [dblA, dblB] = doubleCombo ? doubleCombo.split('-').map(n => Number(n)) : [null, null];

  while (true) {
    if (week > endWeek || (week === endWeek && lesson > endLesson)) break;
    if (!isInBreak(week, lesson)) {
      if (dblA && dblB && lesson === dblA) {
        slots.push({ week, lesson: `${dblA}-${dblB}`, isDoubleSlot: true });
        let next = dblB + 1;
        if (next > lessonsPerWeek) { week++; lesson = 1; } else { lesson = next; }
        continue;
      }
      if (dblA && dblB && lesson === dblB) { lesson++; if (lesson > lessonsPerWeek) { week++; lesson = 1; } continue; }
      slots.push({ week, lesson: String(lesson), isDoubleSlot: false });
    }
    lesson++;
    if (lesson > lessonsPerWeek) { week++; lesson = 1; }
  }
  return slots;
}

function allocateSubstrandsToSlots(selectedContent, slots) {
  if (!selectedContent || selectedContent.length === 0) return [];
  const items = selectedContent.map((it, idx) => ({ ...it, weight: (it.meta?.official_outcomes?.length || 1) }));
  const totalWeight = items.reduce((s,i)=>s+i.weight,0);
  const queue = [];
  items.forEach(it => {
    const count = Math.max(1, Math.round((it.weight/totalWeight) * slots.length));
    for (let i=0;i<count;i++) queue.push(it);
  });
  while (queue.length < slots.length) queue.push(items[queue.length % items.length]);
  if (queue.length > slots.length) queue.length = slots.length;
  return slots.map((slot, i) => ({ slot, item: queue[i] }));
}

async function enrichWithAI({ substrandTitle, contextText = '', grade = '', learningArea = '' }) {
  const prompt = `
You are a Kenya curriculum expert. Given substrand "${substrandTitle}" and context:
${contextText.slice(0,2000)}
Return strict JSON: { "topic_specific_learning_outcomes": ["..."], "learning_experiences": ["..."], "key_inquiry_questions": ["..."], "assessment_methods": ["..."] }
`;
  const out = await googleGenerate(prompt, { maxTokens: 500, temperature: 0.15 });
  try {
    return JSON.parse(out);
  } catch (err) {
    const match = String(out).match(/\{[\s\S]*\}/m);
    if (match) try { return JSON.parse(match[0]); } catch(e){}
    // fallback
    return {
      topic_specific_learning_outcomes: [`Understand ${substrandTitle}`],
      learning_experiences: [`Discuss and explore ${substrandTitle}`],
      key_inquiry_questions: [`What is ${substrandTitle}?`],
      assessment_methods: ['Classwork']
    };
  }
}

export async function buildScheme({ selectedContent, lessonStructure, breaks = [], learning_area = '', grade = '', options = { enrich: true } }) {
  const slots = computeLessonSlots({
    startWeek: lessonStructure.first_week_of_teaching,
    startLesson: lessonStructure.first_lesson_of_teaching,
    endWeek: lessonStructure.last_week_of_teaching,
    endLesson: lessonStructure.last_lesson_of_teaching,
    lessonsPerWeek: lessonStructure.lessons_per_week,
    breaks,
    lessonStructure
  });

  const mapping = allocateSubstrandsToSlots(selectedContent, slots);
  const schemeRows = [];

  for (const m of mapping) {
    const { slot, item } = m;
    let curriculumData = null;
    if (item.meta && (Array.isArray(item.meta.official_outcomes) && item.meta.official_outcomes.length > 0)) {
      curriculumData = {
        topic_specific_learning_outcomes: item.meta.official_outcomes,
        learning_experiences: item.meta.learning_experiences || [],
        key_inquiry_questions: item.meta.key_inquiry_questions || [],
        assessment_methods: item.meta.assessment_methods || []
      };
    } else if (options.enrich) {
      const enriched = await enrichWithAI({ substrandTitle: item.substrand, contextText: item.meta?.notes || '', grade, learningArea: learning_area });
      curriculumData = enriched;
    } else {
      curriculumData = {
        topic_specific_learning_outcomes: [`Understand ${item.substrand}`],
        learning_experiences: [`Discuss ${item.substrand}`],
        key_inquiry_questions: [`What is ${item.substrand}?`],
        assessment_methods: ['Classwork']
      };
    }

    schemeRows.push({
      week: slot.week,
      lesson: slot.lesson,
      strand: item.strand,
      substrand: item.substrand,
      learning_outcomes: curriculumData.topic_specific_learning_outcomes,
      learning_experiences: curriculumData.learning_experiences,
      key_inquiry_questions: curriculumData.key_inquiry_questions,
      learning_resources: [], // generator or supply
      assessment_methods: curriculumData.assessment_methods,
      _is_double: slot.isDoubleSlot || false,
      _data_source: 'hybrid'
    });
  }

  return schemeRows;
}
