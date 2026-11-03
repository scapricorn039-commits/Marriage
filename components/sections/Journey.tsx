"use client";
import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding.config";
import { gsap } from "@/lib/gsap";
import { artUrl } from "@/lib/art-url";
import { prefersReducedMotion } from "@/lib/use-motion-ok";
import { HiddenHeart } from "@/components/ui/HiddenHeart";
import { P } from "@/components/art/paint";

const W = 1760, H = 792;
const pctX = (v: number) => `${(v / W) * 100}%`;
const pctY = (v: number) => `${(v / H) * 100}%`;

function WheelSvg({ spokes = 8, tyre = "#2F231D", hub = P.gold, rim = "#D8CFC4" }: { spokes?: number; tyre?: string; hub?: string; rim?: string }) {
  return (
    <svg viewBox="-20 -20 40 40" className="wheel" aria-hidden="true">
      <circle r={19} fill={tyre} /><circle r={12.5} fill={rim} />
      {Array.from({ length: spokes }, (_, i) => <path key={i} transform={`rotate(${(i * 360) / spokes})`} d="M0 0V-12" stroke={tyre} strokeWidth={1.3} />)}
      <circle r={3.6} fill={hub} stroke={tyre} strokeWidth={0.8} />
    </svg>
  );
}

/* A vehicle: painted body on a soft suspension, live wheels and a ground shadow. Positions are in world units. */
function Vehicle({ name, x, ground, w, h, wheels, scale = 1, flip, cls = "", children }: { name: string; x: number; ground: number; w: number; h: number; wheels: [number, number, number][]; scale?: number; flip?: boolean; cls?: string; children?: React.ReactNode }) {
  const sw = w * scale, sh = h * scale;
  return (
    <div className={`veh ${cls}`} data-flip={flip || undefined} style={{ left: pctX(x), top: pctY(ground - sh), width: pctX(sw), height: pctY(sh) }}>
      <span className="veh-shadow" />
      {wheels.map(([cx, cy, r], i) => <span key={i} className="veh-wheel" style={{ left: `${((cx - r) / w) * 100}%`, top: `${((cy - r) / h) * 100}%`, width: `${((r * 2) / w) * 100}%`, height: `${((r * 2) / h) * 100}%` }}><WheelSvg spokes={r > 18 ? 10 : 8} /></span>)}
      <span className="veh-body"><img src={artUrl(`v-${name}`)} alt="" loading="lazy" decoding="async" draggable={false} /></span>
      {children}
    </div>
  );
}

type Mode = "train" | "air" | "road";
const tabs: { id: Mode; label: string }[] = [{ id: "train", label: "By train" }, { id: "air", label: "By air" }, { id: "road", label: "By road" }];

/**
 * The road to Kota. Everything moves on its own layer and only ever changes transforms,
 * so the phone's graphics chip does the work. It rests when off screen.
 */
export function Journey() {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("train");
  const tw = useRef<Partial<Record<"train" | "plane" | "convoy" | "traffic" | "camel" | "boat" | "clouds", gsap.core.Tween>>>({});
  const [dim, setDim] = useState(false);
  const dimT = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      tw.current.train = gsap.fromTo(q(".lane-train"), { xPercent: 104 }, { xPercent: -100, duration: 21, ease: "none", repeat: -1, repeatDelay: 2.5 });
      tw.current.plane = gsap.fromTo(q(".lane-plane"), { xPercent: -24, yPercent: 3 }, { xPercent: 112, yPercent: -7, duration: 30, ease: "none", repeat: -1, repeatDelay: 4 });
      tw.current.convoy = gsap.fromTo(q(".lane-convoy"), { xPercent: -48 }, { xPercent: 104, duration: 15, ease: "none", repeat: -1, repeatDelay: 1.5 });
      tw.current.traffic = gsap.fromTo(q(".lane-traffic"), { xPercent: 100 }, { xPercent: -78, duration: 19, ease: "none", repeat: -1, repeatDelay: 1 });
      tw.current.camel = gsap.fromTo(q(".lane-camel"), { xPercent: -28 }, { xPercent: 104, duration: 52, ease: "none", repeat: -1 });
      tw.current.boat = gsap.fromTo(q(".lane-boat"), { xPercent: 14 }, { xPercent: 62, duration: 58, ease: "sine.inOut", yoyo: true, repeat: -1 });
      tw.current.clouds = gsap.fromTo(q(".lane-clouds"), { xPercent: -14 }, { xPercent: 22, duration: 90, ease: "none", yoyo: true, repeat: -1 });
      /* Depth: nearer layers slide further as the guest scrolls past. */
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: .5 };
      gsap.fromTo(q(".j-back"), { x: "-1.2%" }, { x: "1.2%", ease: "none", scrollTrigger: st });
      gsap.fromTo(q(".j-front"), { x: "-3%" }, { x: "3%", ease: "none", scrollTrigger: st });
    }, el);

    /* Traffic hurries when the guest scrolls fast, then settles. Everything rests off screen. */
    let boost = 0, last = window.scrollY, seen = false;
    const tick = () => {
      if (!seen) return;
      const y = window.scrollY, v = Math.abs(y - last); last = y;
      boost += (Math.min(3, v * .05) - boost) * .08;
      Object.values(tw.current).forEach((t) => t?.timeScale(1 + boost));
      el.style.setProperty("--spin", String(1 + boost));
    };
    gsap.ticker.add(tick);
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting; el.dataset.live = String(seen);
      Object.values(tw.current).forEach((t) => (seen ? t?.play() : t?.pause()));
    }, { rootMargin: "120px" });
    io.observe(el);
    return () => { gsap.ticker.remove(tick); io.disconnect(); ctx.revert(); };
  }, []);

  /* Choosing a way to travel sends that vehicle in straight away and quiets the rest. */
  const choose = (m: Mode) => {
    setMode(m); setDim(true); clearTimeout(dimT.current); dimT.current = setTimeout(() => setDim(false), 5200);
    if (prefersReducedMotion()) return;
    if (m === "train") tw.current.train?.seek(1.2);
    if (m === "air") tw.current.plane?.seek(2.5);
    if (m === "road") tw.current.convoy?.seek(1);
  };
  const text = mode === "train" ? wedding.destination.rail : mode === "air" ? wedding.destination.air : wedding.destination.road;

  return (
    <div className="journey">
      <div className="journey-stage" ref={root} data-focus={dim ? mode : "none"} data-live="true" data-perch="tr" role="img" aria-label="A painted view of Kota with Kota Garh and the Chambal river. A train crosses a viaduct, a plane passes overhead, and a garlanded wedding car, a family van, an auto-rickshaw, a scooter and a camel cart travel along the road.">
        <div className="world">
          <img className="j-layer j-back" src={artUrl("journey-back")} alt="" loading="lazy" decoding="async" />
          <div className="lane lane-clouds">
            {[[120, 60, 300, .9], [640, 110, 230, .7], [1240, 50, 270, .8]].map(([x, y, w, o], i) => <svg key={i} className="j-cloud" viewBox="-130 -40 260 70" style={{ left: pctX(x), top: pctY(y), width: pctX(w), opacity: o }}><path d="M-120 12C-96 -14 -64 -10 -50 0C-30 -30 20 -28 34 0C60 -10 96 -4 116 14C50 26 -60 26 -120 12Z" /></svg>)}
          </div>
          <div className="lane lane-plane" data-group="air" style={{ transform: "translateX(40%)" }}>
            <div className="veh" style={{ left: 0, top: pctY(70), width: pctX(170), height: pctY(59) }}>
              <span className="contrail" /><span className="veh-body"><img src={artUrl("v-plane")} alt="" loading="lazy" decoding="async" /></span>
            </div>
          </div>
          <div className="lane lane-boat" style={{ transform: "translateX(30%)" }}>
            <svg className="boat" viewBox="-70 -60 140 80" style={{ left: 0, top: pctY(440), width: pctX(120) }} aria-hidden="true">
              <path d="M-62 0C-34 18 34 18 62 0C44 4 -44 4 -62 0Z" fill={P.maroon} /><path d="M-22 4V-22H22V4" fill="none" stroke={P.maroon} strokeWidth={2.4} /><path d="M-28 -22C-14 -38 14 -38 28 -22Z" fill={P.marigold} stroke={P.goldDeep} />
            </svg>
          </div>
          <div className="lane lane-train" data-group="train" style={{ transform: "translateX(5%)" }}>
            <div className="veh" style={{ left: 0, top: pctY(370 - 88 * .98), width: pctX(245), height: pctY(88 * .98) }}><span className="veh-body flip"><img src={artUrl("v-loco")} alt="" loading="lazy" decoding="async" /></span><span className="headlight" /></div>
            {["a", "b", "a", "b", "a"].map((c, i) => <div key={i} className="veh" style={{ left: pctX(245 + i * 296), top: pctY(370 - 88 * .98), width: pctX(298), height: pctY(88 * .98) }}><span className="veh-body sway" style={{ animationDelay: `${i * -.5}s` }}><img src={artUrl(`v-coach-${c}`)} alt="" loading="lazy" decoding="async" /></span></div>)}
          </div>
          <div className="lane lane-traffic" data-group="road" style={{ transform: "translateX(25%)" }}>
            <Vehicle name="auto" x={0} ground={630} w={180} h={126} scale={.82} flip wheels={[[50, 96, 13], [146, 96, 13]]}><span className="puff" /><span className="puff p2" /></Vehicle>
            <Vehicle name="scooter" x={290} ground={632} w={160} h={140} scale={.74} flip wheels={[[44, 116, 11], [130, 116, 11]]} />
            <Vehicle name="scooter" x={600} ground={630} w={160} h={140} scale={.7} flip cls="tint" wheels={[[44, 116, 11], [130, 116, 11]]} />
          </div>
          <div className="lane lane-camel" style={{ transform: "translateX(60%)" }}>
            <Vehicle name="camel" x={0} ground={634} w={360} h={190} scale={.78} wheels={[[80, 130, 23]]}>
              {[[218, 0], [236, 1], [272, 1], [286, 0]].map(([lx, b], i) => <span key={i} className={`leg ${b ? "leg-b" : ""}`} style={{ left: `${(lx / 360) * 100}%`, top: `${(126 / 190) * 100}%` }} />)}
            </Vehicle>
          </div>
          <div className="lane lane-convoy" data-group="road" style={{ transform: "translateX(20%)" }}>
            <Vehicle name="van" x={40} ground={700} w={300} h={130} wheels={[[70, 106, 21], [236, 106, 21]]} />
            <Vehicle name="car" x={420} ground={702} w={280} h={110} wheels={[[66, 84, 20], [216, 84, 20]]}><span className="ribbon-tail" /></Vehicle>
          </div>
          <img className="j-layer j-front" src={artUrl("journey-front")} alt="" loading="lazy" decoding="async" />
          <svg className="j-labels j-front" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <text x={610} y={696} textAnchor="middle" fontFamily="'DM Sans Variable','DM Sans',sans-serif" fontSize={13} fontWeight={700} fill={P.brown}>KOTA</text>
            <text x={610} y={728} textAnchor="middle" fontFamily="'DM Sans Variable','DM Sans',sans-serif" fontSize={22} fontWeight={600} fill={P.brown}>0</text>
            <text x={610} y={748} textAnchor="middle" fontFamily="'DM Sans Variable','DM Sans',sans-serif" fontSize={11} fill={P.brown}>km</text>
          </svg>
          <HiddenHeart id="lake" style={{ left: "27%", top: "56%" }} />
        </div>
      </div>
      <div className="journey-bar">
        <div className="journey-tabs" role="tablist" aria-label="How to reach Kota">
          {tabs.map((t) => <button key={t.id} type="button" role="tab" aria-selected={mode === t.id} className="journey-tab" onClick={() => choose(t.id)} data-way={t.id}>{t.label}</button>)}
        </div>
        <p className="journey-text" aria-live="polite" data-way-text>{text}</p>
      </div>
    </div>
  );
}
