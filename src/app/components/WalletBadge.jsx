'use client';

import { useEffect, useState } from 'react';

export default function WalletBadge() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadWallet = async () => {
      const res = await fetch('/api/wallet');
      const json = await res.json();
      setBalance(json.balance || 0);
    };

    loadWallet();
  }, []);

  return (
    <div className="text-sm bg-gray-100 px-3 py-1 rounded">
      Wallet: <strong>KES {balance}</strong>
    </div>
  );
}
