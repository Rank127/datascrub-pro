/**
 * Centralized error reporting — wraps Sentry with graceful fallback.
 * Use this instead of bare console.error in catch blocks.
 */

let Sentry: typeof import("@sentry/nextjs") | null = null;

// Lazy-load Sentry to avoid import errors in edge/test environments
async function getSentry() {
  if (Sentry) return Sentry;
  try {
    Sentry = await import("@sentry/nextjs");
    return Sentry;
  } catch {
    return null;
  }
}

/**
 * Report an error to Sentry (if configured) and console.
 * Use in catch blocks instead of bare console.error.
 *
 * @param context - A short label like "[Health Check]" or "[Email]"
 * @param error - The caught error
 * @param extra - Optional extra data to attach to the Sentry event
 */
export function captureError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  console.error(`${context}`, error);

  // Fire-and-forget Sentry capture
  getSentry()
    .then((s) => {
      if (s) {
        s.captureException(error, {
          tags: { context },
          extra,
        });
      }
    })
    .catch(() => {
      // Sentry itself failed — nothing we can do
    });
}

/**
 * Synchronous version for use in page.evaluate or other contexts
 * where async is not available. Only logs to console.
 */
export function captureErrorSync(context: string, error: unknown): void {
  console.error(`${context}`, error);
}
