import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: string;
  effectivePlan?: string;
  variant?: "filled" | "outline";
  className?: string;
}

const filledColors: Record<string, string> = {
  FREE: "bg-slate-500/20 text-slate-400",
  PRO: "bg-blue-500/20 text-blue-400",
  ENTERPRISE: "bg-emerald-500/20 text-emerald-400",
};

const outlineColors: Record<string, string> = {
  FREE: "border-slate-600 text-slate-400",
  PRO: "border-blue-500/50 text-blue-400 bg-blue-500/10",
  ENTERPRISE: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
};

export function PlanBadge({
  plan,
  effectivePlan,
  variant = "filled",
  className,
}: PlanBadgeProps) {
  const resolvedPlan = effectivePlan || plan;
  const colors = variant === "outline" ? outlineColors : filledColors;
  const colorClass = colors[resolvedPlan] || colors.FREE;

  return (
    <Badge
      variant={variant === "outline" ? "outline" : "default"}
      className={cn(colorClass, className)}
    >
      {resolvedPlan}
    </Badge>
  );
}
