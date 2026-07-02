"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { assertFirebaseClientConfig, firebaseAuth } from '@/app/lib/firebaseClient';

// ── Types ───────────────────────────────────────────────────────────
type LoginStep = 'credentials' | 'otp' | 'forgot-password';
type LoadingStage =
  | 'idle'
  | 'starting-email'
  | 'sending-otp'
  | 'verifying-otp'
  | 'verifying'
  | 'redirecting'
  | 'sending-reset';

const ADMIN_LOGIN_EMAIL_DEFAULT = 'rahulchakradharperepogu@gmail.com';
const OTP_LENGTH = 6;

// ── Decorative Background ───────────────────────────────────────────
function LoginBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Primary radial glow */}
      <div
        className="absolute animate-float-slow"
        style={{
          top: '-8%',
          right: '-6%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,168,132,0.28) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Secondary accent */}
      <div
        className="absolute"
        style={{
          bottom: '-12%',
          left: '-8%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(141,107,78,0.16) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'floatSlow 7s ease-in-out infinite reverse',
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(122,95,71,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(122,95,71,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

// ── OTP Input Component ─────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;
    const newVal = value.split('');
    // Pad to length
    while (newVal.length < OTP_LENGTH) newVal.push('');
    newVal[index] = digit;
    const joined = newVal.join('');
    onChange(joined);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newVal = value.split('');
      newVal[index - 1] = '';
      onChange(newVal.join(''));
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      onChange(pasted.padEnd(OTP_LENGTH, ''));
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={i === 0}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="h-13 w-11 sm:h-14 sm:w-12 rounded-xl border-2 bg-white text-center text-xl sm:text-2xl font-bold text-[#2f241b] transition-all duration-200 focus:outline-none disabled:opacity-50"
          style={{
            borderColor: value[i]
              ? 'rgba(141,107,78,0.5)'
              : 'rgba(122,95,71,0.12)',
            boxShadow: value[i]
              ? '0 0 0 3px rgba(141,107,78,0.08), 0 4px 12px rgba(122,95,71,0.1)'
              : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ── Timer Display ───────────────────────────────────────────────────
function CountdownTimer({
  expiresAt,
  onExpired,
}: {
  expiresAt: number;
  onExpired: () => void;
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) onExpired();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 30;

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums"
      style={{ color: isLow ? '#c0392b' : '#8d6b4e' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

// ── Password Visibility Toggle ──────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}


// ── Spinner ─────────────────────────────────────────────────────────
function Spinner({ size = 16, light = false }: { size?: number; light?: boolean }) {
  return (
    <div
      className="animate-spin rounded-full"
      style={{
        width: size,
        height: size,
        border: `2px solid ${light ? 'rgba(255,250,243,0.3)' : 'rgba(141,107,78,0.2)'}`,
        borderTopColor: light ? '#fffaf3' : '#8d6b4e',
      }}
    />
  );
}

// ── Main Login Page ─────────────────────────────────────────────────
export default function AdminLoginPage() {
  const router = useRouter();

  // Auth state
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form state
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState(ADMIN_LOGIN_EMAIL_DEFAULT);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  // OTP state
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const idTokenRef = useRef<string | null>(null);
  const firebaseUserRef = useRef<User | null>(null);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Loading hints
  const [loadingHintLevel, setLoadingHintLevel] = useState(0);

  // ── Error helpers ─────────────────────────────────────────────────
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

  // ── Session helpers ───────────────────────────────────────────────
  const waitForAdminSession = useCallback(async () => {
    const maxAttempts = 10;
    const maxDelay = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const meRes = await fetch('/api/admin/auth/me', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });
        if (meRes.ok) return true;
        if (meRes.status === 401) {
          const delay = Math.min(Math.pow(2, attempt) * 200, maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`Session check failed: ${meRes.status}`);
      } catch {
        const delay = Math.min(Math.pow(2, attempt) * 200, maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Session verification timed out. Please try again.');
  }, []);


  // ── Check existing auth on mount ──────────────────────────────────
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const meRes = await fetch('/api/admin/auth/me', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });
        if (meRes.ok) {
          router.replace('/admin/dashboard');
        }
      } catch {
        // Not authenticated
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkExistingAuth();
  }, [router]);


  // ── Loading hint escalation ───────────────────────────────────────
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
    if (loadingStage === 'starting-email') return 'Validating credentials...';
    if (loadingStage === 'sending-otp') return 'Sending verification code...';
    if (loadingStage === 'verifying-otp') return 'Verifying code...';
    if (loadingStage === 'sending-reset') return 'Sending reset link...';
    if (loadingStage === 'verifying') {
      if (loadingHintLevel === 0) return 'Verifying secure session...';
      if (loadingHintLevel === 1) return 'Almost there. Confirming access...';
      return 'Still verifying. This can take a moment on cold starts...';
    }
    if (loadingStage === 'redirecting') return 'Access approved. Redirecting...';
    return 'Signing in...';
  })();


  // ── Email/Password Login → Send OTP ───────────────────────────────
  const handleEmailPasswordLogin = async () => {
    setLoading(true);
    setLoadingStage('starting-email');
    setError(null);
    setSuccess(null);

    try {
      assertFirebaseClientConfig();
      if (!firebaseAuth) {
        throw new Error('Missing Firebase client environment variables.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error('Please enter both email and password.');
      }

      // Authenticate with Firebase
      const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
      firebaseUserRef.current = credential.user;

      // Get ID token for OTP request
      const idToken = await credential.user.getIdToken(true);
      idTokenRef.current = idToken;

      // Send OTP
      setLoadingStage('sending-otp');
      const otpRes = await fetch('/api/admin/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include',
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        throw new Error(otpData.error || 'Failed to send OTP');
      }

      // Move to OTP step
      setOtpExpiresAt(Date.now() + (otpData.expiresInMs || 300000));
      setMaskedEmail(otpData.maskedEmail || normalizedEmail);
      setOtpExpired(false);
      setOtp('');
      setStep('otp');
      setLoading(false);
      setLoadingStage('idle');
    } catch (e) {
      setError(getReadableAuthError(e));
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.replace(/\s/g, '').length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setLoadingStage('verifying-otp');
    setError(null);

    try {
      // Refresh the token in case it expired
      if (firebaseUserRef.current) {
        idTokenRef.current = await firebaseUserRef.current.getIdToken(true);
      }

      if (!idTokenRef.current) {
        throw new Error('Session expired. Please sign in again.');
      }

      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: idTokenRef.current,
          otp: otp.trim(),
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.expired || data.locked) {
          // OTP expired or locked — go back
          setError(data.error);
          setLoading(false);
          setLoadingStage('idle');
          return;
        }
        throw new Error(data.error || 'OTP verification failed');
      }

      // Success — wait for session and redirect
      setLoadingStage('redirecting');
      await waitForAdminSession();
      await new Promise((resolve) => setTimeout(resolve, 220));
      router.replace('/admin/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed. Please try again.');
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setLoading(true);
    setLoadingStage('sending-otp');
    setError(null);

    try {
      if (firebaseUserRef.current) {
        idTokenRef.current = await firebaseUserRef.current.getIdToken(true);
      }

      if (!idTokenRef.current) {
        throw new Error('Session expired. Please sign in again.');
      }

      const res = await fetch('/api/admin/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idTokenRef.current }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');

      setOtpExpiresAt(Date.now() + (data.expiresInMs || 300000));
      setOtpExpired(false);
      setOtp('');
      setSuccess('A new code has been sent to your email.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  // ── Forgot Password ──────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setLoadingStage('sending-reset');
    setError(null);

    try {
      assertFirebaseClientConfig();
      if (!firebaseAuth) throw new Error('Firebase not configured.');

      await sendPasswordResetEmail(firebaseAuth, targetEmail);
      setResetSent(true);
      setSuccess(null);
    } catch (e) {
      // Don't reveal if the email exists or not
      setResetSent(true);
    } finally {
      setLoading(false);
      setLoadingStage('idle');
    }
  };

  // ── Go back to credentials ────────────────────────────────────────
  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
    setError(null);
    setSuccess(null);
    setOtpExpired(false);
  };

  // ── Open forgot password ──────────────────────────────────────────
  const handleOpenForgotPassword = () => {
    setStep('forgot-password');
    setForgotEmail(email);
    setResetSent(false);
    setError(null);
    setSuccess(null);
  };

  // ── Animation variants ────────────────────────────────────────────
  const stepVariants = {
    initial: { opacity: 0, x: 24, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -24, filter: 'blur(4px)' },
  };

  // ── Loading screen ────────────────────────────────────────────────
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(235,216,188,0.6) 0%, transparent 35%), linear-gradient(135deg, #fbf7f0 0%, #f4eadb 45%, #ede0cf 100%)' }}>
        <LoginBackground />
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#c4a884]/35 border-t-[#8d6b4e] animate-spin mb-4" />
          <p className="text-[#5f4a38] text-sm font-medium">Checking secure session...</p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen px-4 py-12 sm:py-20 relative"
      style={{
        background: 'radial-gradient(circle at 20% 20%, rgba(235,216,188,0.6) 0%, transparent 35%), linear-gradient(135deg, #fbf7f0 0%, #f4eadb 45%, #ede0cf 100%)',
      }}
    >
      <LoginBackground />

      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-3xl border border-[#7a5f47]/10 p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,250,243,0.88) 100%)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(122,95,71,0.1), 0 8px 24px rgba(122,95,71,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {/* Inner glow decoration */}
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(141,107,78,0.06) 0%, transparent 70%)',
            }}
          />

          <AnimatePresence mode="wait">
            {/* ═══════════ STEP: CREDENTIALS ═══════════ */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Badge */}
                <div className="inline-flex rounded-full border border-[#7a5f47]/12 bg-[#fbf7f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a5f47]">
                  <span className="mr-1.5">🔐</span> Secure Portal
                </div>

                <h1 className="mt-4 text-2xl font-black text-[#2f241b] sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
                  Admin Login
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#6a5846] sm:text-base">
                  Sign in with your authorized admin credentials.
                </p>

                {/* Error display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="mt-4 rounded-2xl border border-red-200/60 px-4 py-3 text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)' }}
                  >
                    <p className="font-semibold text-red-700 text-xs uppercase tracking-wider">Login Error</p>
                    <p className="mt-1 text-red-600/90 text-[13px]">{error}</p>
                  </motion.div>
                )}

                {/* Email / Password Form */}
                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6b4e]">
                      Admin Email
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-[#7a5f47]/12 bg-white px-4 py-3 text-sm text-[#2f241b] placeholder:text-[#b29579] transition-all duration-200 focus:border-[#8d6b4e]/40 focus:outline-none focus:ring-2 focus:ring-[#8d6b4e]/8"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6b4e]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            e.preventDefault();
                            void handleEmailPasswordLogin();
                          }
                        }}
                        placeholder="Enter admin password"
                        className="w-full rounded-xl border border-[#7a5f47]/12 bg-white px-4 py-3 pr-11 text-sm text-[#2f241b] placeholder:text-[#b29579] transition-all duration-200 focus:border-[#8d6b4e]/40 focus:outline-none focus:ring-2 focus:ring-[#8d6b4e]/8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d6b4e]/50 hover:text-[#8d6b4e] transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      disabled={loading}
                      className="text-xs font-semibold text-[#8d6b4e] hover:text-[#6e5440] transition-colors disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    id="email-sign-in-btn"
                    onClick={handleEmailPasswordLogin}
                    disabled={loading || !email.trim() || !password}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#7a5f47]/12 bg-white px-5 py-3.5 text-sm font-bold text-[#5f4a38] transition-all duration-200 hover:bg-[#f7efe4] hover:border-[#7a5f47]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                    style={{ boxShadow: '0 2px 8px rgba(122,95,71,0.06)' }}
                  >
                    {loading && (loadingStage === 'starting-email' || loadingStage === 'sending-otp') ? (
                      <>
                        <Spinner size={16} />
                        {loadingMessage}
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Sign in with Email &amp; Password
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-5 text-center text-xs leading-relaxed text-[#9c8a78]">
                  Access is restricted to the authorized admin email only.
                  <br />
                  OTP verification will be sent after credential check.
                </p>
              </motion.div>
            )}

            {/* ═══════════ STEP: OTP VERIFICATION ═══════════ */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Back button */}
                <button
                  onClick={handleBackToCredentials}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8d6b4e] hover:text-[#6e5440] transition-colors disabled:opacity-50 mb-4"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to login
                </button>

                {/* Badge */}
                <div className="inline-flex rounded-full border border-[#7a5f47]/12 bg-[#fbf7f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a5f47]">
                  <span className="mr-1.5">✉️</span> Verification
                </div>

                <h1 className="mt-4 text-2xl font-black text-[#2f241b] sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
                  Enter Code
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#6a5846]">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-semibold text-[#2f241b]">{maskedEmail}</span>
                </p>

                {/* Timer */}
                <div className="mt-4 flex items-center justify-center">
                  {!otpExpired ? (
                    <CountdownTimer
                      expiresAt={otpExpiresAt}
                      onExpired={() => setOtpExpired(true)}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-red-500">
                      Code expired
                    </span>
                  )}
                </div>

                {/* Error / Success */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-red-200/60 px-4 py-3 text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)' }}
                  >
                    <p className="text-red-600/90 text-[13px]">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-emerald-200/60 px-4 py-3 text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 100%)' }}
                  >
                    <p className="text-emerald-700 text-[13px]">{success}</p>
                  </motion.div>
                )}

                {/* OTP Input */}
                <div className="mt-6">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={loading || otpExpired}
                  />
                </div>

                {/* Verify Button */}
                <button
                  id="verify-otp-btn"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.replace(/\s/g, '').length !== OTP_LENGTH || otpExpired}
                  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  style={{
                    background: loading || otp.replace(/\s/g, '').length !== OTP_LENGTH || otpExpired
                      ? '#c4a884'
                      : 'linear-gradient(135deg, #8d6b4e 0%, #6e5440 100%)',
                    color: '#fffaf3',
                    boxShadow: otp.replace(/\s/g, '').length === OTP_LENGTH && !otpExpired
                      ? '0 8px 24px rgba(141,107,78,0.25)'
                      : 'none',
                  }}
                >
                  {loading && loadingStage === 'verifying-otp' ? (
                    <>
                      <Spinner size={16} light />
                      {loadingMessage}
                    </>
                  ) : loading && loadingStage === 'redirecting' ? (
                    <>
                      <Spinner size={16} light />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Verify &amp; Sign In
                    </>
                  )}
                </button>

                {/* Resend */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs font-semibold text-[#8d6b4e] hover:text-[#6e5440] transition-colors disabled:opacity-50"
                  >
                    {loading && loadingStage === 'sending-otp' ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Spinner size={12} />
                        Sending...
                      </span>
                    ) : (
                      "Didn't receive the code? Resend"
                    )}
                  </button>
                </div>

                <p className="mt-5 text-center text-xs leading-relaxed text-[#9c8a78]">
                  Check your inbox and spam folder. The code expires in 5 minutes.
                </p>
              </motion.div>
            )}

            {/* ═══════════ STEP: FORGOT PASSWORD ═══════════ */}
            {step === 'forgot-password' && (
              <motion.div
                key="forgot-password"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Back button */}
                <button
                  onClick={handleBackToCredentials}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8d6b4e] hover:text-[#6e5440] transition-colors disabled:opacity-50 mb-4"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to login
                </button>

                {/* Badge */}
                <div className="inline-flex rounded-full border border-[#7a5f47]/12 bg-[#fbf7f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a5f47]">
                  <span className="mr-1.5">🔑</span> Password Reset
                </div>

                <h1 className="mt-4 text-2xl font-black text-[#2f241b] sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
                  Reset Password
                </h1>

                {!resetSent ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-[#6a5846]">
                      Enter your admin email address. We&apos;ll send you a link to reset your password.
                    </p>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-2xl border border-red-200/60 px-4 py-3 text-sm"
                        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)' }}
                      >
                        <p className="text-red-600/90 text-[13px]">{error}</p>
                      </motion.div>
                    )}

                    <div className="mt-5">
                      <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6b4e]">
                        Email Address
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            e.preventDefault();
                            void handleForgotPassword();
                          }
                        }}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-[#7a5f47]/12 bg-white px-4 py-3 text-sm text-[#2f241b] placeholder:text-[#b29579] transition-all duration-200 focus:border-[#8d6b4e]/40 focus:outline-none focus:ring-2 focus:ring-[#8d6b4e]/8"
                      />
                    </div>

                    <button
                      id="send-reset-btn"
                      onClick={handleForgotPassword}
                      disabled={loading || !forgotEmail.trim()}
                      className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                      style={{
                        background: 'linear-gradient(135deg, #8d6b4e 0%, #6e5440 100%)',
                        color: '#fffaf3',
                        boxShadow: '0 8px 24px rgba(141,107,78,0.25)',
                      }}
                    >
                      {loading && loadingStage === 'sending-reset' ? (
                        <>
                          <Spinner size={16} light />
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          Send Reset Link
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Success State */}
                    <div className="mt-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)',
                          border: '2px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </motion.div>

                      <h2 className="text-lg font-bold text-[#2f241b]">Check Your Email</h2>
                      <p className="mt-2 text-sm text-[#6a5846] leading-relaxed">
                        If an account exists for <span className="font-semibold">{forgotEmail}</span>, a password reset link has been sent.
                      </p>
                      <p className="mt-3 text-xs text-[#9c8a78]">
                        Don&apos;t see it? Check your spam folder.
                      </p>
                    </div>

                    <button
                      onClick={handleBackToCredentials}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#7a5f47]/12 bg-white px-5 py-3.5 text-sm font-bold text-[#5f4a38] transition-all duration-200 hover:bg-[#f7efe4] sm:text-base"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Return to Login
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
