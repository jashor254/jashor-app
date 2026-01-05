// src/services/cbe/StrandService.js
import { supabase } from "@/utils/supabaseClient";

/**
 * Fetch CBC strands for a given grade and learning area
 * Pure data access — no lesson logic
 */
export async function getStrands({ gradeId, learningAreaId }) {
  if (!gradeId || !learningAreaId) {
    throw new Error("gradeId and learningAreaId are required to fetch strands");
  }

  const { data, error } = await supabase
    .from("strands")
    .select("id, title, order_index")
    .eq("grade_id", gradeId)
    .eq("learning_area_id", learningAreaId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching strands:", error);
    throw error;
  }

  return data ?? [];
}
