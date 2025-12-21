// src/app/api/kicd/fetch/route.js
import { NextResponse } from "next/server";
import { supabase } from '@/utils/supabaseClient';

export async function POST(req) {
  try {
    const { 
      learning_area_id, 
      grade_id, 
      substrand_title, 
      learning_area_name, 
      grade_name,
      week_number 
    } = await req.json();

    console.log('📥 API Request:', { learning_area_id, substrand_title });

    // ============= PHASE 1: Tafuta kwenye Unified Views =============
    // Try exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from('unified_substrands')
      .select(`
        *,
        strand:unified_strands!inner(
          id,
          learning_area_id,
          title,
          source_type
        )
      `)
      .ilike('title', substrand_title)
      .limit(1)
      .single();

    if (exactMatch) {
      console.log('✅ Found exact match in unified view');
      return formatResponse(exactMatch, 'kicd_official');
    }

    // ============= PHASE 2: Try partial match =============
    const { data: partialMatches, error: partialError } = await supabase
      .from('unified_substrands')
      .select(`
        *,
        strand:unified_strands!inner(
          id,
          learning_area_id,
          title,
          source_type
        )
      `)
      .or(`title.ilike.%${substrand_title}%,title.ilike.%${substrand_title.split(' ')[0]}%`)
      .limit(3);

    if (partialMatches && partialMatches.length > 0) {
      console.log('✅ Found partial match in unified view');
      return formatResponse(partialMatches[0], 'kicd_partial_match');
    }

    // ============= PHASE 3: Try kicd_curriculum table =============
    if (learning_area_name && grade_name && week_number) {
      const { data: kicdData, error: kicdError } = await supabase
        .from('kicd_curriculum')
        .select('*')
        .eq('learning_area', learning_area_name)
        .eq('grade_level', grade_name)
        .eq('week', `Week ${week_number}`)
        .limit(1)
        .single();

      if (kicdData) {
        console.log('✅ Found in kicd_curriculum table');
        return formatResponseFromCurriculum(kicdData, 'kicd_database');
      }
    }

    // ============= PHASE 4: High-Profile Fallback =============
    console.log('🔄 Using high-profile fallback');
    const fallback = generateSmartFallback(
      learning_area_name || 'Subject', 
      substrand_title, 
      grade_name || 'Grade'
    );

    return NextResponse.json({
      success: true,
      source: "high_profile_fallback",
      data: fallback,
      note: "Data generated via smart fallback system"
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      note: "Check unified views exist in Supabase" 
    }, { status: 500 });
  }
}

// Helper: Format response from unified view
function formatResponse(data, source) {
  const isKicd = data.source_type === 'kicd' || source.includes('kicd');
  
  let content = {};
  if (isKicd && data.content) {
    try {
      content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
    } catch (e) {
      content = data.content || {};
    }
  }

  return NextResponse.json({
    success: true,
    source: source,
    is_kicd_official: isKicd,
    data: {
      outcomes: content.specific_learning_outcomes || [
        `Understand ${data.title || 'the topic'}`
      ],
      experiences: content.learning_experiences || [
        'Group discussions and activities'
      ],
      questions: content.key_inquiry_questions || [
        `What is ${data.title || 'this topic'} about?`
      ],
      resources: content.learning_resources || [
        'Approved textbooks',
        'Digital resources'
      ],
      assessment: content.assessment_methods || [
        'Oral questions',
        'Written exercises'
      ]
    }
  });
}

// Helper: Format from kicd_curriculum table
function formatResponseFromCurriculum(data, source) {
  return NextResponse.json({
    success: true,
    source: source,
    is_kicd_official: true,
    data: {
      outcomes: data.topic_specific_learning_outcomes || [],
      experiences: data.learning_experiences || [],
      questions: data.key_inquiry_questions || [],
      resources: data.learning_resources || [],
      assessment: data.assessment_methods || []
    }
  });
}

// Smart Fallback (same as before)
function generateSmartFallback(subject, substrand, grade) {
  const commonOutcomes = [
    `By the end of the lesson, the learner should be able to explain the concept of ${substrand}.`,
    `Identify the importance of ${substrand} in ${subject}.`,
    `Apply the knowledge of ${substrand} in real-life situations.`
  ];

  return {
    outcomes: commonOutcomes,
    experiences: [
      `Learners to discuss the meaning of ${substrand} in small groups.`,
      `In pairs, learners to brainstorm examples of ${substrand}.`,
      `Teacher-led demonstration of ${substrand} using available resources.`
    ],
    questions: [
      `What do you understand by the term ${substrand}?`, 
      `How is ${substrand} applied in our daily lives?`
    ],
    resources: [
      `Approved ${subject} Learners Book for ${grade}`, 
      "Digital devices (Tablets/Projectors)", 
      "Charts and Illustrations"
    ],
    assessment: [
      "Observation of group activities", 
      "Oral questioning", 
      "Written exercise in workbooks"
    ]
  };
}