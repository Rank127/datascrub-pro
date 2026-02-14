/**
 * Simple logger that suppresses debug output in production.
 * Use instead of console.log for non-critical info logging.
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  /** Debug info — suppressed in production */
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  /** Informational — always logged */
  info: (...args: unknown[]) => {
    console.log(...args);
  },
  /** Warnings — always logged */
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  /** Errors — always logged (prefer captureError for catch blocks) */
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
