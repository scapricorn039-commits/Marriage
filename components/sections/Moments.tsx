"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { friendsOnly } from "@/config/friends-only";
import { MaskHeading } from "@/components/motion/MaskHeading";
import { ArchPhoto, PhotoArt, type ArchShape } from "@/components/ui/ArchPhoto";
import { S } from "@/components/ui/bits";

/* First picture is the large arch; wide ones take plain frames. */
const layout: ArchShape[] = ["multifoil", "multifoil", "plain", "plain", "multifoil", "plain", "plain"];

const Arrow = ({ flip }: { flip?: boolean }) => <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true" style={{ transform: flip ? "scaleX(-1)" : undefined }}><path d="M0 7H20M14 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;

function Lightbox({ start, onClose }: { start: number; onClose: () => void }) {
  const items = friendsOnly.gallery;
  const [[i, dir], set] = useState<[number, number]>([start, 0]);
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const go = useCallback((d: number) => set(([x]) => [(x + d + items.length) % items.length, d]), [items.length]);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("locked");
    box.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && box.current) {
        const f = box.current.querySelectorAll<HTMLElement>("button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); document.documentElement.classList.remove("locked"); before?.focus?.({ preventScroll: true }); };
  }, [go, onClose]);

  const offset = reduced ? 0 : 90;
  return (
    <motion.div ref={box} className="lightbox on-dark" role="dialog" aria-modal="true" aria-label="Photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <div className="lb-bar">
        <span aria-live="polite">{i + 1} of {items.length}</span>
        <button type="button" className="lb-btn" data-close onClick={onClose} aria-label="Close viewer"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.3" /></svg></button>
      </div>
      <div className="lb-stage">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div key={i} className="lb-slide" custom={dir}
            variants={{ enter: (d: number) => ({ x: d * offset, opacity: 0, scale: 0.97 }), center: { x: 0, opacity: 1, scale: 1 }, exit: (d: number) => ({ x: d * -offset, opacity: 0, scale: 0.97 }) }}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.55, ease: [0.3, 0.7, 0.2, 1] }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5} data-slide
            onDragEnd={(_, info) => { if (info.offset.x < -60 || info.velocity.x < -400) go(1); else if (info.offset.x > 60 || info.velocity.x > 400) go(-1); }}>
            <div className="lb-frame"><PhotoArt photo={items[i]} sizes="100vw" priority /></div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="lb-nav">
        <button type="button" className="lb-btn" onClick={() => go(-1)} aria-label="Previous photograph"><Arrow flip /></button>
        <p className="lb-caption"><S>{items[i].caption}</S></p>
        <button type="button" className="lb-btn" onClick={() => go(1)} aria-label="Next photograph"><Arrow /></button>
      </div>
    </motion.div>
  );
}

export function Moments() {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <section id="moments" className="room">
      <div className="room-inner">
        <MaskHeading lines={["A glimpse of the", "memories we've made."]} />
        <div className="gallery-box"><div className="gallery">
          {friendsOnly.gallery.map((p, i) => (
            <div key={i} className={`g${i + 1}`} {...(i === 1 ? { "data-perch": "tr" } : {})}>
              <ArchPhoto photo={p} shape={layout[i % 7]} ratio="auto" onOpen={() => setOpen(i)} sizes="(min-width: 900px) 34vw, 60vw" />
            </div>
          ))}
        </div></div>
      </div>
      {typeof document !== "undefined" && createPortal(<AnimatePresence>{open !== null && <Lightbox start={open} onClose={close} />}</AnimatePresence>, document.body)}
    </section>
  );
}
