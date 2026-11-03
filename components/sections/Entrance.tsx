"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { wedding } from "@/config/wedding.config";
import { gsap } from "@/lib/gsap";
import { multifoil, P } from "@/components/art/paint";
import { prefersReducedMotion, scrollToRoom } from "@/lib/use-motion-ok";
import { Pic } from "@/components/art/Painted";
import { PeacockButton } from "@/components/art/Peacock";
import { Ganesha } from "@/components/art/Ganesha";
import { ButterflyMark } from "@/components/art/Butterfly";
import { HiddenHeart } from "@/components/ui/HiddenHeart";

const ARCH = multifoil(4, 696, 492, 280, 276, 6, 1);
const CLIP = multifoil(0, 1000, 1000, 400, 400, 6, 1);
const PETALS = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2);

/** Pressing Enter: Ganesha draws himself in gold and petals open around him, then the invitation appears. */
function BlessingVeil({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const moved = useRef(false);
  useEffect(() => {
    const el = root.current!, q = gsap.utils.selector(el);
    const move = () => { if (moved.current) return; moved.current = true; document.getElementById("invitation")?.scrollIntoView({ behavior: "auto" }); };
    gsap.set(q(".gl, .veil-ring"), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q(".gf, .gdot, .veil-word"), { opacity: 0 });
    tl.current = gsap.timeline({ onComplete: onDone })
      .fromTo(el, { opacity: 0 }, { opacity: 1, duration: .4, ease: "power1.out" }, 0)
      .add(move, .42)
      .to(q(".veil-ring"), { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, .25)
      .to(q(".gl"), { strokeDashoffset: 0, duration: 1.05, ease: "power1.inOut", stagger: .035 }, .4)
      .to(q(".gf"), { opacity: 1, duration: .6 }, 1.25)
      .to(q(".gdot"), { opacity: 1, duration: .3 }, 1.35)
      .fromTo(q(".veil-glow"), { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .9, ease: "power2.out" }, 1.2)
      .fromTo(q(".veil-word"), { y: 12 }, { y: 0, opacity: 1, duration: .6, ease: "power2.out" }, 1.45)
      .fromTo(q(".veil-petal"), { x: 0, y: 0, opacity: 0, scale: .4 }, {
        x: (i) => Math.cos(PETALS[i]) * (150 + (i % 3) * 34), y: (i) => Math.sin(PETALS[i]) * (150 + (i % 3) * 34), opacity: 1, scale: 1, rotation: (i) => 120 + i * 20,
        duration: 1.05, ease: "power2.out", stagger: .012,
      }, 1.3)
      .to(q(".veil-petal"), { opacity: 0, duration: .5 }, 2.35)
      .to(el, { opacity: 0, duration: .6, ease: "power1.inOut" }, 2.75);
    return () => { tl.current?.kill(); };
  }, [onDone]);
  const skip = () => { tl.current?.progress(1); };
  return createPortal(
    <div ref={root} className="veil" role="status" aria-label="Shri Ganeshaya Namah" onClick={skip} data-veil>
      <div className="veil-mark">
        <span className="veil-glow" />
        <svg className="veil-ringwrap" viewBox="0 0 200 200" aria-hidden="true"><circle className="veil-ring" cx={100} cy={100} r={96} fill="none" stroke={P.gold} strokeWidth={1} pathLength={1} /></svg>
        {PETALS.map((a, i) => <i key={a} className="veil-petal" style={{ background: i % 3 ? P.marigold : P.rose }} />)}
        <Ganesha size="62%" tint="#F6E3CF" />
      </div>
      <p className="t-deva veil-word" lang="sa">{wedding.invitation.invocation}</p>
    </div>,
    document.body,
  );
}

/** The first page: a painted haveli you can look into, with sunrise beyond its arches and Ganesha above. */
export function Entrance() {
  const root = useRef<HTMLElement>(null);
  const [veil, setVeil] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const el = root.current, q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q(".hero-back"), { yPercent: 7, ease: "none", scrollTrigger: st });
      gsap.to(q(".hero-front"), { yPercent: -2, scale: 1.05, ease: "none", scrollTrigger: st });
    }, el);
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => ctx.revert();
    const bx = gsap.quickTo(q(".hero-back")[0], "x", { duration: 1.2, ease: "power3" }), fx = gsap.quickTo(q(".hero-front")[0], "x", { duration: 1.2, ease: "power3" });
    const rx = gsap.quickTo(q(".hero-stage")[0], "rotateY", { duration: 1.2, ease: "power3" }), ry = gsap.quickTo(q(".hero-stage")[0], "rotateX", { duration: 1.2, ease: "power3" });
    const move = (e: PointerEvent) => { const v = e.clientX / innerWidth - .5, w = e.clientY / innerHeight - .5; bx(v * -22); fx(v * 12); rx(v * 5); ry(w * -3); };
    el.addEventListener("pointermove", move);
    return () => { el.removeEventListener("pointermove", move); ctx.revert(); };
  }, []);
  const enter = () => { if (prefersReducedMotion()) scrollToRoom("invitation"); else setVeil(true); };
  return (
    <section ref={root} id="entrance" className="hero" aria-label="The Royal Entrance">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs><clipPath id="hero-clip" clipPathUnits="objectBoundingBox"><path transform="scale(.001)" d={CLIP} /></clipPath></defs></svg>
      <header className="hero-title">
        <div className="hero-ganesha"><Ganesha size="100%" tint="#F6E3CF" /></div>
        <p className="t-deva hero-shloka" lang="sa">{wedding.invitation.invocation}</p>
        <h2 className="hero-name"><span className="mask-line"><span>The Royal</span></span><span className="mask-line"><span>Aangan</span></span></h2>
        <p className="t-deva hero-hi" lang="hi">{wedding.invitation.greetingHindi}</p>
      </header>
      <div className="hero-stage-wrap">
        <div className="hero-stage">
          <div className="hero-frame">
            <Pic name="hero-back" className="hero-back" lazy={false} />
            <Pic name="hero-front" className="hero-front" lazy={false} />
          </div>
          <svg className="hero-lines" viewBox="0 0 500 700" aria-hidden="true">
            <path d={ARCH} pathLength={1} fill="none" stroke={P.gold} strokeWidth={1.4} className="arch-line" />
          </svg>
          <span className="hero-perch" data-perch="tc" />
          <svg className="still-butterfly still-hero" viewBox="-50 -50 100 100" aria-hidden="true"><ButterflyMark /></svg>
          <PeacockButton className="hero-peacock" />
          <div className="hero-lamps" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <span key={i} className="diya"><i /></span>)}</div>
          <HiddenHeart id="arch" style={{ right: "3%", bottom: "-1%" }} />
        </div>
      </div>
      <div className="hero-copy">
        <p className="hero-tag">{wedding.project.tagline}</p>
        <p className="hero-note">Your invitation awaits</p>
        <button type="button" className="btn" onClick={enter} data-enter disabled={veil}>Enter Our Aangan</button>
      </div>
      {veil && <BlessingVeil onDone={() => setVeil(false)} />}
    </section>
  );
}
