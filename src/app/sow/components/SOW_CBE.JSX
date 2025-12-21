// File: src/app/sow/components/SOW_CBE.jsx

export default function SOW_CBE({ formData }) {
  return (
    <div className="p-4 border rounded-lg bg-blue-50 shadow-sm">
      <h3 className="text-lg font-bold mb-3">CBE Scheme of Work (Grade 7–10)</h3>

      <p className="mb-4 text-sm text-gray-700">
        Learning Area: <strong>{formData.learningArea || "(none selected)"}</strong>
      </p>

      {/* SAMPLE STRUCTURE — you will replace with real CBE logic */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-200">
            <th className="border p-2">Week</th>
            <th className="border p-2">Strand</th>
            <th className="border p-2">Sub-strand</th>
            <th className="border p-2">Lesson Activities</th>
            <th className="border p-2">Assessment</th>
            <th className="border p-2">Resources</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">1</td>
            <td className="border p-2">Sample Strand</td>
            <td className="border p-2">Sample Sub-strand</td>
            <td className="border p-2">Activity example...</td>
            <td className="border p-2">Assessment example...</td>
            <td className="border p-2">Resource example...</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ----------------------------------------------------------
// File: src/app/sow/components/SOW_844.jsx
// ----------------------------------------------------------

export function SOW_844({ formData }) {
  return (
    <div className="p-4 border rounded-lg bg-green-50 shadow-sm">
      <h3 className="text-lg font-bold mb-3">8-4-4 Scheme of Work (Form 3–4)</h3>

      <p className="mb-4 text-sm text-gray-700">
        Subject: <strong>{formData.learningArea || "(none selected)"}</strong>
      </p>

      {/* SAMPLE 8-4-4 STRUCTURE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-green-200">
            <th className="border p-2">Week</th>
            <th className="border p-2">Topic</th>
            <th className="border p-2">Sub-topic</th>
            <th className="border p-2">Specific Objectives</th>
            <th className="border p-2">Learning Activities</th>
            <th className="border p-2">Teaching Aids</th>
            <th className="border p-2">Evaluation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">1</td>
            <td className="border p-2">Sample Topic</td>
            <td className="border p-2">Sample Sub-topic</td>
            <td className="border p-2">Objective example...</td>
            <td className="border p-2">Activity example...</td>
            <td className="border p-2">Aid example...</td>
            <td className="border p-2">Evaluation example...</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
