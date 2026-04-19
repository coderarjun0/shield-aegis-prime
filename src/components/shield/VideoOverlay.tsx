import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Maximize2, ScanLine, Activity } from "lucide-react";
import type { ScanState } from "@/hooks/useForensicScan";

interface ArtifactNode {
  id: string;
  x: number; // percent
  y: number;
  label: string;
  severity: "high" | "med";
}

const FLAGGED_NODES: ArtifactNode[] = [
  { id: "n1", x: 38, y: 32, label: "GAN edge", severity: "high" },
  { id: "n2", x: 56, y: 28, label: "Eye reflection", severity: "high" },
  { id: "n3", x: 47, y: 48, label: "Skin micro-tex", severity: "med" },
  { id: "n4", x: 62, y: 58, label: "Jaw seam", severity: "med" },
  { id: "n5", x: 41, y: 64, label: "Lip sync drift", severity: "high" },
];

interface Props {
  state: ScanState;
}

export function VideoOverlay({ state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (state === "IDLE") {
        raf = requestAnimationFrame(draw);
        t += 0.016;
        return;
      }

      const cx = w * 0.5;
      const cy = h * 0.46;

      if (state === "SCANNING") {
        const pulse = (Math.sin(t * 2.4) + 1) * 0.5;
        const r = 80 + pulse * 60;
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 2.5);
        grad.addColorStop(0, "rgba(0,163,255,0.35)");
        grad.addColorStop(0.5, "rgba(0,163,255,0.12)");
        grad.addColorStop(1, "rgba(0,163,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // sweep line
        const sy = ((Math.sin(t) + 1) * 0.5) * h;
        const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
        sg.addColorStop(0, "rgba(0,163,255,0)");
        sg.addColorStop(0.5, "rgba(0,163,255,0.5)");
        sg.addColorStop(1, "rgba(0,163,255,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, sy - 40, w, 80);
      } else if (state === "FLAGGED") {
        const pulse = (Math.sin(t * 3.2) + 1) * 0.5;
        // Radial dissolve heatmap — multiple hotspots
        const spots = [
          { x: cx, y: cy, r: 220 + pulse * 40, a: 0.5 },
          { x: w * 0.38, y: h * 0.32, r: 90 + pulse * 20, a: 0.45 },
          { x: w * 0.62, y: h * 0.58, r: 100 + pulse * 25, a: 0.4 },
        ];
        for (const s of spots) {
          const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
          g.addColorStop(0, `rgba(255,59,48,${s.a})`);
          g.addColorStop(0.45, "rgba(255,59,48,0.18)");
          g.addColorStop(1, "rgba(255,59,48,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (state === "VERIFIED") {
        // Heartbeat aura @ 70 BPM ≈ 0.857s/beat
        const beat = (Math.sin(t * Math.PI * 2 * (70 / 60)) + 1) * 0.5;
        const r = 180 + beat * 70;
        const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
        g.addColorStop(0, `rgba(0,255,194,${0.18 + beat * 0.18})`);
        g.addColorStop(0.55, "rgba(0,255,194,0.08)");
        g.addColorStop(1, "rgba(0,255,194,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [state]);

  const showArtifacts = state === "FLAGGED";
  const showVerifiedAura = state === "VERIFIED";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl glass-strong shadow-[var(--shadow-elevated)]">
      {/* Simulated video frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.22_0.04_260)] via-[oklch(0.18_0.03_250)] to-[oklch(0.14_0.02_240)]">
        <div className="absolute inset-0 neural-grid opacity-40" />
        {/* Faux portrait silhouette */}
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-56 w-44 rounded-[50%_50%_45%_45%/55%_55%_45%_45%] bg-gradient-to-b from-[oklch(0.45_0.04_40)] to-[oklch(0.32_0.03_30)] shadow-2xl">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.5_0.05_40)] blur-2xl opacity-50" />
          </div>
          <div className="mx-auto mt-2 h-28 w-56 rounded-t-[60%] bg-gradient-to-b from-[oklch(0.28_0.04_250)] to-[oklch(0.2_0.03_250)]" />
        </div>
      </div>

      {/* Heatmap canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Scanline */}
      {state === "SCANNING" && <div className="scanline absolute inset-0" />}

      {/* Crosshair / face bracket */}
      <FaceBracket state={state} />

      {/* HUD top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>CAM_01 · 4K · 29.97fps</span>
        </div>
        <StatusPill state={state} />
      </div>

      {/* Artifact nodes */}
      <AnimatePresence>
        {showArtifacts &&
          FLAGGED_NODES.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.08 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <ArtifactBead label={n.label} severity={n.severity} />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Verified badge */}
      <AnimatePresence>
        {showVerifiedAura && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 flex items-center gap-2 glow-success"
          >
            <Activity className="h-4 w-4 text-success animate-heartbeat" />
            <span className="font-mono text-xs text-success">BIOLOGICAL HARMONY · 70 BPM</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-3">
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition">
            <Play className="h-4 w-4 fill-current" />
          </button>
          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-primary/60" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">00:01:24 / 00:04:12</span>
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition">
            <ScanLine className="h-4 w-4" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FaceBracket({ state }: { state: ScanState }) {
  if (state === "IDLE") return null;
  const color =
    state === "FLAGGED"
      ? "border-destructive"
      : state === "VERIFIED"
        ? "border-success"
        : "border-primary";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 h-64 w-52 pointer-events-none"
    >
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <span
          key={corner}
          className={`absolute h-6 w-6 border-2 ${color} ${
            corner === "tl"
              ? "top-0 left-0 border-r-0 border-b-0"
              : corner === "tr"
                ? "top-0 right-0 border-l-0 border-b-0"
                : corner === "bl"
                  ? "bottom-0 left-0 border-r-0 border-t-0"
                  : "bottom-0 right-0 border-l-0 border-t-0"
          }`}
        />
      ))}
    </motion.div>
  );
}

function StatusPill({ state }: { state: ScanState }) {
  const cfg = {
    IDLE: { label: "STANDBY", color: "text-muted-foreground", dot: "bg-muted-foreground" },
    SCANNING: { label: "ANALYZING", color: "text-primary", dot: "bg-primary" },
    FLAGGED: { label: "MANIPULATION DETECTED", color: "text-destructive", dot: "bg-destructive" },
    VERIFIED: { label: "AUTHENTIC", color: "text-success", dot: "bg-success" },
  }[state];
  return (
    <div className={`glass rounded-full px-3 py-1.5 flex items-center gap-2 ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      <span className="font-mono text-[11px] tracking-[0.18em]">{cfg.label}</span>
    </div>
  );
}

function ArtifactBead({ label, severity }: { label: string; severity: "high" | "med" }) {
  const ring = severity === "high" ? "ring-destructive/50" : "ring-warning/50";
  const dot = severity === "high" ? "bg-destructive" : "bg-warning";
  return (
    <div className="group relative animate-float">
      <div className={`relative h-4 w-4 rounded-full ${dot} ring-4 ${ring} shadow-lg`}>
        <span className={`absolute inset-0 rounded-full ${dot} animate-ping opacity-60`} />
      </div>
      <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap glass rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition">
        {label}
      </div>
    </div>
  );
}
