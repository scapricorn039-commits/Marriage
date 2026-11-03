"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { wedding } from "@/config/wedding.config";
import { rooms } from "@/lib/rooms";
import { useAudience } from "@/lib/audience";
import { scrollToRoom } from "@/lib/use-motion-ok";
import { Monogram } from "@/components/art/Monogram";
import { P } from "@/components/art/paint";
import { createMusic, type MusicEngine } from "@/lib/music";
import { useToast } from "./bits";

/** The family page leaves these two rooms out. */
const FRIENDS_ONLY = new Set(["story", "moments"]);

const MUTE_KEY = "aangan-music-muted";
const readMuted = () => { try { const v = localStorage.getItem(MUTE_KEY); return v === null ? wedding.music.startMuted : v === "1"; } catch { return wedding.music.startMuted; } };

/**
 * Sound follows the config. Browsers only allow it after a guest's first touch, click or
 * key press, so it begins at that moment. Muting is remembered for later visits.
 */
function MusicToggle() {
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const engine = useRef<MusicEngine | null>(null);
  const playing = useRef(false), mutedRef = useRef(false);
  const toast = useToast();

  useEffect(() => {
    const start = async () => {
      if (mutedRef.current || playing.current) return;
      try {
        engine.current ??= createMusic();
        const ok = await engine.current.start();
        if (ok && !mutedRef.current) { playing.current = true; setWaiting(false); off(); }
        else if (ok) engine.current.pause();
      } catch { /* the guest can still use the page in silence */ }
    };
    const onGesture = (e: Event) => { if ((e.target as Element)?.closest?.("[data-music]")) return; start(); };
    const gestures = ["pointerdown", "touchend", "keydown", "click"];
    const off = () => gestures.forEach((g) => window.removeEventListener(g, onGesture, true));
    const m = readMuted();
    mutedRef.current = m; setMuted(m);
    if (!m) { setWaiting(true); gestures.forEach((g) => window.addEventListener(g, onGesture, true)); start(); }
    /* Silence when the phone switches apps, and pick up again on return. */
    const vis = () => { if (!engine.current || !playing.current) return; if (document.hidden) engine.current.pause(); else if (!mutedRef.current) engine.current.resume(); };
    document.addEventListener("visibilitychange", vis);
    return () => { off(); document.removeEventListener("visibilitychange", vis); engine.current?.stop(); };
  }, []);

  const flip = async () => {
    const next = !muted;
    mutedRef.current = next; setMuted(next);
    try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch { /* still works for this visit */ }
    if (next) { engine.current?.pause(); playing.current = false; setWaiting(false); return; }
    try {
      engine.current ??= createMusic();
      engine.current.resume();
      const ok = await engine.current.start();
      playing.current = ok;
      if (!ok) toast("Music could not start on this device.");
    } catch { toast("Music could not start on this device."); }
  };
  return (
    <span className="music-wrap">
      {waiting && !muted && <span className="music-hint" aria-hidden="true">Music begins at your first tap</span>}
      <button type="button" className="nav-btn" aria-pressed={muted} aria-label={muted ? "Unmute music" : "Mute music"} onClick={flip} data-music data-playing={!muted}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M3 8V12H6L10 15.500V4.500L6 8Z" fill="currentColor" stroke="none" />
          {muted ? <path d="M13 8L17.500 12.500M17.500 8L13 12.500" /> : <><path className="wave" d="M12.800 8C13.800 9.200 13.800 10.800 12.800 12" /><path className="wave w2" d="M15 6C17 8.400 17 11.600 15 14" /></>}
        </svg>
      </button>
    </span>
  );
}

export function Nav() {
  const audience = useAudience();
  const list = rooms.filter((r) => audience === "friends" || !FRIENDS_ONLY.has(r.id));
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<string>("entrance");
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setNow(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
    rooms.forEach((r) => { const el = document.getElementById(r.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);
  return (
    <>
      <div className="nav-cluster">
        {wedding.music.enabled && <MusicToggle />}
        <button ref={btn} type="button" className="nav-btn" aria-expanded={open} aria-controls="room-menu" aria-label={open ? "Close the menu" : "Open the menu"} onClick={() => setOpen((v) => !v)} data-menu>
          {open ? <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.2" /></svg> : <Monogram size={38} color={P.maroon} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="room-menu" className="menu" aria-label="Rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <ul>{list.map((r, i) => <motion.li key={r.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .035, duration: .35 }}><button type="button" className="menu-item" aria-current={now === r.id} onClick={() => { setOpen(false); setTimeout(() => scrollToRoom(r.id), 40); }}>{r.label}</button></motion.li>)}</ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
