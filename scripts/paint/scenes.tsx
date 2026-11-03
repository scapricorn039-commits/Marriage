/* Original compositions for the first page. The watercolour pass runs afterwards. */
import type { ReactNode } from "react";
import { P, multifoil, rng, n, Rosette, Marigold, Garland, Tree } from "@/components/art/paint";
import { journey } from "./journey";

const X = P as typeof P & { pink: string; teal: string; tealDeep: string };

function Palace({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-240 0V-120H240V0Z" fill={P.sandPale} stroke={P.sandDeep} strokeWidth={1.4} />
    {[-190, -114, -38, 38, 114].map((px) => <path key={px} d={multifoil(px, 0, 56, -52, 34, 4)} fill={P.sandDeep} />)}
    <path d="M-256 -120H256L240 -136H-240Z" fill={P.sand} />
    <path d="M-120 -136V-210H120V-136Z" fill={P.sandLight} stroke={P.sandDeep} />
    <path d="M-132 -210H132L120 -222H-120ZM-76 -222C-76 -270 -22 -282 0 -318C22 -282 76 -270 76 -222Z" fill={P.sand} stroke={P.sandDeep} />
    {[-180, 180].map((px) => <g key={px} transform={`translate(${px} -136)`}><rect x={-26} y={-52} width={52} height={52} fill={P.sandPale} stroke={P.sandDeep} /><path d="M-34 -52H34L26 -62H-26ZM-24 -62C-24 -90 -6 -96 0 -110C6 -96 24 -90 24 -62Z" fill={P.sand} stroke={P.sandDeep} /></g>)}
  </g>;
}

function Lotus({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-76, -52, -26, 0, 26, 52, 76].map((a) => <path key={a} transform={`rotate(${a})`} d="M0 0C20 -20 16 -62 0 -78C-16 -62 -20 -20 0 0Z" fill={Math.abs(a) > 30 ? P.rose : P.ivory} stroke={X.pink} strokeWidth={1} />)}
    <circle cy={-4} r={8} fill={P.marigold} />
  </g>;
}

function Bougainvillea({ x1, y1, x2, y2, seed, count = 54, spread = 62 }: { x1: number; y1: number; x2: number; y2: number; seed: number; count?: number; spread?: number }) {
  const r = rng(seed), tones = [X.pink, P.rose, P.roseDeep, X.pink], out: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t = r(), x = x1 + (x2 - x1) * t + (r() - 0.5) * spread * 2, y = y1 + (y2 - y1) * t + (r() - 0.5) * spread * 2, s = 0.75 + r() * 0.8, f = tones[Math.floor(r() * 4)], rot = n(r() * 120);
    if (i % 4 === 0) out.push(<path key={`l${i}`} transform={`translate(${n(x + 10)} ${n(y + 12)}) rotate(${rot})`} d="M0 0C10 -8 22 -8 30 0C22 8 10 8 0 0Z" fill={P.sage} />);
    out.push(<g key={i} transform={`translate(${n(x)} ${n(y)}) rotate(${rot}) scale(${n(s)})`}>{[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a})`} d="M0 0C12 -6 14 -18 0 -24C-14 -18 -12 -6 0 0Z" fill={f} />)}<circle r={2.4} fill={P.ivory} /></g>);
  }
  return <g>{out}</g>;
}

function Urn({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-52 -40C-76 20 -44 76 -30 80H30C44 76 76 20 52 -40Z" fill={P.gold} stroke={P.goldDeep} strokeWidth={1.5} /><path d="M-42 -40H42L54 -54H-54Z" fill={P.goldDeep} />
    {[[-44, -86, 30], [0, -112, 34], [44, -86, 30], [-22, -66, 28], [24, -66, 28]].map(([a, b, r]) => <g key={`${a}${b}`}><path transform={`translate(${a} ${b + 26})`} d="M0 0C16 10 20 32 0 50C-20 32 -16 10 0 0Z" fill={P.sage} stroke={P.sageDeep} /><Marigold x={a} y={b} r={r} /></g>)}
  </g>;
}

const W = 1000, H = 1400;
const near = multifoil(70, 1290, 860, 560, 500, 9);
const mid = multifoil(200, 1180, 600, 620, 370, 7);
const far = multifoil(310, 1090, 380, 680, 250, 6);

export const scenes: Record<string, { w: number; h: number; scale?: number; art: () => ReactNode }> = {
  /* Sunrise over a lake palace, seen far through the arches. */
  "hero-back": { w: W, h: H, art: () => <>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9B6A6" /><stop offset=".55" stopColor="#F8DFC4" /><stop offset="1" stopColor="#FBEFD6" /></linearGradient></defs>
    <rect width={W} height={H} fill="url(#sky)" />
    <circle cx={500} cy={720} r={120} fill="#FCEBC0" />
    {[[260, 360, 1.3], [720, 470, 1], [470, 300, .8]].map(([x, y, s]) => <path key={x} transform={`translate(${x} ${y}) scale(${s})`} d="M-120 12C-96 -14 -64 -10 -50 0C-30 -30 20 -28 34 0C60 -10 96 -4 116 14C50 26 -60 26 -120 12Z" fill={P.ivory} opacity={0.85} />)}
    <Tree x={310} y={880} r={70} seed={31} dabs={90} /><Tree x={690} y={880} r={66} seed={33} dabs={90} />
    <Palace x={500} y={960} s={0.78} />
    <rect y={960} width={W} height={440} fill={X.teal} opacity={0.82} />
    {[985, 1010, 1040, 1075].map((y, i) => <path key={y} d={`M${400 - i * 22} ${y}H${600 + i * 22}`} stroke="#FCEBC0" strokeWidth={3 + i} opacity={0.65} />)}
    <Lotus x={420} y={1120} s={0.5} /><Lotus x={590} y={1150} s={0.42} />
  </> },
  /* The haveli itself: three arches, one inside another, garlanded. */
  "hero-front": { w: W, h: H, art: () => <>
    <path fillRule="evenodd" d={`M0 0H${W}V${H}H0Z ${far}`} fill={P.sandPale} />
    <path d={far} fill="none" stroke={P.sandDeep} strokeWidth={6} />
    <path fillRule="evenodd" d={`M0 0H${W}V${H}H0Z ${mid}`} fill={P.sandLight} />
    <path d={mid} fill="none" stroke={P.sandDeep} strokeWidth={8} /><path d={mid} fill="none" stroke={P.gold} strokeWidth={2} />
    <path d="M310 1090H690L800 1180H200Z" fill={P.ivory} stroke={P.sandDeep} strokeWidth={2} />
    <path fillRule="evenodd" d={`M0 0H${W}V${H}H0Z ${near}`} fill={P.sand} />
    <path d={near} fill="none" stroke={P.sandDeep} strokeWidth={11} /><path d={near} fill="none" stroke={P.gold} strokeWidth={2.5} />
    <path d="M200 1180H800L930 1290H70Z" fill={P.sandPale} stroke={P.sandDeep} strokeWidth={2} />
    <path d="M0 1290H1000V1400H0Z" fill={P.sandLight} /><path d="M0 1290H1000" stroke={P.sandDeep} strokeWidth={4} />
    <Rosette x={500} y={1236} r={60} petals={14} fill={P.rose} line={X.pink} core={P.marigold} />
    <Garland x1={140} y1={410} x2={500} y2={200} sag={70} r={20} /><Garland x1={500} y1={200} x2={860} y2={410} sag={70} r={20} /><Marigold x={500} y={200} r={32} />
    <Bougainvillea x1={-10} y1={80} x2={250} y2={40} seed={3} count={70} /><Bougainvillea x1={1010} y1={80} x2={750} y2={40} seed={8} count={70} />
    <Bougainvillea x1={40} y1={100} x2={36} y2={720} seed={13} count={44} spread={34} /><Bougainvillea x1={960} y1={100} x2={962} y2={660} seed={14} count={40} spread={34} />
    <Urn x={150} y={1310} s={1.15} /><Urn x={850} y={1310} s={1.15} />
  </> },
  ...journey,
};
