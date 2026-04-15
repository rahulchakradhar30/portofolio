"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Smartphone, Copy, Check } from "lucide-react";

export default function Setup2FA() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const res = await fetch("/api/admin/auth/generate-2fa", {
          method: "POST",
        });
        const data = await res.json();
        setSecret(data.secret);
        setQrCode(data.qrCode);
      } catch (err) {
        setError("Failed to generate 2FA secret");
      }
    };

    generateSecret();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, verificationCode }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/backup-codes");
      } else {
        setError(data.error || "Invalid verification code");
        setVerificationCode("");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <Smartphone className="w-12 h-12 text-violet-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600">
            Secure your account with Google Authenticator
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Step 1: Scan with Google Authenticator
            </p>
            {qrCode ? (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-40 h-40" />
              </div>
            ) : (
              <div className="w-40 h-40 mx-auto bg-gray-100 animate-pulse rounded" />
            )}
          </div>

          {/* Step 2: Manual Entry */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Step 2: Or enter manually
            </p>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded">
              <input
                type="text"
                value={secret}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono text-gray-700"
              />
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Step 3: Verify */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Step 3: Enter verification code
              </p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-lg focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Enable 2FA"}
            </motion.button>
          </form>

          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-600 hover:text-gray-700 py-2"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
