"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/config/wedding.config";

const parts = (ms: number) => ({
  DAYS: Math.floor(ms / 864e5), HOURS: Math.floor(ms / 36e5) % 24, MINUTES: Math.floor(ms / 6e4) % 60, SECONDS: Math.floor(ms / 1e3) % 60,
});

function Digit({ value }: { value: string }) {
  const reduced = useReducedMotion();
  return (
    <span className="digit">
      <AnimatePresence initial={false}>
        <motion.span key={value} initial={reduced ? false : { y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }} transition={{ duration: 0.55, ease: [0.3, 0.8, 0.3, 1] }}>{value}</motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Countdown() {
  const target = new Date(wedding.weddingDateTime).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = now === null ? null : target - now;
  const p = left === null ? null : parts(Math.max(0, left));
  return (
    <div className="count-frame" data-perch="tr">
      <div className="count" role="timer" aria-label={p ? `${p.DAYS} days, ${p.HOURS} hours and ${p.MINUTES} minutes to go` : "Countdown to the wedding"}>
        {(["DAYS", "HOURS", "MINUTES", "SECONDS"] as const).map((k) => {
          const v = p ? String(p[k]).padStart(2, "0") : "--";
          return (
            <div className="count-cell" key={k} aria-hidden="true">
              <div className="count-num">{v.split("").map((d, i) => <Digit key={i} value={d} />)}</div>
              <div className="count-label">{k}</div>
            </div>
          );
        })}
      </div>
      <p className="t-sub" style={{ fontStyle: "italic", marginTop: "1.25rem", textAlign: "center" }}>
        {left !== null && left <= 0 ? "Today, two hearts become one." : "Until two hearts become one."}
      </p>
    </div>
  );
}
