"use client";
import { useEffect, useRef, useState } from "react";
import { visibleEvents, wedding, type EventIllustration, type WeddingEvent } from "@/config/wedding.config";
import { directionsUrl, fmtDay, fmtTime } from "@/lib/calendar";
import { CalendarButton, S } from "@/components/ui/bits";
import { Pic } from "@/components/art/Painted";
import { prefersReducedMotion } from "@/lib/use-motion-ok";
import { MaskHeading } from "@/components/motion/MaskHeading";

const glyphs: Record<EventIllustration, string> = {
  haldi: "M6 18H34C34 28 28 34 20 34C12 34 6 28 6 18ZM14 14C10 10 12 6 16 4C20 7 20 11 16 14M24 14C22 10 24 6 28 5C31 9 30 12 26 14",
  mehendi: "M21 5C31 8 35 18 30 26C25 34 12 33 10 24C8 17 16 12 21 16C25 19 22 25 18 24",
  sangeet: "M20 4V20M14 28A8 8 0 1 0 26 28A8 8 0 1 0 14 28M16 8H24M16 12H24",
  wedding: "M20 5C26 12 30 17 28 24C27 29 13 29 12 24C10 17 14 12 20 5ZM8 30H32L34 36H6Z",
  reception: "M20 3V9M13 14C13 10 27 10 27 14L30 30C24 36 16 36 10 30ZM14 22H26",
};

function Row({ e, open, onPick }: { e: WeddingEvent; open: boolean; onPick: () => void }) {
  return (
    <article className="row" data-open={open} data-event={e.id}>
      <span className="row-thread" aria-hidden="true" />
      <button type="button" className="row-head" aria-expanded={open} aria-controls={`event-${e.id}`} onClick={onPick}>
        <svg viewBox="0 0 40 40" className="row-glyph" aria-hidden="true"><path d={glyphs[e.illustration]} /></svg>
        <span className="row-name">{e.name}</span>
        <span className="row-when"><S>{fmtDay(e.start).split(",").slice(-1)[0].trim()}</S></span>
      </button>
      <div className="row-more" id={`event-${e.id}`}>
        <div>
          <div className="row-detail">
            <div className="row-art"><Pic name={`event-${e.illustration}`} /></div>
            <p className="row-desc">{e.description}</p>
            <dl className="row-facts">
              <dt>Date</dt><dd><S>{fmtDay(e.start)}</S></dd>
              <dt>Starts</dt><dd><S>{fmtTime(e.start)} IST</S></dd>
              <dt>Venue</dt><dd><S>{e.venue}</S>, <S>{e.address}</S></dd>
              {e.dressCode && <><dt>Dress</dt><dd><S>{e.dressCode}</S></dd></>}
            </dl>
            <div className="actions row-actions">
              <CalendarButton variant="btn btn-line" label="Add to calendar" item={{ title: `${e.name}: ${wedding.couple.bride.name} & ${wedding.couple.groom.name}`, start: e.start, end: e.end, location: `${e.venue}, ${e.address}`, details: e.description }} />
              <a className="btn btn-line" href={directionsUrl(e.mapsQuery)} target="_blank" rel="noreferrer">Get directions</a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

const DENSITIES = 4;

/**
 * The list stays on screen while scrolling opens each function in turn.
 * It measures the real content and shrinks the picture and spacing step by step until the
 * largest function fits, so there is never a scrollbar inside the list. If even the
 * smallest step cannot fit (a very short screen, very long venue text), every function
 * simply stays open in the normal flow of the page.
 */
export function Celebrations() {
  const events = visibleEvents();
  const track = useRef<HTMLDivElement>(null), pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [flow, setFlow] = useState(false);
  const count = events.length;

  useEffect(() => {
    const el = track.current, p = pin.current;
    if (!el || !p || !count) return;
    let raf = 0, cur = -1;
    const fits = () => {
      const cs = getComputedStyle(p);
      const room = p.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const head = p.querySelector<HTMLElement>(".cele-head")?.offsetHeight ?? 0;
      const rows = Array.from(p.querySelectorAll<HTMLElement>(".row-head")).reduce((a, r) => a + r.offsetHeight + 1, 0);
      const tallest = Math.max(...Array.from(p.querySelectorAll<HTMLElement>(".row-detail")).map((d) => d.offsetHeight));
      return head + rows + tallest + 2 <= room;
    };
    const measure = () => {
      el.dataset.flow = "false";
      let ok = false;
      if (!prefersReducedMotion()) for (let d = 0; d < DENSITIES; d++) { p.dataset.density = String(d); if (fits()) { ok = true; break; } }
      if (!ok) { p.dataset.density = "0"; el.dataset.flow = "true"; }
      setFlow(!ok);
    };
    const update = () => {
      raf = 0;
      if (el.dataset.flow === "true") return;
      const r = el.getBoundingClientRect(), span = Math.max(1, r.height - window.innerHeight);
      const prog = Math.min(.9999, Math.max(0, -r.top / span)), at = prog * count, i = Math.floor(at);
      if (i !== cur) { cur = i; setActive(i); }
      p.style.setProperty("--stage", (at - i).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => { measure(); update(); };
    onResize();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); if (raf) cancelAnimationFrame(raf); };
  }, [count]);

  const pick = (i: number) => {
    const el = track.current;
    if (!el || flow) return;
    const r = el.getBoundingClientRect(), span = r.height - window.innerHeight;
    window.scrollTo({ top: r.top + window.scrollY + ((i + .3) / count) * span, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section id="celebrations" className="cele">
      {count === 0
        ? <div className="room"><div className="room-inner"><MaskHeading lines={["A few days.", "A lifetime of memories."]} /><p className="t-sub" style={{ marginTop: "2rem" }}>The functions will be announced here soon.</p></div></div>
        : (
          <div ref={track} className="cele-track" data-perch="tc" data-perch-dy="84" data-flow="false" style={{ "--count": count } as React.CSSProperties}>
            <div ref={pin} className="cele-pin" data-density="0">
              <div className="room-inner">
                <div className="cele-head"><MaskHeading lines={["A few days.", "A lifetime of memories."]} /></div>
                <div className="rows">{events.map((e, i) => <Row key={e.id} e={e} open={flow || active === i} onPick={() => pick(i)} />)}</div>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}
