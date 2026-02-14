"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-slate-400 mb-6">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
