"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithRedirect, type User } from 'firebase/auth';
import { assertFirebaseClientConfig, firebaseAuth } from '@/app/lib/firebaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Enhanced session wait with exponential backoff for Vercel compatibility
  const waitForAdminSession = async () => {
    const maxAttempts = 10;
    const maxDelay = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const meRes = await fetch('/api/admin/auth/me', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include', // Ensure cookies are sent
        });

        if (meRes.ok) {
          return true;
        }

        if (meRes.status === 401) {
          // Not authenticated, try again
          const delay = Math.min(Math.pow(2, attempt) * 200, maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Other error, throw
        throw new Error(`Session check failed: ${meRes.status}`);
      } catch (err) {
        const delay = Math.min(Math.pow(2, attempt) * 200, maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(
      'Session verification timed out. This can happen on Vercel with cold starts. Please try again.'
    );
  };

  const finalizeServerLogin = async (user: User) => {
    try {
      const idToken = await user.getIdToken(true);

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include', // Ensure cookies are set
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login request failed');
      }

      // Wait for session to be established on server
      await waitForAdminSession();

      // Successfully authenticated, redirect to dashboard
      router.replace('/admin/dashboard');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to finalize login');
    }
  };

  // Check if already authenticated on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const meRes = await fetch('/api/admin/auth/me', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (meRes.ok) {
          // Already authenticated, redirect immediately
          router.replace('/admin/dashboard');
        }
      } catch {
        // Not authenticated, show login page
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  useEffect(() => {
    if (isCheckingAuth) return;

    const handleRedirectResult = async () => {
      if (!firebaseAuth) return;

      try {
        setLoading(true);
        const result = await getRedirectResult(firebaseAuth);
        const resolvedUser = result?.user ?? firebaseAuth.currentUser;

        if (resolvedUser) {
          await finalizeServerLogin(resolvedUser);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to complete login';
        setError(message);
        setLoading(false);
      }
    };

    const unsubscribe = firebaseAuth
      ? onAuthStateChanged(firebaseAuth, async (user) => {
          if (!user) {
            // Trigger redirect result check if there's no current user
            void handleRedirectResult();
            return;
          }

          // User is logged in via Firebase, finalize server session
          try {
            setLoading(true);
            await finalizeServerLogin(user);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to login';
            setError(message);
            setLoading(false);
          }
        })
      : () => {};

    void handleRedirectResult();

    return () => {
      unsubscribe();
    };
  }, [router, isCheckingAuth]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      assertFirebaseClientConfig();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      await signInWithRedirect(firebaseAuth!, provider);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to start Google login';
      setError(message);
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#9be7d7_0%,transparent_35%),linear-gradient(135deg,#0f172a_0%,#11263d_45%,#0b1625_100%)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 animate-spin mb-4" />
          <p className="text-cyan-100">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#9be7d7_0%,transparent_35%),linear-gradient(135deg,#0f172a_0%,#11263d_45%,#0b1625_100%)] px-4 py-12 sm:py-20">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-cyan-200/20 bg-white/10 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="inline-flex rounded-full border border-cyan-100/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Secure Portal
          </div>
          <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">Admin Login</h1>
          <p className="mt-2 text-sm leading-relaxed text-cyan-100/80 sm:text-base">
            Sign in with the authorized Google account only.
          </p>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100"
            >
              <p className="font-semibold">Login Error</p>
              <p className="mt-1 text-xs">{error}</p>
            </motion.div>
          ) : null}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                Signing in...
              </>
            ) : (
              'Continue with Google'
            )}
          </button>

          <p className="mt-5 text-xs leading-relaxed text-cyan-100/70">
            Access is restricted to one admin email configured on the server. Ensure your Google account matches the configured ADMIN_GOOGLE_EMAIL environment variable.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
