import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req, { params }) {
  const { id } = params;

  const {
    data: scheme,
    error: schemeError
  } = await supabase
    .from('schemes')
    .select('*')
    .eq('id', id)
    .single();

  if (schemeError || !scheme) {
    return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
  }

  const { data: lessons } = await supabase
    .from('scheme_lessons')
    .select('week, lesson, strand, substrand')
    .eq('scheme_id', id)
    .order('week')
    .order('lesson')
    .limit(10); // preview limit

  return NextResponse.json({
    scheme,
    lessons,
    status: scheme.status
  });
}
