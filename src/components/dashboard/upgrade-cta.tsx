import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const colorSchemes = {
  amber: {
    container:
      "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/40",
    iconBg: "bg-amber-500/20",
    button:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25",
  },
  purple: {
    container:
      "bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-500/30",
    iconBg: "bg-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  emerald: {
    container: "bg-slate-800/50 border-slate-700",
    iconBg: "bg-emerald-500/10",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
} as const;

interface UpgradeCtaProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  ctaText: React.ReactNode;
  ctaHref: string;
  colorScheme: keyof typeof colorSchemes;
  features?: string[];
  badge?: string;
  className?: string;
}

export function UpgradeCta({
  icon,
  title,
  description,
  ctaText,
  ctaHref,
  colorScheme,
  features,
  badge,
  className,
}: UpgradeCtaProps) {
  const scheme = colorSchemes[colorScheme];

  return (
    <div
      className={`rounded-lg border p-6 ${scheme.container} ${className || ""}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className={`p-3 rounded-xl shrink-0 ${scheme.iconBg}`}>
          {icon}
        </div>
        <div className="flex-1">
          {badge && (
            <span className="inline-block text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full mb-2">
              {badge}
            </span>
          )}
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <div className="text-slate-300 mt-1">{description}</div>
          {features && features.length > 0 && (
            <ul className="space-y-1 mt-3">
              {features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href={ctaHref} className="shrink-0">
          <Button className={scheme.button}>{ctaText}</Button>
        </Link>
      </div>
    </div>
  );
}
