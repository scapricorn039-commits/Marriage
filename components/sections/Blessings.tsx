"use client";
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fetchBlessings, submitBlessing, type PublicBlessing } from "@/lib/api-client";
import { MaskHeading } from "@/components/motion/MaskHeading";
import { DemoNote, WaxSeal } from "@/components/ui/bits";
import { HiddenHeart } from "@/components/ui/HiddenHeart";
import { P } from "@/components/art/paint";

/** The note writes itself line by line, folds into a letter and takes a seal. */
function SealedNote({ name, message, onAgain }: { name: string; message: string; onAgain: () => void }) {
  const reduced = useReducedMotion();
  const lines = message.split(/(?<=[.!?\n])\s+/).filter(Boolean).slice(0, 5);
  const [stage, setStage] = useState<"writing" | "sealed">(reduced ? "sealed" : "writing");
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setStage("sealed"), 900 + lines.length * 650);
    return () => clearTimeout(t);
  }, [lines.length, reduced]);
  return (
    <div style={{ display: "grid", gap: "1.1rem", justifyItems: "center", textAlign: "center", minHeight: 360, alignContent: "center" }} aria-live="polite">
      <AnimatePresence mode="wait">
        {stage === "writing" ? (
          <motion.div key="note" exit={{ scaleY: 0.08, opacity: 0, y: 40 }} transition={{ duration: 0.55, ease: "easeIn" }} style={{ display: "grid", gap: ".35rem", width: "100%", textAlign: "left" }}>
            {lines.map((l, i) => (
              <motion.p key={i} className="hand" initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.62, delay: i * 0.62, ease: "linear" }}>{l}</motion.p>
            ))}
            <motion.p className="hand" style={{ textAlign: "right", color: P.maroon }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: lines.length * 0.62 }}>{name}</motion.p>
          </motion.div>
        ) : (
          <motion.div key="letter" initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
            <div style={{ position: "relative", width: 150, height: 98 }}>
              <svg viewBox="0 0 300 200" aria-hidden="true" width="150" height="98">
                <rect x={1} y={1} width={298} height={198} fill={P.champagne} stroke={P.gold} />
                <path d="M1 199L150 96L299 199Z" fill={P.parchment} stroke={P.goldPale} />
                <path d="M1 1L150 122L299 1Z" fill={P.ivory} stroke={P.gold} />
              </svg>
              <motion.div style={{ position: "absolute", left: 44, top: 22 }} initial={reduced ? false : { scale: 2.1, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 280, damping: 15, delay: 0.3 }}><WaxSeal size={60} /></motion.div>
            </div>
            <p className="t-sub" style={{ color: P.maroon }} data-blessing-done>Your blessing is with the couple.</p>
            <p className="t-note" style={{ maxWidth: "34ch" }}>It joins the book here once they have read it.</p>
            <button type="button" className="btn btn-line" onClick={onAgain}>Write another blessing</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Blessings() {
  const [items, setItems] = useState<PublicBlessing[]>([]);
  const [v, set] = useState({ name: "", family: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<{ name: string; message: string } | null>(null);
  useEffect(() => { fetchBlessings().then(setItems); }, []);
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!v.name.trim()) { setErr("Please add your name."); return; }
    if (v.message.trim().length < 2) { setErr("Please write a few words for the couple."); return; }
    setBusy(true); setErr("");
    const r = await submitBlessing(v);
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    setSent({ name: v.name.trim(), message: v.message.trim() });
    set({ name: "", family: "", message: "", website: "" });
  };
  return (
    <section id="blessings" className="room">
      <div className="room-inner">
        <MaskHeading lines={["A few words from you,", "a memory for us."]} />
        <div className="book" style={{ marginTop: "clamp(2.5rem, 6vw, 4rem)" }}>
          <div className="page-side">
            <h3 className="t-small" data-perch="tr" style={{ width: "max-content" }}>The guest book</h3>
            <HiddenHeart id="book" style={{ right: "0", top: "-6px" }} />
            {items.length === 0 ? (
              <p className="hand" style={{ paddingBlock: "1rem" }}>These pages are waiting for their first blessing. Yours could be the one the couple reads first.</p>
            ) : (
              <div className="blessings-scroll" tabIndex={0} aria-label="Blessings from guests">
                {items.map((b) => (
                  <article className="blessing" key={b.id}>
                    <p className="hand">{b.message}</p>
                    <p className="t-note" style={{ marginTop: ".3rem" }}>{b.name}{b.family ? `, ${b.family}` : ""}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="page-side">
            {sent ? (
              <SealedNote name={sent.name} message={sent.message} onAgain={() => setSent(null)} />
            ) : (
              <form onSubmit={send} style={{ display: "grid", gap: "1rem" }} noValidate>
                <div className="field"><label htmlFor="b-name">Your name</label><input id="b-name" className="input" autoComplete="name" maxLength={80} value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} required /></div>
                <div className="field"><label htmlFor="b-family">Family name (optional)</label><input id="b-family" className="input" maxLength={80} value={v.family} onChange={(e) => set({ ...v, family: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-message">Your blessing</label><textarea id="b-message" className="input hand page-ruled" style={{ lineHeight: "36px", paddingBlock: 0 }} rows={5} maxLength={800} value={v.message} onChange={(e) => set({ ...v, message: e.target.value })} required /></div>
                <div className="hp" aria-hidden="true"><label htmlFor="b-website">Leave this empty</label><input id="b-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set({ ...v, website: e.target.value })} /></div>
                {err && <p className="form-error" role="alert">{err}</p>}
                <div><button type="submit" className="btn" disabled={busy}>{busy ? "Sending" : "Leave my blessing"}</button></div>
                <p className="t-note">The couple reads each blessing before it appears in the book.</p>
                <DemoNote />
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
