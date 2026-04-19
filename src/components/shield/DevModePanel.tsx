import { motion } from "framer-motion";
import { Play, AlertOctagon, ShieldCheck, Power, Wrench } from "lucide-react";
import type { ScanState } from "@/hooks/useForensicScan";

interface Props {
  state: ScanState;
  onTransition: (s: ScanState) => void;
  onRunScan: (outcome: "FLAGGED" | "VERIFIED") => void;
}

const buttons: { state: ScanState; label: string; icon: typeof Power; tone: string }[] = [
  { state: "IDLE", label: "Idle", icon: Power, tone: "text-muted-foreground" },
  { state: "SCANNING", label: "Scanning", icon: Play, tone: "text-primary" },
  { state: "FLAGGED", label: "Flagged", icon: AlertOctagon, tone: "text-destructive" },
  { state: "VERIFIED", label: "Verified", icon: ShieldCheck, tone: "text-success" },
];

export function DevModePanel({ state, onTransition, onRunScan }: Props) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Dev Mode · State Switcher
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {buttons.map((b) => {
          const active = state === b.state;
          return (
            <motion.button
              key={b.state}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              onClick={() => onTransition(b.state)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition ${
                active
                  ? "border-primary/40 bg-primary/10 glow-primary"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <b.icon className={`h-3.5 w-3.5 ${active ? "text-primary" : b.tone}`} />
              <span className={active ? "text-foreground" : "text-muted-foreground"}>{b.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRunScan("FLAGGED")}
          className="rounded-xl bg-destructive/15 text-destructive text-xs font-medium py-2.5 hover:bg-destructive/25 transition"
        >
          Simulate Fake
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRunScan("VERIFIED")}
          className="rounded-xl bg-success/15 text-success text-xs font-medium py-2.5 hover:bg-success/25 transition"
        >
          Simulate Real
        </motion.button>
      </div>
    </div>
  );
}
