import { supabase } from '@/utils/supabaseClient';

export async function markSchemeAsPaid({ schemeId, amount, ref }) {
  const { error } = await supabase
    .from('schemes')
    .update({
      status: 'PAID',
      amount,
      payment_ref: ref,
      paid_at: new Date()
    })
    .eq('id', schemeId);

  if (error) throw error;
}
