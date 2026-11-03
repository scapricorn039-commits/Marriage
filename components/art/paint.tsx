/** The artist's box: palette and brush helpers shared by every illustration, so all scenes share one hand. */
import type { ReactNode } from "react";

export const P = {
  ivory: "#F4ECDF", parchment: "#EFE3D0", champagne: "#E8D9C3", gold: "#B89A68", goldDeep: "#8F7443", goldPale: "#D6C39E",
  maroon: "#713441", maroonDeep: "#4E2029", sand: "#D39C87", sandLight: "#E8BFAC", sandPale: "#F3DACB", sandDeep: "#B9796A", sandDark: "#85544A",
  sage: "#66735D", sageDeep: "#47533F", sageLight: "#8F9B83", brown: "#49372E", ink: "#2F231D", rose: "#D79A9C", roseDeep: "#B0666F", pink: "#C4667E", teal: "#4F7470", tealDeep: "#35554F",
  night: "#20151A", dusk: "#3A2430", flame: "#E9B872", flameCore: "#F7E6BF", marigold: "#CF9545", marigoldDeep: "#AE7632",
};

export const n = (v: number) => Math.round(v * 10) / 10;

/** Small deterministic random generator, so server and browser paint the same picture. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rajasthani multifoil arch outline. Starts bottom-left, runs over the apex, ends bottom-right. */
export function multifoil(x: number, bottom: number, w: number, spring: number, rise: number, lobes = 5, pointed = 1.1) {
  const cx = x + w / 2, a = w / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i <= lobes; i++) {
    const s = i / lobes;
    const px = cx - a * Math.pow(Math.cos((s * Math.PI) / 2), pointed);
    const py = spring - rise * Math.sin((s * Math.PI) / 2);
    pts.push([px, py]);
  }
  let d = `M${n(x)} ${n(bottom)}L${n(x)} ${n(spring)}`;
  const arc = (a1: [number, number], b: [number, number]) => {
    const r = Math.hypot(b[0] - a1[0], b[1] - a1[1]) * 0.56;
    return `A${n(r)} ${n(r)} 0 0 1 ${n(b[0])} ${n(b[1])}`;
  };
  for (let i = 1; i < pts.length; i++) d += arc(pts[i - 1], pts[i]);
  for (let i = pts.length - 1; i > 0; i--) {
    const A: [number, number] = [2 * cx - pts[i][0], pts[i][1]], B: [number, number] = [2 * cx - pts[i - 1][0], pts[i - 1][1]];
    d += arc(A, B);
  }
  return d + `L${n(x + w)} ${n(bottom)}Z`;
}

/** Ogee arch used for smaller niches. */
export function ogee(x: number, bottom: number, w: number, spring: number, rise: number) {
  const cx = x + w / 2, top = spring - rise;
  return `M${n(x)} ${n(bottom)}L${n(x)} ${n(spring)}C${n(x)} ${n(spring - rise * 0.55)} ${n(cx - w * 0.06)} ${n(spring - rise * 0.62)} ${n(cx)} ${n(top)}C${n(cx + w * 0.06)} ${n(spring - rise * 0.62)} ${n(x + w)} ${n(spring - rise * 0.55)} ${n(x + w)} ${n(spring)}L${n(x + w)} ${n(bottom)}Z`;
}

export function Rosette({ x, y, r, petals = 8, fill = P.goldPale, line = P.goldDeep, core = P.maroon, sw = 0.8 }: { x: number; y: number; r: number; petals?: number; fill?: string; line?: string; core?: string; sw?: number }) {
  const out: ReactNode[] = [];
  for (let i = 0; i < petals; i++) {
    out.push(<path key={i} transform={`rotate(${n((360 / petals) * i)})`} d={`M0 0C${n(r * 0.42)} ${n(-r * 0.3)} ${n(r * 0.3)} ${n(-r * 0.88)} 0 ${n(-r)}C${n(-r * 0.3)} ${n(-r * 0.88)} ${n(-r * 0.42)} ${n(-r * 0.3)} 0 0Z`} fill={fill} stroke={line} strokeWidth={sw} />);
  }
  return <g transform={`translate(${n(x)} ${n(y)})`}>{out}<circle r={n(r * 0.22)} fill={core} stroke={line} strokeWidth={sw} /></g>;
}

export function Marigold({ x, y, r, c = P.marigold, d = P.marigoldDeep }: { x: number; y: number; r: number; c?: string; d?: string }) {
  return (
    <g transform={`translate(${n(x)} ${n(y)})`}>
      <circle r={r} fill={d} />
      <circle r={n(r * 0.78)} fill={c} />
      <circle r={n(r * 0.46)} fill={d} opacity={0.65} />
      <circle r={n(r * 0.2)} fill={c} />
    </g>
  );
}

/** Marigold string hung between two points. */
export function Garland({ x1, y1, x2, y2, sag, r = 9, step, leaves = true }: { x1: number; y1: number; x2: number; y2: number; sag: number; r?: number; step?: number; leaves?: boolean }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const count = Math.max(4, Math.round(len / (step ?? r * 1.55)));
  const out: ReactNode[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + sag * 4 * t * (1 - t);
    if (leaves && i % 5 === 2) out.push(<path key={`l${i}`} transform={`translate(${n(x)} ${n(y + r * 0.6)})`} d={`M0 0C${n(r)} ${n(r)} ${n(r * 0.5)} ${n(r * 2.4)} 0 ${n(r * 3)}C${n(-r * 0.5)} ${n(r * 2.4)} ${n(-r)} ${n(r)} 0 0Z`} fill={P.sage} stroke={P.sageDeep} strokeWidth={0.6} />);
    out.push(<Marigold key={i} x={x} y={y} r={i % 2 ? r : r * 0.86} c={i % 7 === 3 ? P.rose : P.marigold} d={i % 7 === 3 ? P.roseDeep : P.marigoldDeep} />);
  }
  return <g>{out}</g>;
}

/** Kota school tree: a rounded crown built from hundreds of painted leaf dabs. */
export function Tree({ x, y, r, seed, dabs = 70, tone = 0 }: { x: number; y: number; r: number; seed: number; dabs?: number; tone?: number }) {
  const rand = rng(seed);
  const shades = [P.sageDeep, P.sage, P.sageLight];
  const out: ReactNode[] = [];
  for (let i = 0; i < dabs; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.82;
    const lit = (py - y) / r < -0.2 ? 1 : 0;
    const f = shades[Math.min(2, Math.floor(rand() * 2) + lit + tone)];
    const s = Math.max(5, r * (0.045 + rand() * 0.045));
    out.push(<ellipse key={i} cx={n(px)} cy={n(py)} rx={n(s * 1.3)} ry={n(s * 0.75)} transform={`rotate(${n(rand() * 180)} ${n(px)} ${n(py)})`} fill={f} />);
  }
  return (
    <g>
      <path d={`M${n(x - r * 0.07)} ${n(y + r * 2)}C${n(x - r * 0.04)} ${n(y + r)} ${n(x - r * 0.1)} ${n(y + r * 0.5)} ${n(x - r * 0.02)} ${n(y)}L${n(x + r * 0.05)} ${n(y)}C${n(x + r * 0.1)} ${n(y + r * 0.6)} ${n(x + r * 0.06)} ${n(y + r)} ${n(x + r * 0.1)} ${n(y + r * 2)}Z`} fill={P.brown} />
      <ellipse cx={x} cy={y} rx={n(r * 0.94)} ry={n(r * 0.78)} fill={P.sageDeep} />
      {out}
    </g>
  );
}

/** Square-lattice jaali window fill. */
export function Jaali({ x, y, w, h, cell = 16, line = P.sandDark, id }: { x: number; y: number; w: number; h: number; cell?: number; line?: string; id: string }) {
  return (
    <>
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" patternTransform={`translate(${x} ${y})`}>
          <path d={`M${cell / 2} 0L${cell} ${cell / 2}L${cell / 2} ${cell}L0 ${cell / 2}Z`} fill="none" stroke={line} strokeWidth={1.1} />
          <circle cx={cell / 2} cy={cell / 2} r={cell * 0.12} fill={line} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </>
  );
}

/** Peacock feather: rachis, barbs and eye. Paths are named so they can be drawn on. */
export function Feather({ x, y, s = 1, rotate = 0, stroke = P.gold }: { x: number; y: number; s?: number; rotate?: number; stroke?: string }) {
  const barbs: ReactNode[] = [];
  for (let i = 0; i < 13; i++) {
    const t = i / 12, yy = 118 - t * 88, w = 7 + Math.sin(t * Math.PI) * 24;
    barbs.push(<path key={i} d={`M0 ${n(yy)}C${n(-w * 0.5)} ${n(yy - 4)} ${n(-w * 0.8)} ${n(yy - 12)} ${n(-w)} ${n(yy - 20)}M0 ${n(yy)}C${n(w * 0.5)} ${n(yy - 4)} ${n(w * 0.8)} ${n(yy - 12)} ${n(w)} ${n(yy - 20)}`} fill="none" stroke={stroke} strokeWidth={0.9} className="draw" pathLength={1} />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`} className="feather">
      <path d="M0 180C2 130 0 70 0 12" fill="none" stroke={stroke} strokeWidth={1.4} className="draw" pathLength={1} />
      {barbs}
      <path d="M0 -6C15 -6 24 8 24 21C24 34 12 42 0 46C-12 42 -24 34 -24 21C-24 8 -15 -6 0 -6Z" fill={P.sage} opacity={0.9} stroke={stroke} strokeWidth={1} />
      <path d="M0 4C9 4 14 13 14 21C14 29 7 33 0 36C-7 33 -14 29 -14 21C-14 13 -9 4 0 4Z" fill={P.gold} />
      <path d="M0 11C5 11 8 17 8 21C8 26 4 28 0 30C-4 28 -8 26 -8 21C-8 17 -5 11 0 11Z" fill={P.maroonDeep} />
    </g>
  );
}

/** Diya with a live flame. Flame glow classes are animated from CSS and GSAP. */
export function Diya({ x, y, s = 1, lit = true, className }: { x: number; y: number; s?: number; lit?: boolean; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className}>
      {lit && <>
        <circle cy={-18} r={30} fill="url(#diyaGlow)" className="flame-glow" />
        <path d="M0 -30C6 -22 8 -16 5 -11C3 -8 -3 -8 -5 -11C-8 -16 -6 -22 0 -30Z" fill={P.flame} className="flame" />
        <path d="M0 -22C3 -18 3 -14 2 -12C1 -10 -1 -10 -2 -12C-3 -14 -3 -18 0 -22Z" fill={P.flameCore} className="flame" />
      </>}
      <path d="M-20 -9C-14 3 14 3 20 -9C24 -10 24 -13 20 -13C8 -8 -8 -8 -20 -13C-25 -12 -24 -10 -20 -9Z" fill={P.sandDeep} stroke={P.sandDark} strokeWidth={0.8} />
      <path d="M-10 0C-5 4 5 4 10 0L8 5H-8Z" fill={P.sandDark} />
    </g>
  );
}

/** Shared gradient for every diya. Include once per SVG that paints diyas. */
export const DiyaDefs = () => (
  <defs>
    <radialGradient id="diyaGlow">
      <stop offset="0" stopColor={P.flame} stopOpacity={0.7} />
      <stop offset="1" stopColor={P.flame} stopOpacity={0} />
    </radialGradient>
  </defs>
);

/** Hanging brass lantern. */
export function Lantern({ x, y, chain, s = 1, className }: { x: number; y: number; chain: number; s?: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className}>
      <path d={`M0 ${-chain}V0`} stroke={P.goldDeep} strokeWidth={1.5} strokeDasharray="3 3" />
      <circle cy={38} r={72} fill="url(#lanternGlow)" className="lantern-glow" />
      <path d="M-11 6C-5 -3 5 -3 11 6L17 12H-17Z" fill={P.goldDeep} stroke={P.ink} strokeWidth={0.6} />
      <path d="M-15 12H15L19 52C10 66 -10 66 -19 52Z" fill={P.flame} stroke={P.goldDeep} strokeWidth={1.3} className="lantern-body" />
      <path d="M-7 12L-9 60M7 12L9 60M-17 32H17" stroke={P.goldDeep} strokeWidth={1.1} fill="none" />
      <path d="M-5 62H5L0 76Z" fill={P.goldDeep} />
    </g>
  );
}
export const LanternDefs = () => (
  <defs>
    <radialGradient id="lanternGlow">
      <stop offset="0" stopColor={P.flame} stopOpacity={0.55} />
      <stop offset="0.5" stopColor={P.flame} stopOpacity={0.14} />
      <stop offset="1" stopColor={P.flame} stopOpacity={0} />
    </radialGradient>
  </defs>
);
