"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { assertFirebaseClientConfig, firebaseAuth } from '@/app/lib/firebaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      assertFirebaseClientConfig();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(firebaseAuth!, provider);
      const idToken = await result.user.getIdToken(true);

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.replace('/admin/dashboard');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#9be7d7_0%,transparent_35%),linear-gradient(135deg,#0f172a_0%,#11263d_45%,#0b1625_100%)] px-4 py-20">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-cyan-200/20 bg-white/10 p-8 backdrop-blur-xl"
        >
          <h1 className="text-3xl font-black text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-cyan-100/80">
            Sign in with the authorized Google account only.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="mt-5 text-xs text-cyan-100/70">
            Access is restricted to one admin email configured on the server.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
