// src/services/cbe/SubstrandService.js
import { supabase } from "@/utils/supabaseClient";

/**
 * Fetch CBC substrands for a given strand
 * Curriculum guide only — NO lesson assumptions
 */
export async function getSubstrands({ strandId }) {
  if (!strandId) {
    throw new Error("strandId is required to fetch substrands");
  }

  const { data, error } = await supabase
    .from("substrands")
    .select("id, title, order_index")
    .eq("strand_id", strandId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching substrands:", error);
    throw error;
  }

  return data ?? [];
}
