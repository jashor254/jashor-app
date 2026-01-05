import { supabase } from "@/utils/supabaseClient";

export async function markSchemePaid({
  schemeId,
  receipt
}) {
  const { error } = await supabase
    .from("schemes")
    .update({
      status: "PAID",
      paid_at: new Date(),
      payment_ref: receipt
    })
    .eq("id", schemeId);

  if (error) throw error;
}
