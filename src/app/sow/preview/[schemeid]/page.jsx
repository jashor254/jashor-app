'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function SchemePreview({ params }) {
  const { schemeId } = params;
  const [scheme, setScheme] = useState(null);

  useEffect(() => {
    const fetchScheme = async () => {
      const { data } = await supabase
        .from('schemes')
        .select('*')
        .eq('id', schemeId)
        .single();

      setScheme(data);
    };

    fetchScheme();
  }, [schemeId]);

  if (!scheme) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold">
        Scheme Preview ({scheme.status})
      </h1>

      {/* render lessons here */}
      <pre className="text-sm mt-4 bg-gray-100 p-3 rounded">
        {JSON.stringify(scheme.content, null, 2)}
      </pre>

      {scheme.status === 'UNPAID' && (
        <p className="mt-4 text-red-600">
          Pay to download this scheme
        </p>
      )}
    </div>
  );
}
