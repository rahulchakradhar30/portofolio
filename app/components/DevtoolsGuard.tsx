"use client";

import { useEffect } from 'react';
import { initializeDevtoolsBlocker } from '@/app/lib/devtoolsBlocker';

/**
 * DevtoolsGuard Component
 * Initializes devtools blocking on app startup
 * Runs only in production
 */
export function DevtoolsGuard() {
  useEffect(() => {
    // Initialize devtools blocker
    initializeDevtoolsBlocker({
      enabled: process.env.NODE_ENV === 'production',
      checkInterval: 1000, // Check every second
      methods: ['console', 'size', 'debugger'],
      logDetection: false,
      blockMessage: '🔒 Developer tools are disabled for security reasons. Please close DevTools to continue.',
    });
  }, []);

  return null; // This component doesn't render anything
}

export default DevtoolsGuard;
