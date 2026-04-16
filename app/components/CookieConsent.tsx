"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type ConsentChoice = "accepted" | "declined";

const STORAGE_KEY = "portfolio_cookie_consent";
const COOKIE_NAME = "cookieConsent";

export default function CookieConsent() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
      return !existing;
    } catch {
      // If storage is blocked, show banner and continue without throwing.
      return true;
    }
  });

  const saveConsent = (choice: ConsentChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore storage failures gracefully.
    }

    // Keep a simple cookie for server-side checks if needed later.
    document.cookie = `${COOKIE_NAME}=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    setIsVisible(false);
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-5 sm:bottom-5"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-cyan-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm leading-relaxed text-slate-700 md:pr-6">
                We use essential cookies to keep this site secure and reliable. You can accept or decline
                non-essential cookies.
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveConsent("declined")}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => saveConsent("accepted")}
                  className="rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
