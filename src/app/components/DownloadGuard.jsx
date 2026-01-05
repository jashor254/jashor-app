'use client';

export default function DownloadGuard({ isPaid, onDownload }) {
  if (!isPaid) {
    return (
      <div className="p-4 bg-yellow-50 border rounded text-center">
        <p className="mb-2 text-sm">
          This scheme is in preview mode.
        </p>
        <p className="text-xs text-gray-600">
          Pay to download and export PDF.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onDownload}
      className="bg-black text-white px-4 py-2 rounded"
    >
      Download PDF
    </button>
  );
}
