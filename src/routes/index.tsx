import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, PanelRightOpen, Activity, Cpu, Radar } from "lucide-react";
import { useForensicScan, type ScanState } from "@/hooks/useForensicScan";
import { VideoOverlay } from "@/components/shield/VideoOverlay";
import { ForensicSidebar } from "@/components/shield/ForensicSidebar";
import { DevModePanel } from "@/components/shield/DevModePanel";
import { ConfidenceGauge } from "@/components/shield/ConfidenceGauge";
import { DetectionBars } from "@/components/shield/DetectionBars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shield · Aegis Forensic Deepfake Detection" },
      {
        name: "description",
        content:
          "Shield is a real-time deepfake detection dashboard with biological signal analysis, pixel forensics and provenance verification.",
      },
      { property: "og:title", content: "Shield · Aegis Forensic" },
      { property: "og:description", content: "Cyber-forensic deepfake detection suite." },
    ],
  }),
  component: ShieldDashboard,
});

function ShieldDashboard() {
  const { state, confidence, metrics, evidence, transition, runScan } = useForensicScan();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen relative">
      <BackgroundFX />

      <div className="relative z-10 flex">
        <main
          className={`flex-1 px-6 lg:px-10 py-6 transition-all duration-500 ${
            sidebarOpen ? "lg:mr-[28rem]" : ""
          }`}
        >
          <Header state={state} onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <VideoOverlay state={state} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Activity} label="BPM Signal" value={state === "VERIFIED" ? "70" : state === "FLAGGED" ? "—" : "··"} tone={state === "VERIFIED" ? "success" : state === "FLAGGED" ? "danger" : "muted"} />
                <StatCard icon={Cpu} label="Model" value="v4.2" tone="primary" />
                <StatCard icon={Radar} label="Frames" value="7,420" tone="muted" />
                <StatCard icon={Shield} label="Provenance" value={state === "VERIFIED" ? "C2PA ✓" : "Broken"} tone={state === "VERIFIED" ? "success" : "danger"} />
              </div>
            </div>

            <div className="space-y-6">
              <DevModePanel state={state} onTransition={transition} onRunScan={runScan} />

              {/* Inline summary card (visible when sidebar closed on desktop too) */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Live Summary
                  </span>
                </div>
                <div className="grid place-items-center mb-4">
                  <ConfidenceGauge value={confidence} state={state} />
                </div>
                <DetectionBars metrics={metrics} state={state} />
              </div>
            </div>
          </div>

          <footer className="mt-10 pb-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
            <span>Aegis Forensic · Build 2026.4.19</span>
            <span>Edge inference · 1.84s avg</span>
          </footer>
        </main>

        <ForensicSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          state={state}
          confidence={confidence}
          metrics={metrics}
          evidence={evidence}
        />
      </div>
    </div>
  );
}

function Header({
  state,
  onToggleSidebar,
  sidebarOpen,
}: {
  state: ScanState;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const stateColor =
    state === "FLAGGED"
      ? "bg-destructive"
      : state === "VERIFIED"
        ? "bg-success"
        : state === "SCANNING"
          ? "bg-primary"
          : "bg-muted-foreground";

  return (
    <div className="flex items-center justify-between glass rounded-2xl px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.6_0.2_280)] glow-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background animate-pulse-slow bg-success" />
        </div>
        <div>
          <h1 className="font-display text-lg leading-tight">
            Shield <span className="text-muted-foreground font-normal">/ Aegis Forensic</span>
          </h1>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className={`h-1 w-1 rounded-full ${stateColor}`} />
            <span>State · {state}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        onClick={onToggleSidebar}
        className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
      >
        <PanelRightOpen className={`h-3.5 w-3.5 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
        <span>{sidebarOpen ? "Hide" : "Show"} report</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        onClick={onToggleSidebar}
        className="lg:hidden rounded-xl border border-white/10 bg-white/5 p-2"
      >
        <PanelRightOpen className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  tone: "primary" | "success" | "danger" | "muted";
}) {
  const colorMap = {
    primary: "text-primary",
    success: "text-success",
    danger: "text-destructive",
    muted: "text-muted-foreground",
  } as const;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="glass rounded-xl px-4 py-3"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className={`h-3 w-3 ${colorMap[tone]}`} />
        <span>{label}</span>
      </div>
      <div className={`mt-1 font-display text-xl ${colorMap[tone]}`}>{value}</div>
    </motion.div>
  );
}

function BackgroundFX() {
  return (
    <>
      <div className="fixed inset-0 neural-grid opacity-[0.35] pointer-events-none" />
      <div className="fixed -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[oklch(0.6_0.2_280)]/15 blur-3xl pointer-events-none" />
    </>
  );
}
