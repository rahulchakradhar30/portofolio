"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Mail, Smartphone, Key, Check, Plus, Trash2, AlertCircle, RefreshCw, X, Copy, QrCode } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";

type Active2FAMethod = "EMAIL_OTP" | "TOTP" | "PASSKEY";

interface PasskeyItem {
  id: string;
  name: string;
  createdAt: number;
  lastUsedAt: number;
  deviceType?: string;
}

interface StatusData {
  active2FAMethod: Active2FAMethod;
  totpConfigured: boolean;
  passkeysCount: number;
  passkeys?: PasskeyItem[];
}

export default function Security2FASection() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // TOTP Setup Modal State
  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<{
    qrCodeUrl: string;
    manualKey: string;
    issuer: string;
    account: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [verifyingTotp, setVerifyingTotp] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Passkey State
  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  const fetch2FAStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/2fa-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to load 2FA status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch2FAStatus();
  }, [fetch2FAStatus]);

  // ── Switch Method ──────────────────────────────────────────────────
  const handleSelectMethod = async (targetMethod: Active2FAMethod) => {
    if (status?.active2FAMethod === targetMethod) return;

    // If TOTP chosen but not configured, open setup modal
    if (targetMethod === "TOTP" && !status?.totpConfigured) {
      void handleStartTotpSetup();
      return;
    }

    // If PASSKEY chosen but no passkeys registered, open passkey modal
    if (targetMethod === "PASSKEY" && (!status?.passkeysCount || status.passkeysCount === 0)) {
      setShowPasskeyModal(true);
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/auth/2fa-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: targetMethod }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update 2FA method");
      }

      setSuccess(`Updated active 2FA method to ${formatMethodLabel(targetMethod)}`);
      await fetch2FAStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch method");
    } finally {
      setUpdating(false);
    }
  };

  // ── TOTP Setup Flow ────────────────────────────────────────────────
  const handleStartTotpSetup = async () => {
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/auth/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start Google Authenticator setup");
      }

      setTotpSetupData(data);
      setTotpCode("");
      setShowTotpModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup initiation failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyTotp = async () => {
    if (totpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setVerifyingTotp(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccess("Google Authenticator activated successfully!");
      setShowTotpModal(false);
      setTotpSetupData(null);
      await fetch2FAStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "TOTP verification failed");
    } finally {
      setVerifyingTotp(false);
    }
  };

  // ── Passkey Registration Flow ──────────────────────────────────────
  const handleStartPasskeyRegistration = async () => {
    setRegisteringPasskey(true);
    setError(null);

    try {
      // 1. Get options from server
      const optionsRes = await fetch("/api/admin/auth/passkey/register-options", { method: "POST" });
      const options = await optionsRes.json();

      if (!optionsRes.ok) {
        throw new Error(options.error || "Failed to initiate passkey registration");
      }

      // 2. Trigger browser WebAuthn prompt
      const registrationResponse = await startRegistration({ optionsJSON: options });

      // 3. Verify response on server
      const verifyRes = await fetch("/api/admin/auth/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationResponse,
          name: passkeyName.trim() || "Admin Device Passkey",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Passkey verification failed");
      }

      setSuccess("Passkey registered and set as your active 2FA method!");
      setShowPasskeyModal(false);
      setPasskeyName("");
      await fetch2FAStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Passkey registration failed";
      if (msg.includes("cancelled") || msg.includes("not allowed")) {
        setError("Passkey setup was cancelled.");
      } else {
        setError(msg);
      }
    } finally {
      setRegisteringPasskey(false);
    }
  };

  const handleDeletePasskey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove passkey "${name}"?`)) return;

    setError(null);
    try {
      const res = await fetch("/api/admin/auth/passkey/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove passkey");
      }

      setSuccess("Passkey removed successfully");
      await fetch2FAStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting passkey");
    }
  };

  const copyManualKey = () => {
    if (!totpSetupData?.manualKey) return;
    navigator.clipboard.writeText(totpSetupData.manualKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatMethodLabel = (m: Active2FAMethod) => {
    if (m === "EMAIL_OTP") return "Email OTP";
    if (m === "TOTP") return "Google Authenticator";
    return "Passkey (WebAuthn)";
  };

  const formatKeyDisplay = (key: string) => {
    return key.match(/.{1,4}/g)?.join(" ") || key;
  };

  if (loading) {
    return (
      <div className="paper-card p-6 flex items-center justify-center gap-2 text-[var(--foreground)]/60">
        <RefreshCw className="h-4 w-4 animate-spin text-[var(--accent)]" />
        <span>Loading 2FA security configuration...</span>
      </div>
    );
  }

  const activeMethod = status?.active2FAMethod || "EMAIL_OTP";

  return (
    <div className="paper-card space-y-6 p-5 shadow-none md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[var(--foreground)]/10 pb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <ShieldCheck className="h-5 w-5 text-[var(--accent)]" /> Two-Factor Authentication
        </h3>
        <p className="text-xs text-[var(--foreground)]/65">
          Select your primary Admin 2FA verification method. Only the selected method will be requested during login.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2FA Method Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 1. EMAIL OTP CARD */}
        <div
          onClick={() => handleSelectMethod("EMAIL_OTP")}
          className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
            activeMethod === "EMAIL_OTP"
              ? "border-[#8d6b4e] bg-[#fbf7f0] shadow-sm ring-1 ring-[#8d6b4e]/30"
              : "border-gray-200 bg-white hover:border-[#8d6b4e]/40"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/60 text-amber-800">
                <Mail className="h-5 w-5" />
              </div>
              {activeMethod === "EMAIL_OTP" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8d6b4e] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  <Check className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">
                  Available
                </span>
              )}
            </div>

            <h4 className="font-bold text-[#2f241b] text-base">Email OTP</h4>
            <p className="mt-1 text-xs text-[#6a5846] leading-relaxed">
              Receive a one-time verification code by email during login.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              disabled={updating || activeMethod === "EMAIL_OTP"}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMethod("EMAIL_OTP");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-[#5f4a38] transition hover:bg-[#f7efe4] disabled:opacity-50"
            >
              {activeMethod === "EMAIL_OTP" ? "Currently Active" : "Select Email OTP"}
            </button>
          </div>
        </div>

        {/* 2. GOOGLE AUTHENTICATOR CARD */}
        <div
          onClick={() => handleSelectMethod("TOTP")}
          className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
            activeMethod === "TOTP"
              ? "border-[#8d6b4e] bg-[#fbf7f0] shadow-sm ring-1 ring-[#8d6b4e]/30"
              : "border-gray-200 bg-white hover:border-[#8d6b4e]/40"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100/60 text-blue-800">
                <Smartphone className="h-5 w-5" />
              </div>
              {activeMethod === "TOTP" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8d6b4e] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  <Check className="h-3 w-3" /> Active
                </span>
              ) : status?.totpConfigured ? (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold uppercase">
                  Verified
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">
                  Not Configured
                </span>
              )}
            </div>

            <h4 className="font-bold text-[#2f241b] text-base">Google Authenticator</h4>
            <p className="mt-1 text-xs text-[#6a5846] leading-relaxed">
              Use a time-based verification code (TOTP) generated by an authenticator app.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
            {!status?.totpConfigured ? (
              <button
                type="button"
                disabled={updating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTotpSetup();
                }}
                className="w-full rounded-xl bg-[#8d6b4e] py-2 text-xs font-semibold text-white transition hover:bg-[#6e5440] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <QrCode className="h-3.5 w-3.5" />
                Set up Google Authenticator
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={updating || activeMethod === "TOTP"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMethod("TOTP");
                  }}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-[#5f4a38] transition hover:bg-[#f7efe4] disabled:opacity-50"
                >
                  {activeMethod === "TOTP" ? "Currently Active" : "Select Authenticator"}
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTotpSetup();
                  }}
                  className="rounded-xl border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  title="Re-configure Google Authenticator"
                >
                  Re-setup
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3. PASSKEY CARD */}
        <div
          onClick={() => handleSelectMethod("PASSKEY")}
          className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
            activeMethod === "PASSKEY"
              ? "border-[#8d6b4e] bg-[#fbf7f0] shadow-sm ring-1 ring-[#8d6b4e]/30"
              : "border-gray-200 bg-white hover:border-[#8d6b4e]/40"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100/60 text-purple-800">
                <Key className="h-5 w-5" />
              </div>
              {activeMethod === "PASSKEY" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8d6b4e] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  <Check className="h-3 w-3" /> Active
                </span>
              ) : status?.passkeysCount && status.passkeysCount > 0 ? (
                <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {status.passkeysCount} {status.passkeysCount === 1 ? "Passkey" : "Passkeys"}
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">
                  Not Configured
                </span>
              )}
            </div>

            <h4 className="font-bold text-[#2f241b] text-base">Passkey (WebAuthn)</h4>
            <p className="mt-1 text-xs text-[#6a5846] leading-relaxed">
              Authenticate using a device passkey, biometric, PIN, or hardware security key.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
            {!status?.passkeysCount || status.passkeysCount === 0 ? (
              <button
                type="button"
                disabled={updating}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPasskeyModal(true);
                }}
                className="w-full rounded-xl bg-[#8d6b4e] py-2 text-xs font-semibold text-white transition hover:bg-[#6e5440] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Register Passkey
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={updating || activeMethod === "PASSKEY"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMethod("PASSKEY");
                  }}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-[#5f4a38] transition hover:bg-[#f7efe4] disabled:opacity-50"
                >
                  {activeMethod === "PASSKEY" ? "Currently Active" : "Select Passkey"}
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPasskeyModal(true);
                  }}
                  className="rounded-xl border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                  title="Add Another Passkey"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Registered Passkeys List */}
      {status?.passkeys && status.passkeys.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#2f241b] flex items-center gap-1.5">
              <Key className="h-4 w-4 text-[#8d6b4e]" /> Registered Passkeys ({status.passkeys.length})
            </h4>
            <button
              onClick={() => setShowPasskeyModal(true)}
              className="text-xs font-semibold text-[#8d6b4e] hover:text-[#6e5440] flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Passkey
            </button>
          </div>

          <div className="space-y-2">
            {status.passkeys.map((pk) => (
              <div
                key={pk.id}
                className="flex items-center justify-between rounded-xl border bg-gray-50/50 p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold">
                    🔑
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{pk.name}</p>
                    <p className="text-[11px] text-gray-500">
                      Added {new Date(pk.createdAt).toLocaleDateString()} • Last used:{" "}
                      {pk.lastUsedAt ? new Date(pk.lastUsedAt).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePasskey(pk.id, pk.name)}
                  className="rounded-lg border border-red-100 p-1.5 text-red-600 hover:bg-red-50 transition"
                  title="Remove Passkey"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: GOOGLE AUTHENTICATOR SETUP ═══════════ */}
      {showTotpModal && totpSetupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-[#2f241b] text-lg">Set up Google Authenticator</h3>
                <p className="text-xs text-gray-500">Scan QR code or enter manual key in your app</p>
              </div>
              <button
                onClick={() => {
                  setShowTotpModal(false);
                  setTotpSetupData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Step 1: Scan QR */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8d6b4e] mb-2">
                  1. Scan this QR code
                </p>
                <div className="flex justify-center rounded-2xl border bg-gray-50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={totpSetupData.qrCodeUrl} alt="Google Authenticator QR Code" className="h-44 w-44 rounded-lg" />
                </div>
              </div>

              {/* Step 2: Manual Key */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8d6b4e] mb-1">
                  2. Or enter this setup key manually
                </p>
                <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-3 py-2 text-xs font-mono font-bold text-slate-800">
                  <span>{formatKeyDisplay(totpSetupData.manualKey)}</span>
                  <button
                    onClick={copyManualKey}
                    className="flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-[11px] font-sans font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    {copiedKey ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedKey ? "Copied" : "Copy Key"}
                  </button>
                </div>
              </div>

              {/* Step 3: Enter Code */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8d6b4e] mb-1.5">
                  3. Enter 6-digit code from authenticator app
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-bold tracking-[0.4em] font-mono rounded-xl border border-gray-300 py-2.5 focus:border-[#8d6b4e] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTotpModal(false);
                  setTotpSetupData(null);
                }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingTotp || totpCode.trim().length !== 6}
                onClick={handleVerifyTotp}
                className="flex-1 rounded-xl bg-[#8d6b4e] py-2.5 text-xs font-bold text-white transition hover:bg-[#6e5440] disabled:opacity-50"
              >
                {verifyingTotp ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: PASSKEY REGISTRATION ═══════════ */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-[#2f241b] text-lg">Register a Passkey</h3>
                <p className="text-xs text-gray-500">Use TouchID, FaceID, Security Key, or device lock</p>
              </div>
              <button onClick={() => setShowPasskeyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8d6b4e] uppercase tracking-wider mb-1">
                  Passkey Name / Description
                </label>
                <input
                  type="text"
                  value={passkeyName}
                  onChange={(e) => setPasskeyName(e.target.value)}
                  placeholder="e.g. MacBook Pro TouchID"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#8d6b4e] focus:outline-none"
                />
              </div>

              <div className="rounded-xl border bg-purple-50/50 p-3.5 text-xs text-purple-900 leading-relaxed">
                When you click continue, your device will prompt you to complete biometric or key authentication.
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPasskeyModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={registeringPasskey}
                onClick={handleStartPasskeyRegistration}
                className="flex-1 rounded-xl bg-[#8d6b4e] py-2.5 text-xs font-bold text-white transition hover:bg-[#6e5440] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {registeringPasskey ? "Waiting for device..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
