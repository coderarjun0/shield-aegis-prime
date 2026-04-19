import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import type { ScanState } from "@/hooks/useForensicScan";

interface Props {
  value: number; // 0-100
  state: ScanState;
}

export function ConfidenceGauge({ value, state }: Props) {
  const size = 200;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 400, damping: 28 });
  const dash = useTransform(spring, (v) => c - (v / 100) * c);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    mv.set(value);
    const u = spring.on("change", (v) => setDisplay(v));
    return () => u();
  }, [value, mv, spring]);

  const color =
    state === "FLAGGED"
      ? "var(--destructive)"
      : state === "VERIFIED"
        ? "var(--success)"
        : "var(--primary)";

  const label =
    state === "FLAGGED"
      ? "Manipulation"
      : state === "VERIFIED"
        ? "Authentic"
        : state === "SCANNING"
          ? "Analyzing"
          : "Standby";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: dash, filter: "url(#gauge-glow)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-4xl font-bold tabular-nums" style={{ color }}>
            {display.toFixed(1)}
            <span className="text-lg opacity-60">%</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
