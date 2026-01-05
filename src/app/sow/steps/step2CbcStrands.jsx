'use client';

import { useEffect, useState } from 'react';
import { getCbeStrands } from '@/services/cbe/strandService';
import { getCbeSubstrands } from '@/services/cbe/substrandService';

export default function Step2Strands({ meta, onNext }) {
  const [strands, setStrands] = useState([]);
  const [substrands, setSubstrands] = useState({});
  const [selected, setSelected] = useState({});

  // ===== Fetch Strands =====
  useEffect(() => {
    if (!meta) return;
    getCbeStrands({
      gradeId: meta.grade_id,
      learningAreaId: meta.learning_area_id
    }).then(setStrands);
  }, [meta]);

  // ===== Fetch Substrands =====
  useEffect(() => {
    strands.forEach(async (s) => {
      const subs = await getCbeSubstrands(s.id);
      setSubstrands(prev => ({ ...prev, [s.id]: subs }));
    });
  }, [strands]);

  const toggleSubstrand = (sub) => {
    setSelected(prev => ({
      ...prev,
      [sub.id]: prev[sub.id]
        ? undefined
        : {
            strand_title: strands.find(s => s.id === sub.strand_id)?.title,
            substrand_title: sub.title,
            lessons_required: sub.suggested_lessons || 1
          }
    }));
  };

  const selectedList = Object.values(selected).filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Select Strands & Substrands</h2>

      {strands.map(strand => (
        <div key={strand.id} className="border rounded p-3">
          <h3 className="font-medium">{strand.title}</h3>

          {(substrands[strand.id] || []).map(sub => (
            <label key={sub.id} className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={!!selected[sub.id]}
                onChange={() => toggleSubstrand(sub)}
              />
              {sub.title}
            </label>
          ))}
        </div>
      ))}

      <button
        disabled={!selectedList.length}
        onClick={() => onNext(selectedList)}
        className={`w-full py-2 rounded text-white ${selectedList.length ? 'bg-black' : 'bg-gray-400'}`}
      >
        Next
      </button>
    </div>
  );
}

