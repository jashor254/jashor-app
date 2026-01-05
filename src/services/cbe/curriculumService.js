// services/cbe/curriculumService.js
import { getCbeStrands } from "./strandService";
import { getCbeSubstrands } from "./substrandService";

export async function getCbeCurriculum({ gradeId, learningAreaId }) {
  const strands = await getCbeStrands({ gradeId, learningAreaId });

  const enrichedStrands = [];

  for (const strand of strands) {
    const substrands = await getCbeSubstrands(strand.id);

    enrichedStrands.push({
      ...strand,
      substrands
    });
  }

  return enrichedStrands;
}
