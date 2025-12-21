"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const signInWithMagicLink = async (e) => {
    e.preventDefault();
    setMsg("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg(error.message);
    else setMsg("Magic link sent — check your email.");
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
    // Browser will redirect to Supabase OAuth screen
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign in to EduNexus</h2>

        <form onSubmit={signInWithMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="Your school email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded">Send magic link</button>
        </form>

        <div className="my-4 text-center text-gray-400">or</div>

        <button onClick={signInWithGoogle} className="w-full bg-red-500 text-white py-2 rounded">
          Sign in with Google
        </button>

        <p className="mt-4 text-sm text-gray-600">{msg}</p>
      </div>
    </div>
  );
}
