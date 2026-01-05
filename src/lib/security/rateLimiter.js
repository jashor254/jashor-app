import { supabase } from '@/utils/supabaseClient';

export async function checkRateLimit({
  user_id,
  action,
  key = null,
  limit,
  windowMinutes
}) {
  const now = new Date();
  const windowStart = new Date(
    now.getTime() - windowMinutes * 60 * 1000
  );

  const { data } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', user_id)
    .eq('action', action)
    .eq('key', key)
    .gte('window_start', windowStart)
    .single();

  if (!data) {
    await supabase.from('rate_limits').insert({
      user_id,
      action,
      key,
      count: 1
    });
    return { allowed: true };
  }

  if (data.count >= limit) {
    return {
      allowed: false,
      retryAfter: windowMinutes
    };
  }

  await supabase
    .from('rate_limits')
    .update({ count: data.count + 1 })
    .eq('id', data.id);

  return { allowed: true };
}
