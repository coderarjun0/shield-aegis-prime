import { motion } from "framer-motion";
import { Heart, Grid3x3, Sun } from "lucide-react";
import type { DetectionMetrics, ScanState } from "@/hooks/useForensicScan";

interface Props {
  metrics: DetectionMetrics;
  state: ScanState;
}

export function DetectionBars({ metrics, state }: Props) {
  const items = [
    { key: "biologicalSignal", label: "Biological Signal", value: metrics.biologicalSignal, icon: Heart },
    { key: "pixelConsistency", label: "Pixel Consistency", value: metrics.pixelConsistency, icon: Grid3x3 },
    { key: "lightingLogic", label: "Lighting Logic", value: metrics.lightingLogic, icon: Sun },
  ] as const;

  const tone = (v: number) => {
    if (state === "VERIFIED" || v >= 75) return "var(--success)";
    if (state === "FLAGGED" || v < 50) return "var(--destructive)";
    return "var(--primary)";
  };

  return (
    <div className="space-y-4">
      {items.map((it, i) => {
        const c = tone(it.value);
        return (
          <div key={it.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <it.icon className="h-3.5 w-3.5" style={{ color: c }} />
                <span>{it.label}</span>
              </div>
              <span className="font-mono text-xs tabular-nums" style={{ color: c }}>
                {Math.round(it.value)}%
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, ${c}, color-mix(in oklab, ${c} 50%, transparent))` }}
                initial={{ width: 0 }}
                animate={{ width: `${it.value}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.08 }}
              />
              <div
                className="absolute inset-y-0 w-12 opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.25), transparent)",
                  animation: "shimmer 2s linear infinite",
                  backgroundSize: "200% 100%",
                  left: `calc(${it.value}% - 3rem)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
