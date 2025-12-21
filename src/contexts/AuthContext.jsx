'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);

      // Sign up user and store full_name in auth metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      return { error: null, success: true };
    } catch (error) {
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
      return { error: null, success: true };
    } catch (error) {
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * NEW FUNCTION: Initiates the Google OAuth sign-in flow via Supabase.
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // This call redirects the user away from your app to the Google login page.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This path must match the Authorized Redirect URI you set in the Google Cloud Console 
          // (which should be your Supabase URL with /auth/v1/callback).
          // The final redirect after successful login is handled by the `redirectTo` option.
          redirectTo: `${window.location.origin}/dashboard` 
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error('Google sign-in error:', error);
    } 
    // We don't set loading to false here; the onAuthStateChange listener handles 
    // session initialization and loading state upon return.
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle, // <-- EXPOSED THE NEW FUNCTION HERE
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      profile: null,
      loading: false,
      signUp: async () => ({ error: new Error('Auth not initialized'), success: false }),
      signIn: async () => ({ error: new Error('Auth not initialized'), success: false }),
      signInWithGoogle: async () => {}, // <-- ADDED PLACEHOLDER HERE
      signOut: async () => {},
      updateProfile: async () => ({ error: new Error('Auth not initialized') }),
    };
  }
  return context;
}