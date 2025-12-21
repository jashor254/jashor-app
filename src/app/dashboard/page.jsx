"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Sparkles, PlusCircle, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // fetch current user on mount
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    getUser();

    // subscribe to auth changes (optional but useful)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      if (!session) setUser(null);
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // after sign out, middleware will redirect or you can client-redirect:
    window.location.href = "/login";
  };

  const username =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Teacher";

  return (
    <div className="animate-fadeIn">
      {/* Welcome + Logout */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {username} 👋</h1>
          <p className="text-gray-600 mt-1">Ready to shape the future of education today?</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSignOut} className="px-4 py-2 rounded bg-red-100 text-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* ... rest of your dashboard cards (same as earlier) ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow">This Week’s Summary</div>
        <div className="bg-white rounded-xl p-6 shadow">Teaching Progress</div>
        <div className="bg-white rounded-xl p-6 shadow">Upcoming Tasks</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h2 className="font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <PlusCircle size={18} /> Create Scheme
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg">
            <BookOpen size={18} /> My Schemes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg">
            <Sparkles size={18} /> Lesson Plans
          </button>
        </div>
      </div>
      {/* future features */}
    </div>
  );
}
