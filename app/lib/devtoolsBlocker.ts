/**
 * Devtools Detection & Blocking System
 * Detects when developer tools are open and blocks website access
 * Prevents inspection, debugging, and reverse engineering
 */

export interface DevtoolsConfig {
  enabled: boolean;
  blockMessage: string;
  checkInterval: number;
  methods: ('console' | 'timing' | 'size' | 'toString' | 'regex')[];
  logDetection: boolean;
}

const DEFAULT_CONFIG: DevtoolsConfig = {
  enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'production',
  blockMessage: '🔒 Developer tools are disabled for security reasons. Please close DevTools to continue.',
  checkInterval: 500,
  methods: ['console', 'timing', 'size', 'toString', 'regex'],
  logDetection: false,
};

let devtoolsDetected = false;
let blockingActive = false;

/**
 * Method 1: Console API Detection
 * Checks if console functions are being proxied
 */
function detectViaConsole(): boolean {
  try {
    const console_output = console.log.toString();
    if (console_output.includes('native code')) {
      return false; // Native console, devtools not detected
    }
    return true; // Proxied console indicates devtools
  } catch {
    return false;
  }
}

/**
 * Method 2: Timing Analysis
 * Devtools being open causes timing delays
 */
function detectViaTiming(): boolean {
  const startTime = performance.now();
  // Devtools causes a noticeable delay in function execution
  for (let i = 0; i < 100000; i++) {
    // Dummy loop
  }
  const endTime = performance.now();
  const timeDiff = endTime - startTime;
  return timeDiff > 50; // Threshold: if loop takes > 50ms, devtools likely open
}

/**
 * Method 3: Window Size Detection
 * Devtools reduces available window size
 */
function detectViaWindowSize(): boolean {
  try {
    // Check if window outer dimensions are significantly larger than inner
    const outerHeight = window.outerHeight;
    const innerHeight = window.innerHeight;
    const heightDiff = outerHeight - innerHeight;
    
    // Devtools typically takes 200+ pixels
    if (heightDiff > 150) {
      return true;
    }
    
    // Also check width for vertical devtools
    const outerWidth = window.outerWidth;
    const innerWidth = window.innerWidth;
    const widthDiff = outerWidth - innerWidth;
    
    return widthDiff > 150;
  } catch {
    return false;
  }
}

/**
 * Method 4: Object toString Override Detection
 * Checks if toString has been overridden (indicator of devtools manipulation)
 */
function detectViaToString(): boolean {
  try {
    const isDebugging = /^function\s*constructor\s*\(\)\s*{\s*\[native code\]\s*}/.test(
      Function.prototype.constructor.toString()
    );
    return !isDebugging; // If native code is missing, devtools is likely open
  } catch {
    return false;
  }
}

/**
 * Method 5: Debugger Statement Detection
 * Check for breakpoints or debugger statement interruption
 */
function detectViaDebuggerStatement(): boolean {
  try {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const end = performance.now();
    
    // If debugger statement caused a pause, devtools is open
    return end - start > 100;
  } catch {
    return false;
  }
}

/**
 * Method 6: Error Stack Analysis
 * Analyzes error stack for debugging indicators
 */
function detectViaErrorStack(): boolean {
  try {
    const error = new Error();
    const stack = error.stack || '';
    
    // Check for common devtools indicators in stack
    const devtoolsPatterns = [
      'debugger',
      'chrome-extension',
      'devtools',
      'inspector',
    ];
    
    return devtoolsPatterns.some(pattern => 
      stack.toLowerCase().includes(pattern)
    );
  } catch {
    return false;
  }
}

/**
 * Main detection function using multiple methods
 */
function checkDevtoolsOpen(config: DevtoolsConfig): boolean {
  if (!config.enabled) return false;

  let detectionResult = false;

  // Try each detection method
  for (const method of config.methods) {
    try {
      switch (method) {
        case 'console':
          detectionResult ||= detectViaConsole();
          break;
        case 'timing':
          detectionResult ||= detectViaTiming();
          break;
        case 'size':
          detectionResult ||= detectViaWindowSize();
          break;
        case 'toString':
          detectionResult ||= detectViaToString();
          break;
        case 'regex':
          detectionResult ||= detectViaErrorStack();
          break;
      }
    } catch (error) {
      if (config.logDetection) {
        console.error(`Error in ${method} detection:`, error);
      }
    }
  }

  return detectionResult;
}

/**
 * Block the page with security message
 */
function blockPage(config: DevtoolsConfig): void {
  if (blockingActive) return;

  blockingActive = true;
  devtoolsDetected = true;

  // Create blocking overlay
  const overlay = document.createElement('div');
  overlay.id = 'devtools-block-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999999;
    background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    text-align: center;
    color: #e0e0e0;
    z-index: 1000000;
    padding: 40px;
    max-width: 600px;
  `;

  const icon = document.createElement('div');
  icon.innerHTML = '🔒';
  icon.style.cssText = `
    font-size: 80px;
    margin-bottom: 20px;
    animation: pulse 2s infinite;
  `;

  const title = document.createElement('h1');
  title.textContent = 'Security Notice';
  title.style.cssText = `
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #00d4ff;
  `;

  const message = document.createElement('p');
  message.textContent = config.blockMessage;
  message.style.cssText = `
    font-size: 18px;
    margin-bottom: 30px;
    line-height: 1.6;
    color: #b0b0b0;
  `;

  const instruction = document.createElement('p');
  instruction.textContent = 'Close Developer Tools (F12, Ctrl+Shift+I, or Cmd+Option+I) and refresh the page to continue.';
  instruction.style.cssText = `
    font-size: 14px;
    color: #888;
    margin-top: 20px;
    font-style: italic;
  `;

  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(instruction);
  overlay.appendChild(content);

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);

  // Hide all page content
  document.body.innerHTML = '';
  document.body.appendChild(overlay);
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
}

/**
 * Initialize devtools blocking system
 */
export function initializeDevtoolsBlocker(customConfig?: Partial<DevtoolsConfig>): void {
  if (typeof window === 'undefined') return;

  const config: DevtoolsConfig = { ...DEFAULT_CONFIG, ...customConfig };

  if (!config.enabled) return;

  // Initial check
  if (checkDevtoolsOpen(config)) {
    blockPage(config);
    return;
  }

  // Continuous monitoring
  const monitorInterval = setInterval(() => {
    if (checkDevtoolsOpen(config)) {
      blockPage(config);
      clearInterval(monitorInterval);
      return;
    }
  }, config.checkInterval);

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(monitorInterval);
  });

  // Also check on visibility change (user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && checkDevtoolsOpen(config)) {
      blockPage(config);
      clearInterval(monitorInterval);
    }
  });

  // Prevent common bypass techniques
  Object.defineProperty(window, 'devtools', {
    get() {
      return { open: devtoolsDetected };
    },
  });

  // Override console.clear to prevent clearing logs as bypass
  const originalClear = console.clear;
  console.clear = function() {
    if (config.logDetection) {
      console.warn('Console.clear() attempted - possible bypass attempt');
    }
    // Don't actually clear in production
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    return originalClear();
  };
}

/**
 * Check if devtools is currently detected
 */
export function isDevtoolsOpen(): boolean {
  return devtoolsDetected;
}

/**
 * Disable devtools blocking (for testing)
 */
export function disableDevtoolsBlocker(): void {
  const overlay = document.getElementById('devtools-block-overlay');
  if (overlay) {
    overlay.remove();
  }
  blockingActive = false;
  devtoolsDetected = false;
}
