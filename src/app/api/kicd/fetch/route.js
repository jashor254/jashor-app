import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { buildTermSchedule } from '@/lib/sow/termEngine';
import { applyBreaks } from '@/lib/sow/breaksEngine';
import { allocateLessons } from '@/lib/sow/lessonAllocator';
import { generateValidatedLesson } from '@/lib/helpers/aiLessonGenerator';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST: generate SOW preview
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      grade_id,
      learning_area_id,
      term,
      year,
      term_start,
      term_end,
      breaks,
      lessons_per_week
    } = body;

    // 1️⃣ Fetch KICD curriculum data (DB ONLY)
    const { data: strands, error: strandErr } = await supabase
      .from('strands')
      .select(`
        id, title, order_index,
        substrands (
          id, title, order_index,
          curriculum_design
        )
      `)
      .eq('learning_area_id', learning_area_id)
      .order('order_index');

    if (strandErr || !strands?.length) {
      return NextResponse.json(
        { error: 'KICD curriculum not found' },
        { status: 404 }
      );
    }

    // 2️⃣ Build term schedule
    let schedule = buildTermSchedule({
      term_start,
      term_end,
      lessons_per_week
    });

    // 3️⃣ Apply breaks
    schedule = applyBreaks(schedule, breaks);

    // 4️⃣ Allocate lessons per substrand
    const allocation = allocateLessons({
      strands,
      schedule
    });

    // 5️⃣ Generate lessons (AI + validator)
    const sow = [];

    for (const item of allocation) {
      const {
        strand,
        substrand,
        lessons
      } = item;

      const generatedLessons = [];

      for (let i = 1; i <= lessons; i++) {
        const lesson = await generateValidatedLesson({
          aiClient: global.aiClient, // your AI wrapper
          context: {
            learningArea: learning_area_id,
            grade: grade_id,
            strand: strand.title,
            substrand: substrand.title,
            lessonNumber: i,
            totalLessons: lessons,
            cdGuide: substrand.curriculum_design
          }
        });

        generatedLessons.push({
          lesson_no: i,
          ...lesson
        });
      }

      sow.push({
        strand: strand.title,
        substrand: substrand.title,
        lessons: generatedLessons
      });
    }

    // 6️⃣ Return preview ONLY (no save yet)
    return NextResponse.json({
      meta: {
        grade_id,
        learning_area_id,
        term,
        year,
        generated_at: new Date().toISOString()
      },
      sow
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to generate SOW' },
      { status: 500 }
    );
  }
}
