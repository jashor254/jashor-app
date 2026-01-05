'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useSchemeAccess } from '@/lib/guards/useSchemeAccess';
import DownloadGuard from '@/components/DownloadGuard';

export default function SchemePreview() {
  const searchParams = useSearchParams();
  const schemeId = searchParams.get('id');

  const [data, setData] = useState(null);
  const [loadingScheme, setLoadingScheme] = useState(true);
  const [error, setError] = useState('');

  // 🔐 Payment status guard
  const { isPaid, loading: loadingAccess } = useSchemeAccess(schemeId);

  // ================= FETCH SCHEME =================
  useEffect(() => {
    if (!schemeId) return;

    const fetchScheme = async () => {
      try {
        const res = await fetch(`/api/schemes/${schemeId}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || 'Failed to fetch scheme');

        setData(json);
      } catch (err) {
        setError(err.message || 'Failed to load scheme');
      } finally {
        setLoadingScheme(false);
      }
    };

    fetchScheme();
  }, [schemeId]);

  if (loadingScheme || loadingAccess) {
    return <p>Loading scheme preview…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  const { scheme, lessons, status } = data;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* ================= META ================= */}
      <div className="border rounded p-4 bg-white shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Scheme Preview</h1>

          <span
            className={`px-3 py-1 text-sm rounded ${
              status === 'PAID'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
          <p><strong>School:</strong> {scheme.school}</p>
          <p><strong>Term:</strong> {scheme.term}</p>
          <p><strong>Year:</strong> {scheme.year}</p>
        </div>
      </div>

      {/* ================= LESSON PREVIEW ================= */}
      <div className="border rounded bg-white shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Week</th>
              <th className="p-2 text-left">Lesson</th>
              <th className="p-2 text-left">Strand</th>
              <th className="p-2 text-left">Substrand</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{l.week}</td>
                <td className="p-2">{l.lesson}</td>
                <td className="p-2">{l.strand}</td>
                <td className="p-2">{l.substrand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DOWNLOAD / PAY WALL ================= */}
      <DownloadGuard
        isPaid={isPaid}
        onDownload={() =>
          window.location.href = `/api/schemes/${schemeId}/download`
        }
      />
    </div>
  );
}
