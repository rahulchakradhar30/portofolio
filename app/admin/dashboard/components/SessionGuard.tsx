"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const CHANNEL_NAME = "admin_session_sync";

export default function SessionGuard() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const handleLogout = useCallback(async (reason = "inactivity") => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({ type: "LOGOUT", reason });
      }
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error during auto-logout:", err);
    } finally {
      router.replace("/admin/login?expired=true");
    }
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleLogout("inactivity");
    }, INACTIVITY_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // BroadcastChannel for multi-tab logout sync
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          router.replace("/admin/login?expired=true");
        }
      };
    } catch {
      // BroadcastChannel unsupported in legacy environments fallback
    }

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    const onActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    // Start timer on mount
    resetInactivityTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, onActivity);
      });
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [resetInactivityTimer, router]);

  return null;
}
