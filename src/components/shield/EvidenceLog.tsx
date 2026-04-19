import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertOctagon, CheckCircle2, Info } from "lucide-react";
import type { EvidenceItem } from "@/hooks/useForensicScan";

const ICONS = {
  error: AlertOctagon,
  warn: AlertTriangle,
  ok: CheckCircle2,
  info: Info,
} as const;

const COLORS = {
  error: "text-destructive",
  warn: "text-warning",
  ok: "text-success",
  info: "text-primary",
} as const;

export function EvidenceLog({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-xs text-muted-foreground/60 py-6 text-center border border-dashed border-white/5 rounded-lg"
          >
            // awaiting scan_data
          </motion.div>
        ) : (
          items.map((it, i) => {
            const Icon = ICONS[it.level];
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 320, damping: 24, delay: i * 0.06 }}
                className="group flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition"
              >
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${COLORS[it.level]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                    <span>{it.timestamp}</span>
                    <span className="opacity-40">·</span>
                    <span className={COLORS[it.level]}>{it.code}</span>
                  </div>
                  <div className="text-xs text-foreground/90 mt-0.5">{it.message}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}
