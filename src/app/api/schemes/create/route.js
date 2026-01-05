import { supabase } from '@/utils/supabaseClient';

export async function getUserFromRequest(req) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}
