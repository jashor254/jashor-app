import { useEffect, useState } from 'react';

export function useSchemeAccess(schemeId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schemeId) return;

    const fetchStatus = async () => {
      const res = await fetch(`/api/schemes/${schemeId}/status`);
      const json = await res.json();

      setStatus(json.status);
      setLoading(false);
    };

    fetchStatus();
  }, [schemeId]);

  return {
    loading,
    isPaid: status === 'PAID',
    status
  };
}
