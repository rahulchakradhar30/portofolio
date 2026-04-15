"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Loader, CheckCircle } from "lucide-react";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    // Check if user is trying to skip 2FA
    const isPendingOTP = sessionStorage.getItem("pendingOTPVerification");
    if (!isPendingOTP) {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, type: "admin_login_verification" }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        sessionStorage.removeItem("pendingOTPVerification");
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Invalid verification code");
        setOtp("");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/send-otp-email", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setResendCountdown(60);
      } else {
        setError(data.error || "Failed to resend OTP");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {success ? (
              <motion.div animate={{ scale: [0, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
            ) : (
              <Mail className="w-12 h-12 text-violet-600" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {success ? "Verified!" : "Verify Your Identity"}
          </h1>
          <p className="text-gray-600">
            {success
              ? "Access granted to admin portal"
              : "Enter the code sent to your email"}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-lg focus:border-violet-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || otp.length < 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0 || resendLoading}
              className="w-full text-sm text-violet-600 hover:text-violet-700 disabled:text-gray-400 py-2"
            >
              {resendCountdown > 0
                ? `Resend code in ${resendCountdown}s`
                : resendLoading
                ? "Sending..."
                : "Didn't receive code? Resend"}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
