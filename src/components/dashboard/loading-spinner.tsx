import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({
  className = "flex items-center justify-center py-12",
}: LoadingSpinnerProps) {
  return (
    <div className={className}>
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );
}
