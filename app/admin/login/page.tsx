"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithEmailAndPassword, signInWithRedirect, type User } from 'firebase/auth';
import { assertFirebaseClientConfig, firebaseAuth } from '@/app/lib/firebaseClient';

const ADMIN_LOGIN_EMAIL_DEFAULT = 'rahulchakradharperepogu@gmail.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'starting-google' | 'starting-email' | 'verifying' | 'redirecting'>('idle');
  const [loadingHintLevel, setLoadingHintLevel] = useState(0);
  const [email, setEmail] = useState(ADMIN_LOGIN_EMAIL_DEFAULT);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isFinalizingRef = useRef(false);

  const getReadableAuthError = useCallback((value: unknown) => {
    if (!(value instanceof Error)) {
      return 'Unable to complete admin login. Please try again.';
    }

    const message = value.message.toLowerCase();

    if (message.includes('popup') || message.includes('cancelled')) {
      return 'Google sign-in was cancelled. Please try again.';
    }

    if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
      return 'Invalid email or password for admin login.';
    }

    if (message.includes('too-many-requests')) {
      return 'Too many failed attempts. Please wait a moment and try again.';
    }

    if (message.includes('timed out')) {
      return 'Login verification took too long. Please try again.';
    }

    if (message.includes('not allowed') || message.includes('forbidden')) {
      return 'This Google account is not authorized for admin access.';
    }

    if (message.includes('missing firebase client environment')) {
      return 'Firebase client configuration is missing. Please check environment variables.';
    }

    return value.message;
  }, []);

  // Enhanced session wait with exponential backoff for Vercel compatibility
  const waitForAdminSession = useCallback(async () => {
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
      } catch {
        const delay = Math.min(Math.pow(2, attempt) * 200, maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(
      'Session verification timed out. This can happen on Vercel with cold starts. Please try again.'
    );
  }, []);

  const finalizeServerLogin = useCallback(async (user: User) => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    try {
      setLoadingStage('verifying');
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
      setLoadingStage('redirecting');
      await new Promise((resolve) => setTimeout(resolve, 220));
      router.replace('/admin/dashboard');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to finalize login');
    } finally {
      isFinalizingRef.current = false;
    }
  }, [router, waitForAdminSession]);

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
    if (!firebaseAuth) return;
    const auth = firebaseAuth;

    let active = true;

    const completeLogin = async (user: User) => {
      if (!active || isFinalizingRef.current) return;

      try {
        setError(null);
        setLoading(true);
        await finalizeServerLogin(user);
      } catch (err) {
        if (!active) return;
        setError(getReadableAuthError(err));
        setLoading(false);
      }
    };

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await completeLogin(result.user);
        }
      } catch (err) {
        if (!active) return;
        setError(getReadableAuthError(err));
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        void completeLogin(user);
      }
    });

    void handleRedirectResult();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [finalizeServerLogin, getReadableAuthError, isCheckingAuth]);

  useEffect(() => {
    if (!loading) {
      setLoadingHintLevel(0);
      return;
    }

    const first = window.setTimeout(() => setLoadingHintLevel(1), 1400);
    const second = window.setTimeout(() => setLoadingHintLevel(2), 3600);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [loading]);

  const loadingMessage = (() => {
    if (loadingStage === 'starting-google') return 'Connecting to Google...';
    if (loadingStage === 'starting-email') return 'Signing in with email...';
    if (loadingStage === 'verifying') {
      if (loadingHintLevel === 0) return 'Verifying secure session...';
      if (loadingHintLevel === 1) return 'Almost there. Confirming access...';
      return 'Still verifying. This can take a moment on cold starts...';
    }
    if (loadingStage === 'redirecting') return 'Access approved. Redirecting...';
    return 'Signing in...';
  })();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLoadingStage('starting-google');
    setError(null);

    try {
      assertFirebaseClientConfig();
      if (!firebaseAuth) {
        throw new Error('Missing Firebase client environment variables for Google login.');
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      await signInWithRedirect(firebaseAuth, provider);
    } catch (e) {
      setError(getReadableAuthError(e));
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  const handleEmailPasswordLogin = async () => {
    setLoading(true);
    setLoadingStage('starting-email');
    setError(null);

    try {
      assertFirebaseClientConfig();
      if (!firebaseAuth) {
        throw new Error('Missing Firebase client environment variables for email/password login.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error('Please enter both email and password.');
      }

      const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
      await finalizeServerLogin(credential.user);
    } catch (e) {
      setError(getReadableAuthError(e));
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(235,216,188,0.6)_0%,transparent_35%),linear-gradient(135deg,#fbf7f0_0%,#f4eadb_45%,#ede0cf_100%)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#c4a884]/35 border-t-[#8d6b4e] animate-spin mb-4" />
          <p className="text-[#5f4a38]">Checking secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(235,216,188,0.6)_0%,transparent_35%),linear-gradient(135deg,#fbf7f0_0%,#f4eadb_45%,#ede0cf_100%)] px-4 py-12 sm:py-20">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-[#7a5f47]/12 bg-white/85 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="inline-flex rounded-full border border-[#7a5f47]/12 bg-[#fbf7f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a5f47]">
            Secure Portal
          </div>
          <h1 className="mt-4 text-2xl font-black text-[#2f241b] sm:text-3xl">Admin Login</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5846] sm:text-base">
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
              <p className="mt-2 text-xs text-red-100/80">
                Check that you are using the authorized Google account, then try again.
              </p>
            </motion.div>
          ) : null}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8d6b4e] px-5 py-3 text-sm font-bold text-[#fffaf3] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d9c3a7] border-t-[#fffaf3]" />
                {loadingMessage}
              </>
            ) : (
              error ? 'Try Google Sign-In Again' : 'Continue with Google'
            )}
          </button>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#7a5f47]/15" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d6b4e]">or</span>
            <div className="h-px flex-1 bg-[#7a5f47]/15" />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8d6b4e]">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-[#7a5f47]/12 bg-white px-4 py-2.5 text-sm text-[#2f241b] placeholder:text-[#b29579] focus:border-[#8d6b4e]/50 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8d6b4e]">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (!loading) {
                      void handleEmailPasswordLogin();
                    }
                  }
                }}
                placeholder="Enter admin password"
                className="w-full rounded-2xl border border-[#7a5f47]/12 bg-white px-4 py-2.5 text-sm text-[#2f241b] placeholder:text-[#b29579] focus:border-[#8d6b4e]/50 focus:outline-none"
              />
            </div>

            <button
              onClick={handleEmailPasswordLogin}
              disabled={loading || !email.trim() || !password}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#7a5f47]/12 bg-white px-5 py-3 text-sm font-bold text-[#5f4a38] transition hover:bg-[#f7efe4] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {loading && loadingStage === 'starting-email' ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d9c3a7]/50 border-t-[#8d6b4e]" />
                  Signing in with email...
                </>
              ) : (
                'Sign in with Email & Password'
              )}
            </button>
          </div>

          {!loading && error ? (
            <button
              onClick={handleGoogleLogin}
              className="mt-3 w-full rounded-full border border-[#7a5f47]/12 bg-white px-5 py-2.5 text-sm font-semibold text-[#5f4a38] transition hover:bg-[#f7efe4]"
            >
              Retry with Google Account
            </button>
          ) : null}

          <p className="mt-5 text-xs leading-relaxed text-[#6a5846]">
            Access is restricted to one admin email configured on the server. Use the same authorized email for either Google sign-in or email/password authentication.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
