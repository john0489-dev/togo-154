import { Lock, Sparkles } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";

interface Props {
  featureName: string;
  /** Visual style: 'inline' = small chip, 'button' = standalone tappable button */
  variant?: "inline" | "button";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Renders a Pro-locked indicator. When the user is Free, clicking opens the upgrade modal.
 * When the user is Pro, renders `children` (or nothing) — i.e. behaves transparently.
 */
export function ProLockBadge({ featureName, variant = "inline", className = "", children }: Props) {
  const { plan } = usePlan();
  const { open } = useUpgradeModal();

  if (plan === "pro") return <>{children}</>;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => open({ reason: "feature", featureName })}
        className={`flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 active:bg-amber-100 transition-colors dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-700/40 ${className}`}
        aria-label={`${featureName} (recurso Pro)`}
      >
        <Sparkles size={12} className="text-amber-600 dark:text-amber-400" fill="currentColor" />
        <span>{featureName}</span>
        <Lock size={11} className="opacity-70" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open({ reason: "feature", featureName })}
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 active:bg-amber-200 transition-colors dark:bg-amber-900/40 dark:text-amber-200 ${className}`}
      aria-label={`${featureName} (recurso Pro)`}
    >
      <Sparkles size={9} fill="currentColor" />
      Pro
      <Lock size={9} className="opacity-70" />
    </button>
  );
}
