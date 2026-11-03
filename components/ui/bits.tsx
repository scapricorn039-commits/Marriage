"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isPreview } from "@/config/wedding.config";
import { DEMO } from "@/lib/api-client";
import { downloadIcs, googleCalendarUrl, type CalItem } from "@/lib/calendar";
import { P } from "@/components/art/paint";
import { ButterflyMark } from "@/components/art/Butterfly";

/** Marks text as sample content in preview mode. In live mode it renders as plain text. */
export function S({ children }: { children: ReactNode }) {
  if (!isPreview()) return <>{children}</>;
  return <span className="sample" title="Sample: edit in config/wedding.config.ts">{children}</span>;
}

type ToastFn = (message: string) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastHost({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback<ToastFn>((m) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(null), 3400); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite">
        <AnimatePresence>
          {msg && <motion.div className="toast" initial={{ opacity: 0, y: 14, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 8, x: "-50%" }} transition={{ duration: 0.3 }}>{msg}</motion.div>}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/** Add-to-calendar button. Offers Google Calendar plus a file for Apple and Outlook. */
export function CalendarButton({ item, label, variant = "btn" }: { item: CalItem; label: string; variant?: "btn" | "btn btn-line" | "btn btn-gold" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  if (DEMO) return <a className={variant} href={googleCalendarUrl(item)} target="_blank" rel="noreferrer">{label}</a>;
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className={variant} aria-expanded={open} onClick={() => setOpen((v) => !v)}>{label}</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ position: "absolute", zIndex: 20, bottom: "calc(100% + 6px)", left: 0, background: P.ivory, color: P.brown, border: `1px solid ${P.gold}`, width: 210, display: "grid", boxShadow: "0 14px 30px -14px #2f231d80" }}>
            <a className="cal-opt" href={googleCalendarUrl(item)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} style={{ padding: ".7rem .9rem", minHeight: 44, color: "inherit" }}>Google Calendar</a>
            <button type="button" className="cal-opt" onClick={() => { downloadIcs(item); setOpen(false); }} style={{ padding: ".7rem .9rem", minHeight: 44, textAlign: "left", background: "none", border: 0, borderTop: `1px solid ${P.goldPale}`, color: "inherit" }}>Apple or Outlook</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const DemoNote = () => DEMO ? <p className="t-note">In this preview, entries stay in this browser. The live site saves them securely.</p> : null;

export function WaxSeal({ size = 96 }: { size?: number }) {
  return <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true"><ButterflyMark /></svg>;
}
