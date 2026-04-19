import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Hash } from "lucide-react";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { DetectionBars } from "./DetectionBars";
import { EvidenceLog } from "./EvidenceLog";
import type { DetectionMetrics, EvidenceItem, ScanState } from "@/hooks/useForensicScan";

interface Props {
  open: boolean;
  onClose: () => void;
  state: ScanState;
  confidence: number;
  metrics: DetectionMetrics;
  evidence: EvidenceItem[];
}

export function ForensicSidebar({ open, onClose, state, confidence, metrics, evidence }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass-strong border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm tracking-wider uppercase">Forensic Report</h2>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Gauge */}
              <div className="grid place-items-center py-2">
                <ConfidenceGauge value={confidence} state={state} />
              </div>

              {/* Sample meta */}
              <div className="grid grid-cols-2 gap-3">
                <Meta label="Sample" value="vid_8e1a47.mp4" mono />
                <Meta label="Model" value="Aegis v4.2" />
                <Meta label="Frames" value="7,420" />
                <Meta label="Latency" value="1.84s" />
              </div>

              {/* Detection bars */}
              <Section title="Detection Layers">
                <DetectionBars metrics={metrics} state={state} />
              </Section>

              {/* Evidence */}
              <Section
                title="Evidence Log"
                trailing={
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {evidence.length} entries
                  </span>
                }
              >
                <EvidenceLog items={evidence} />
              </Section>

              {/* Provenance hash */}
              <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  sha256:9f3a..d7b2 · C2PA chain {state === "VERIFIED" ? "valid" : "broken"}
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </h3>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`text-xs mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
