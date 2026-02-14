"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-6">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
