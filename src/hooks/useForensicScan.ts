import { useCallback, useEffect, useState } from "react";

export type ScanState = "IDLE" | "SCANNING" | "FLAGGED" | "VERIFIED";

export interface DetectionMetrics {
  biologicalSignal: number;
  pixelConsistency: number;
  lightingLogic: number;
}

export interface EvidenceItem {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "ok";
  message: string;
  code: string;
}

const FLAGGED_METRICS: DetectionMetrics = {
  biologicalSignal: 18,
  pixelConsistency: 32,
  lightingLogic: 41,
};

const VERIFIED_METRICS: DetectionMetrics = {
  biologicalSignal: 99,
  pixelConsistency: 97,
  lightingLogic: 98,
};

const SCANNING_METRICS: DetectionMetrics = {
  biologicalSignal: 60,
  pixelConsistency: 55,
  lightingLogic: 62,
};

const IDLE_METRICS: DetectionMetrics = {
  biologicalSignal: 0,
  pixelConsistency: 0,
  lightingLogic: 0,
};

const FLAGGED_EVIDENCE: EvidenceItem[] = [
  { id: "e1", timestamp: "00:00:01.204", level: "error", code: "GAN_FP_07", message: "GAN fingerprint detected in frequency domain" },
  { id: "e2", timestamp: "00:00:01.418", level: "error", code: "BIO_PPG_NULL", message: "Photoplethysmographic signal absent in facial region" },
  { id: "e3", timestamp: "00:00:01.602", level: "warn", code: "EYE_REFL_MIS", message: "Corneal reflection asymmetry — left vs right eye" },
  { id: "e4", timestamp: "00:00:01.811", level: "warn", code: "TEMP_INCONS", message: "Temporal flicker on jawline boundary (47Hz)" },
  { id: "e5", timestamp: "00:00:02.005", level: "error", code: "FREQ_ART_HI", message: "High-frequency artifacts above 0.42 cycles/px" },
];

const VERIFIED_EVIDENCE: EvidenceItem[] = [
  { id: "v1", timestamp: "00:00:01.110", level: "ok", code: "BIO_PPG_OK", message: "Stable PPG pulse @ 70 BPM detected" },
  { id: "v2", timestamp: "00:00:01.302", level: "ok", code: "MICRO_EXPR", message: "Authentic micro-expression cadence" },
  { id: "v3", timestamp: "00:00:01.498", level: "ok", code: "LIGHT_COH", message: "Light coherence across geometry verified" },
  { id: "v4", timestamp: "00:00:01.701", level: "ok", code: "SENSOR_SIG", message: "Native sensor noise signature intact" },
  { id: "v5", timestamp: "00:00:01.892", level: "ok", code: "CHAIN_VRFY", message: "C2PA provenance chain verified" },
];

export function useForensicScan() {
  const [state, setState] = useState<ScanState>("IDLE");
  const [confidence, setConfidence] = useState(0);
  const [metrics, setMetrics] = useState<DetectionMetrics>(IDLE_METRICS);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  useEffect(() => {
    if (state === "IDLE") {
      setConfidence(0);
      setMetrics(IDLE_METRICS);
      setEvidence([]);
    } else if (state === "SCANNING") {
      setConfidence(0);
      setMetrics(SCANNING_METRICS);
      setEvidence([]);
    } else if (state === "FLAGGED") {
      setConfidence(87);
      setMetrics(FLAGGED_METRICS);
      setEvidence(FLAGGED_EVIDENCE);
    } else if (state === "VERIFIED") {
      setConfidence(99.8);
      setMetrics(VERIFIED_METRICS);
      setEvidence(VERIFIED_EVIDENCE);
    }
  }, [state]);

  const transition = useCallback((next: ScanState) => setState(next), []);

  const runScan = useCallback((outcome: "FLAGGED" | "VERIFIED" = "FLAGGED") => {
    setState("SCANNING");
    window.setTimeout(() => setState(outcome), 2400);
  }, []);

  return { state, confidence, metrics, evidence, transition, runScan };
}
