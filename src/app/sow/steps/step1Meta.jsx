'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function Step1Meta({ onNext }) {
  const [school, setSchool] = useState('');
  const [levelId, setLevelId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [learningAreaId, setLearningAreaId] = useState('');
  const [learnersBook, setLearnersBook] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [learningAreas, setLearningAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== Fetch Levels (CBC only) =====
  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('levels')
        .select('id,name')
        .in('name', ['Junior School', 'Senior School'])
        .order('order_index');
      setLevels(data || []);
      setLoading(false);
    };
    fetchLevels();
  }, []);

  // ===== Fetch Grades =====
  useEffect(() => {
    if (!levelId) return;
    const fetchGrades = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('grades')
        .select('id,name')
        .eq('level_id', levelId)
        .order('order_index');
      setGrades(data || []);
      setGradeId('');
      setLearningAreaId('');
      setLearningAreas([]);
      setLoading(false);
    };
    fetchGrades();
  }, [levelId]);

  // ===== Fetch Learning Areas =====
  useEffect(() => {
    if (!gradeId) return;
    const fetchLearningAreas = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('learning_areas')
        .select('id,name')
        .eq('grade_id', gradeId)
        .order('order_index');
      setLearningAreas(data || []);
      setLearningAreaId('');
      setLoading(false);
    };
    fetchLearningAreas();
  }, [gradeId]);

  const isComplete =
    school.trim() &&
    levelId &&
    gradeId &&
    learningAreaId &&
    term &&
    year;

  const handleNext = () => {
    if (!isComplete) return;
    onNext({
      school: school.trim(),
      level_id: levelId,
      grade_id: gradeId,
      learning_area_id: learningAreaId,
      learners_book: learnersBook.trim(),
      term,
      year
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Scheme Details</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="e.g. Kigogoini Secondary School"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
      />

      <select className="w-full border p-2 rounded" value={levelId} onChange={e => setLevelId(e.target.value)}>
        <option value="">Select Level</option>
        {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>

      <select className="w-full border p-2 rounded" disabled={!levelId} value={gradeId} onChange={e => setGradeId(e.target.value)}>
        <option value="">Select Grade</option>
        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>

      <select className="w-full border p-2 rounded" disabled={!gradeId} value={learningAreaId} onChange={e => setLearningAreaId(e.target.value)}>
        <option value="">Select Learning Area</option>
        {learningAreas.map(la => <option key={la.id} value={la.id}>{la.name}</option>)}
      </select>

      <input
        className="w-full border p-2 rounded"
        placeholder="Learner’s Book (optional)"
        value={learnersBook}
        onChange={e => setLearnersBook(e.target.value)}
      />

      <select className="w-full border p-2 rounded" value={term} onChange={e => setTerm(e.target.value)}>
        <option value="">Select Term</option>
        <option value="1">Term 1</option>
        <option value="2">Term 2</option>
        <option value="3">Term 3</option>
      </select>

      <input
        type="number"
        className="w-full border p-2 rounded"
        value={year}
        onChange={e => setYear(e.target.value)}
      />

      <button
        onClick={handleNext}
        disabled={!isComplete}
        className={`w-full py-2 rounded text-white ${isComplete ? 'bg-black' : 'bg-gray-400'}`}
      >
        Next
      </button>
    </div>
  );
}

