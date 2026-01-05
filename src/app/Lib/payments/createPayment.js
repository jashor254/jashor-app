import { supabase } from "@/utils/supabaseClient";

export async function createPayment({
  userId,
  schemeId,
  phone,
  amount
}) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      scheme_id: schemeId,
      phone,
      amount,
      status: "PENDING"
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
