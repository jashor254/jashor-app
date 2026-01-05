import { supabase } from '@/utils/supabaseClient';

export async function buildScheme(payload) {
  const {
    user_id,
    school,
    grade_id,
    learning_area_id,
    term,
    year,
    scheme_content
  } = payload;

  const { data, error } = await supabase
    .from('schemes')
    .insert({
      user_id,
      school,
      grade_id,
      learning_area_id,
      term,
      year,
      content: scheme_content,
      status: 'UNPAID'
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
