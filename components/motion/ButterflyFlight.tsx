"use client";
import { useEffect, useRef } from "react";
import { P } from "@/components/art/paint";
import { ButterflyMark } from "@/components/art/Butterfly";
import { prefersReducedMotion } from "@/lib/use-motion-ok";

type Pt = { x: number; y: number };
type Seg = { el: SVGPathElement; len: number; from: number; to: number; ys: number[] };

/**
 * THE FLIGHT PATH
 *
 * Stops are declared on the page, not here. Any element with data-perch becomes one:
 *   data-perch="tl | tc | tr"  lands above that element's top left, centre or right
 *   data-perch-dy="64"         moves the landing point down by that many pixels
 *
 * Between stops the butterfly follows gentle S-curves. One smooth curve runs through every
 * stop and through waypoints that swing from side to side, so the line never kinks at a
 * stop, never runs straight and never leaves the safe band in the middle of the page.
 * On a page with fewer sections the same stops rule simply gives a shorter flight.
 */
const FOCUS = 0.44;      /* where a stop sits on screen, from the top, when the butterfly lands */
const BAND = 0.14;       /* share of the page width kept clear on each side */
const HALF_WAVE = 0.46;  /* distance between swings, in screen heights */
const SWING = 0.34;      /* how far a swing reaches from the centre, as a share of the width */
const REST = 90;         /* pixels of scrolling the butterfly stays put at each stop */
const SWINGS = [1, 0.82, 0.93];
const SAMPLES = 48;

/** Scroll to flight: rests near both stops and glides without a sudden start in between. */
const glide = (t: number, span: number) => {
  const pad = Math.min(0.25, REST / Math.max(1, span)), c = Math.min(1, Math.max(0, (t - pad) / (1 - 2 * pad)));
  return c * c * (3 - 2 * c) * 0.35 + c * 0.65;
};

/**
 * How far along a stretch of path the butterfly must be to have come down this share of its height.
 * Going by height, not distance, keeps it on screen while it sweeps across a wide page.
 */
const along = (sg: Seg, share: number) => {
  const { ys } = sg, want = ys[0] + (ys[SAMPLES] - ys[0]) * share;
  let lo = 0, hi = SAMPLES;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ys[m] <= want) lo = m; else hi = m; }
  const span = ys[hi] - ys[lo];
  return (lo + (span > 0 ? (want - ys[lo]) / span : 0)) / SAMPLES;
};

/** Where the butterfly lands on an element. */
function stopPoint(el: Element, origin: DOMRect, width: number): Pt {
  const r = el.getBoundingClientRect(), d = (el as HTMLElement).dataset, inset = Math.min(12, r.width * 0.2);
  const x = d.perch === "tl" ? r.left + inset : d.perch === "tc" ? r.left + r.width / 2 : r.right - inset;
  const point = r.width < 4; /* a marker placed exactly where the butterfly should sit */
  const edge = Math.max(44, width * BAND);
  return { x: Math.min(width - edge, Math.max(edge, x - origin.left)), y: r.top - origin.top - (point ? 0 : 20) + Number(d.perchDy ?? 0) };
}

/** Adds side-to-side waypoints between each pair of stops. Returns the points and which are stops. */
function route(stops: Pt[], width: number, vh: number) {
  const centre = width / 2, reach = Math.min(width * SWING, vh * 0.42), spacing = vh * HALF_WAVE;
  const pts: Pt[] = [stops[0]], at = [0];
  let side = stops[0].x > centre ? -1 : 1, count = 0;
  stops.slice(1).forEach((b, i) => {
    const a = stops[i], dy = b.y - a.y;
    if (dy >= 140) {
      const off = (p: Pt) => (Math.abs(p.x - centre) < width * 0.1 ? 0 : Math.sign(p.x - centre));
      if (off(a)) side = -off(a);
      let n = Math.max(1, Math.round(dy / spacing) - 1);
      /* The last swing should lean away from the next stop, so it arrives on a curve. */
      if (off(b) && (n % 2 ? side : -side) === off(b)) n += dy / (n + 2) > spacing * 0.6 ? 1 : n > 1 ? -1 : 0;
      const step = dy / (n + 1);
      for (let k = 1; k <= n; k++, count++) {
        const size = Math.min(reach, step * 1.15) * SWINGS[count % 3];
        pts.push({ x: centre + side * size, y: a.y + step * k + step * 0.06 * Math.sin(count * 2.4) });
        side = -side;
      }
    }
    pts.push(b); at.push(pts.length - 1);
  });
  return { pts, at };
}

/** One smooth curve through all points, cut at the stops. Stays inside the band and always flies down the page. */
function spline(pts: Pt[], at: number[], width: number): string[] {
  const edge = Math.max(30, width * 0.1);
  const dir = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { x: dx / l, y: dy / l };
  });
  /* A handle follows the tangent, shortened if needed so it cannot leave the box. Shortening keeps the join smooth. */
  const handle = (p: Pt, d: Pt, len: number, lowY: number, highY: number): Pt => {
    let s = len;
    const x = p.x + d.x * s; if (x < edge) s = (edge - p.x) / d.x; else if (x > width - edge) s = (width - edge - p.x) / d.x;
    const y = p.y + d.y * s; if (y < lowY) s = (lowY - p.y) / d.y; else if (y > highY) s = (highY - p.y) / d.y;
    s = Math.max(0, Math.abs(s));
    const sign = len < 0 ? -1 : 1;
    return { x: p.x + d.x * s * sign, y: p.y + d.y * s * sign };
  };
  return at.slice(1).map((end, i) => {
    let d = `M${pts[at[i]].x.toFixed(1)} ${pts[at[i]].y.toFixed(1)}`;
    for (let k = at[i]; k < end; k++) {
      const a = pts[k], b = pts[k + 1], c = Math.hypot(b.x - a.x, b.y - a.y) / 3;
      const h1 = handle(a, dir[k], c, a.y, b.y), h2 = handle(b, dir[k + 1], -c, a.y, b.y);
      d += `C${h1.x.toFixed(1)} ${h1.y.toFixed(1)} ${h2.x.toFixed(1)} ${h2.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    return d;
  });
}

/**
 * The one moving element of this edition. Scroll position decides how far along the
 * path the butterfly has flown, in both directions. It only touches transforms and one
 * short thread segment per frame, so it stays smooth on phones.
 */
export function ButterflyFlight() {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const flyer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const host = root.current!.parentElement as HTMLElement, s = svg.current!, f = flyer.current!;
    const wingR = f.querySelector<SVGGElement>(".wing-r")!, wingL = f.querySelector<SVGGElement>(".wing-l")!;
    let segs: Seg[] = [], keys: number[] = [], start: Pt = { x: 0, y: 0 };
    let nightFrom = Infinity;

    const layout = () => {
      const o = host.getBoundingClientRect(), width = host.clientWidth, height = host.scrollHeight, vh = window.innerHeight;
      s.setAttribute("width", String(width)); s.setAttribute("height", String(height));
      root.current!.style.height = `${height}px`;
      const stops = Array.from(host.querySelectorAll("[data-perch]")).filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => stopPoint(e, o, width)).sort((a, b) => a.y - b.y);
      if (stops.length < 2) return;
      start = stops[0];
      const maxScroll = Math.max(1, height - vh);
      keys = stops.map((p) => Math.min(maxScroll, Math.max(0, p.y - vh * FOCUS)));
      for (let i = 1; i < keys.length; i++) keys[i] = Math.max(keys[i], keys[i - 1] + 1);
      const { pts, at } = route(stops, width, vh);
      s.replaceChildren();
      segs = spline(pts, at, width).map((d, i) => {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", d);
        p.setAttribute("fill", "none"); p.setAttribute("stroke", P.gold); p.setAttribute("stroke-width", "1"); p.setAttribute("opacity", ".65");
        s.append(p);
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len} ${len}`; p.style.strokeDashoffset = `${len}`;
        /* Height along this stretch, sampled, so scrolling can be matched to height on the page. */
        const ys: number[] = [];
        for (let k = 0; k <= SAMPLES; k++) ys.push(p.getPointAtLength((k / SAMPLES) * len).y);
        return { el: p, len, from: keys[i], to: keys[i + 1], ys };
      });
      const night = document.getElementById("farewell");
      nightFrom = night ? night.getBoundingClientRect().top - o.top + window.innerHeight * 0.45 : Infinity;
      drawn = -1;
    };

    let drawn = -1, cur = -1, x = 0, y = 0, angle = 0, phase = 0, last = performance.now(), born = last, raf = 0, stopped = false;
    /* Progress is whole segments plus a fraction, so a thread always matches the butterfly. */
    const target = () => {
      const sc = window.scrollY;
      if (!segs.length || sc <= segs[0].from) return 0;
      for (let i = 0; i < segs.length; i++) if (sc < segs[i].to) return i + along(segs[i], glide((sc - segs[i].from) / (segs[i].to - segs[i].from), segs[i].to - segs[i].from));
      return segs.length;
    };
    const pointAt = (p: number): Pt => {
      if (!segs.length) return start;
      const i = Math.min(segs.length - 1, Math.floor(p)), sg = segs[i];
      const q = sg.el.getPointAtLength((p - i) * sg.len);
      return { x: q.x, y: q.y };
    };
    const thread = (p: number) => {
      const whole = Math.floor(p);
      if (whole !== drawn) {
        segs.forEach((sg, i) => { sg.el.style.strokeDashoffset = i < whole ? "0" : `${sg.len}`; sg.el.style.visibility = Math.abs(i - whole) > 3 && i > whole ? "hidden" : "visible"; });
        drawn = whole;
      }
      if (whole < segs.length) segs[whole].el.style.strokeDashoffset = String(segs[whole].len * (1 - (p - whole)));
    };

    /* It shies away from a nearby pointer, and hops when tapped near. */
    let px = -9999, py = -9999, ox = 0, oy = 0, hop = 0;
    const onMove = (e: PointerEvent) => { if (e.pointerType === "mouse") { px = e.pageX; py = e.pageY; } };
    const onDown = (e: PointerEvent) => { if (Math.hypot(e.pageX - x, e.pageY - y) < 70) { hop = performance.now(); f.dataset.hops = String(Number(f.dataset.hops ?? 0) + 1); } };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    const frame = (now: number) => {
      if (stopped) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const goal = target();
      if (cur < 0) { cur = goal; const p0 = pointAt(cur); x = p0.x; y = p0.y; }
      cur += (goal - cur) * (1 - Math.exp(-dt * 7));
      if (Math.abs(goal - cur) < 0.0004) cur = goal;
      const p = pointAt(cur);
      /* Flies in from the side when the page opens. */
      const intro = Math.min(1, (now - born) / 1700), io = 1 - Math.pow(1 - intro, 3);
      const ix = (1 - io) * -window.innerWidth * 0.55, iy = (1 - io) * window.innerHeight * 0.45 + Math.sin(io * Math.PI * 3) * (1 - io) * 40;
      const dxp = p.x - px, dyp = p.y - py, dp = Math.hypot(dxp, dyp), shy = dp < 110 ? (110 - dp) * 0.75 : 0;
      ox += ((dp ? (dxp / dp) * shy : 0) - ox) * 0.12; oy += ((dp ? (dyp / dp) * shy : 0) - oy) * 0.12;
      const since = (now - hop) / 900, hopY = hop && since < 1 ? -Math.sin(since * Math.PI) * 54 : 0, hopX = hop && since < 1 ? Math.sin(since * Math.PI * 2) * 26 : 0;
      const tx = p.x + ix + ox + hopX, ty = p.y + iy + oy + hopY;
      const vx = (tx - x) / Math.max(dt, 0.001), vy = (ty - y) / Math.max(dt, 0.001), speed = Math.hypot(vx, vy);
      x = tx; y = ty;
      const flying = speed > 26;
      const want = flying ? (Math.atan2(vy, vx) * 180) / Math.PI + 90 : -10;
      const diff = ((want - angle + 540) % 360) - 180;
      angle += diff * (1 - Math.exp(-dt * (flying ? 9 : 2.6)));
      phase += dt * (1.3 + Math.min(30, speed * 0.05));
      const k = (flying ? 0.32 : 0.74) + (flying ? 0.68 : 0.26) * Math.abs(Math.cos(phase));
      const bob = flying ? Math.sin(phase * 0.5) * 3 : 0;
      f.style.transform = `translate3d(${x.toFixed(1)}px,${(y + bob).toFixed(1)}px,0) rotate(${angle.toFixed(1)}deg)`;
      wingR.style.transform = `scaleX(${k.toFixed(3)})`;
      wingL.style.transform = `scaleX(${(-k).toFixed(3)})`;
      f.classList.toggle("over-night", y > nightFrom);
      f.dataset.progress = cur.toFixed(3);
      f.dataset.flap = k.toFixed(3);
      thread(cur);
      raf = requestAnimationFrame(frame);
    };

    layout();
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(layout, 120); });
    ro.observe(host);
    document.fonts?.ready.then(layout);
    raf = requestAnimationFrame(frame);
    f.style.opacity = "1";
    return () => { stopped = true; cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(t); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onDown); };
  }, []);

  return (
    <>
      <div ref={root} className="flight" aria-hidden="true"><svg ref={svg} /></div>
      <div ref={flyer} className="flyer" aria-hidden="true" data-flyer>
        <svg viewBox="-50 -50 100 100"><ButterflyMark /></svg>
      </div>
    </>
  );
}
