/* The road to Kota: an original panorama and every vehicle in it, drawn side-on and painted separately. */
import type { ReactNode } from "react";
import { P, multifoil, rng, n, Marigold, Garland, Tree } from "@/components/art/paint";

const TEAL = "#4F7470", DEEP = "#35554F", PINK = "#C4667E";
const TAR = "#A99C92", COCH = "#2F231D";

function Fort({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-250 0L-230 -40H-180V-96H-150V-70H-120V-120H-92V-90H-40V-150C-40 -176 -12 -184 0 -214C12 -184 40 -176 40 -150V-90H96V-126H124V-72H170V-104H198V-44H240L260 0Z" fill={P.sandLight} stroke={P.sandDeep} strokeWidth={1.6} />
    {[-166, -106, 110, 184].map((px) => <path key={px} d={`M${px - 20} ${px < 0 ? -96 : -104}C${px - 16} ${px < 0 ? -124 : -132} ${px - 4} ${px < 0 ? -128 : -136} ${px} ${px < 0 ? -144 : -152}C${px + 4} ${px < 0 ? -128 : -136} ${px + 16} ${px < 0 ? -124 : -132} ${px + 20} ${px < 0 ? -96 : -104}Z`} fill={P.sand} stroke={P.sandDeep} />)}
    {[-30, -8, 14].map((px) => <path key={px} d={multifoil(px, -96, 18, -124, 12, 3)} fill={P.sandDeep} />)}
    {[-200, -150, -96, 60, 110, 170].map((px) => <path key={px} d={multifoil(px, -22, 26, -44, 14, 3)} fill={P.sandDeep} />)}
    <path d="M-40 -150H40" stroke={P.sandDeep} strokeWidth={2} /><path d="M0 -214V-240" stroke={P.goldDeep} strokeWidth={2} /><path d="M0 -240L20 -233L0 -226Z" fill={PINK} />
  </g>;
}

function HangingBridge({ x, y, w = 520 }: { x: number; y: number; w?: number }) {
  const py = 118, lines: ReactNode[] = [];
  for (const cx of [x + w * 0.28, x + w * 0.72]) for (let i = 1; i <= 7; i++) {
    lines.push(<path key={`${cx}a${i}`} d={`M${cx} ${y - py}L${n(cx - i * 19)} ${y}M${cx} ${y - py}L${n(cx + i * 19)} ${y}`} stroke={P.sandDeep} strokeWidth={0.9} opacity={0.75} />);
  }
  return <g>
    {lines}
    <path d={`M${x} ${y}H${x + w}V${y + 9}H${x}Z`} fill={P.sandPale} stroke={P.sandDeep} />
    {[x + w * 0.28, x + w * 0.72].map((cx) => <path key={cx} d={`M${cx - 7} ${y + 60}L${cx - 3} ${y - py}H${cx + 3}L${cx + 7} ${y + 60}Z`} fill={P.sandLight} stroke={P.sandDeep} />)}
  </g>;
}

/* Wheels are drawn live on the site. Sprites only hold a dark wheel arch. */
const Arch = ({ x, y, r }: { x: number; y: number; r: number }) => <path d={`M${x - r - 5} ${y}A${r + 5} ${r + 5} 0 0 1 ${x + r + 5} ${y}Z`} fill={COCH} />;

const Bogie = ({ x }: { x: number }) => <g><path d={`M${x} 68H${x + 58}L${x + 52} 76H${x + 6}Z`} fill={COCH} /><circle cx={x + 14} cy={78} r={6} fill="#6f645c" /><circle cx={x + 44} cy={78} r={6} fill="#6f645c" /></g>;

function Coach({ body = P.maroon, band = P.ivory, w = 300 }: { body?: string; band?: string; w?: number }) {
  const win: ReactNode[] = [];
  for (let i = 0; i < 9; i++) win.push(<rect key={i} x={34 + i * 27} y={24} width={18} height={15} rx={2} fill="#FBE7BE" stroke={COCH} strokeWidth={0.8} />);
  return <g>
    <path d={`M6 10C6 6 10 4 16 4H${w - 16}C${w - 10} 4 ${w - 6} 6 ${w - 6} 10V66H6Z`} fill={body} stroke={COCH} strokeWidth={1} />
    <path d={`M6 19H${w - 6}V44H6Z`} fill={band} />
    <path d={`M6 46H${w - 6}`} stroke={P.gold} strokeWidth={2} />
    {win}
    {[12, w - 28].map((x) => <g key={x}><rect x={x} y={20} width={16} height={44} fill={body} stroke={COCH} strokeWidth={0.8} /><rect x={x + 4} y={25} width={8} height={12} fill="#FBE7BE" /></g>)}
    {[60, 130, 200].map((x) => <rect key={x} x={x} y={0} width={22} height={5} rx={2} fill="#8d8077" />)}
    <Bogie x={22} /><Bogie x={w - 80} />
  </g>;
}

export const journey: Record<string, { w: number; h: number; scale?: number; art: () => ReactNode }> = {
  "journey-back": { w: 1760, h: 792, art: () => <>
    <defs><linearGradient id="js" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2D6C8" /><stop offset=".42" stopColor="#FAEBD6" /><stop offset="1" stopColor="#FBF0DC" /></linearGradient></defs>
    <rect width={1760} height={792} fill="url(#js)" />
    <circle cx={1190} cy={150} r={70} fill="#FCEBC0" />
    <path d="M0 330C160 240 300 290 470 250C640 214 760 300 960 256C1160 214 1350 300 1520 250C1620 226 1700 260 1760 240V420H0Z" fill={P.sageLight} opacity={0.7} />
    <path d="M0 380C200 320 420 370 640 340C900 306 1140 370 1400 330C1540 310 1660 340 1760 320V440H0Z" fill={P.sage} opacity={0.65} />
    <Fort x={760} y={372} s={1.02} />
    {[150, 250, 340, 1060, 1120].map((x, i) => <g key={x}><rect x={x} y={344 - i * 3} width={70} height={48} fill={P.sandPale} stroke={P.sandDeep} /><path d={multifoil(x + 18, 392 - i * 3, 34, 366 - i * 3, 14, 3)} fill={P.sandDeep} /></g>)}
    {[[60, 330, 56, 1], [460, 336, 46, 2], [1010, 336, 40, 3], [1660, 320, 60, 4], [1560, 340, 40, 5]].map(([x, y, r, s]) => <Tree key={s} x={x} y={y} r={r} seed={s + 40} dabs={70} />)}
    <rect y={384} width={1760} height={128} fill={TEAL} opacity={0.62} />
    <HangingBridge x={1130} y={348} w={560} />
    {[410, 436, 462, 488].map((y, i) => <path key={y} d={`M${100 + i * 90} ${y}H${500 + i * 40}M${900 - i * 30} ${y}H${1500 - i * 60}`} stroke={P.ivory} strokeWidth={2 + i * 0.5} opacity={0.32} />)}
    <rect y={370} width={1760} height={14} fill={P.sandLight} stroke={P.sandDeep} strokeWidth={1.4} />
    {Array.from({ length: 11 }, (_, i) => -40 + i * 170).map((x) => <path key={x} d={`M${x} 384H${x + 170}V512H${x + 152}C${x + 150} 402 ${x + 20} 402 ${x + 18} 512H${x}Z`} fill={P.sandPale} stroke={P.sandDeep} strokeWidth={1.4} />)}
    <path d="M0 370H1760" stroke={COCH} strokeWidth={3} />
    {Array.from({ length: 9 }, (_, i) => 60 + i * 205).map((x) => <path key={x} d={`M${x} 370V262M${x} 272H${x + 24}`} stroke="#6f645c" strokeWidth={2.6} fill="none" />)}
    <path d="M0 274H1760" stroke="#6f645c" strokeWidth={1} />
    <path d="M0 512C300 498 520 516 820 504C1140 494 1420 516 1760 502V580H0Z" fill={P.sageLight} />
    {Array.from({ length: 34 }, (_, i) => { const r = rng(i + 9); return <path key={i} d={`M${n(r() * 1760)} ${n(516 + r() * 34)}q6 -12 12 0`} stroke={P.sageDeep} fill="none" />; })}
    <rect y={566} width={1760} height={148} fill={TAR} />
    <rect y={560} width={1760} height={7} fill={P.sandPale} /><rect y={712} width={1760} height={7} fill={P.sandPale} />
    {Array.from({ length: 30 }, (_, i) => i * 60).map((x) => <rect key={x} x={x} y={637} width={36} height={5} fill={P.ivory} />)}
    <rect y={719} width={1760} height={73} fill={P.sageLight} />
  </> },
  "journey-front": { w: 1760, h: 792, art: () => <>
    <Tree x={72} y={560} r={120} seed={61} dabs={170} /><Tree x={1690} y={574} r={110} seed={63} dabs={160} />
    {[[300, 750], [420, 770], [1320, 758], [1450, 772], [860, 770], [1000, 756]].map(([x, y], i) => <g key={x}>
      <path d={`M${x - 42} ${y + 30}C${x - 46} ${y - 18} ${x + 46} ${y - 18} ${x + 42} ${y + 30}Z`} fill={i % 2 ? P.sage : P.sageDeep} />
      {Array.from({ length: 6 }, (_, k) => <Marigold key={k} x={x - 30 + k * 12} y={y + (k % 2 ? -8 : 6)} r={8} />)}
    </g>)}
    <path d="M0 792V758C200 740 340 776 560 762C860 744 1100 780 1340 760C1520 744 1660 770 1760 754V792Z" fill={P.sage} />
    <g transform="translate(610 716)"><path d="M-34 66V-16C-34 -46 34 -46 34 -16V66Z" fill={P.ivory} stroke={P.sandDark} strokeWidth={1.6} /><path d="M-34 -16C-34 -46 34 -46 34 -16V-8H-34Z" fill={P.marigold} stroke={P.sandDark} strokeWidth={1.2} /></g>
    <Garland x1={1160} y1={716} x2={1300} y2={716} sag={18} r={7} leaves={false} />
    <path d="M1160 716V790M1300 716V790" stroke={P.sandDark} strokeWidth={4} />
  </> },
  "v-loco": { w: 250, h: 88, scale: 2, art: () => <g>
    <path d="M6 8C6 4 12 2 18 2H176C212 2 238 28 244 62V66H6Z" fill={P.maroon} stroke={COCH} strokeWidth={1.2} />
    <path d="M6 30H238L242 46H6Z" fill={P.ivory} /><path d="M6 48H244" stroke={P.gold} strokeWidth={2.4} />
    <path d="M178 8C200 10 222 28 230 46H178Z" fill="#CFE0DC" stroke={COCH} /><path d="M196 10V46" stroke={COCH} />
    {[30, 70, 110, 146].map((x) => <rect key={x} x={x} y={14} width={26} height={12} fill={COCH} opacity={0.75} />)}
    <rect x={48} y={-2} width={70} height={6} rx={2} fill="#6f645c" />
    <path d="M6 58H240" stroke={P.goldDeep} strokeDasharray="4 6" /><circle cx={236} cy={52} r={3.5} fill="#FBE7BE" stroke={COCH} />
    <Bogie x={20} /><Bogie x={150} />
  </g> },
  "v-coach-a": { w: 304, h: 88, scale: 2, art: () => <Coach /> },
  "v-coach-b": { w: 304, h: 88, scale: 2, art: () => <Coach body={TEAL} band={P.champagne} /> },
  "v-plane": { w: 260, h: 90, scale: 2, art: () => <g>
    <path d="M8 44C10 28 30 26 60 26H210C232 26 250 34 256 44C250 52 232 58 208 58H60C34 58 12 56 8 44Z" fill={P.ivory} stroke={P.sandDark} strokeWidth={1.2} />
    <path d="M8 44C14 40 40 40 60 42H256C252 52 232 58 208 58H60C34 58 14 54 8 44Z" fill={P.champagne} />
    <path d="M18 28L6 2H28L58 26Z" fill={P.maroon} stroke={COCH} strokeWidth={0.8} /><path d="M26 34L6 34L14 42L44 42Z" fill={P.maroon} />
    <path d="M100 46L70 84H96L146 46Z" fill={P.sandLight} stroke={P.sandDark} /><path d="M114 28L94 8H106L136 28Z" fill={P.sand} stroke={P.sandDark} strokeWidth={0.7} />
    <rect x={92} y={56} width={26} height={11} rx={5} fill={P.maroon} stroke={COCH} strokeWidth={0.7} />
    {Array.from({ length: 13 }, (_, i) => <rect key={i} x={70 + i * 11} y={33} width={5} height={6} rx={1.4} fill={DEEP} />)}
    <path d="M222 32C234 33 244 38 248 42H222Z" fill={DEEP} />
  </g> },
  "v-car": { w: 280, h: 110, scale: 2, art: () => <g>
    <path d="M10 76C6 60 14 52 40 48C62 18 88 8 130 8C170 8 192 22 212 48C248 52 270 58 272 76V84H10Z" fill={P.ivory} stroke={P.sandDark} strokeWidth={1.3} />
    <path d="M62 48C80 24 100 18 128 18V48ZM136 18C164 18 180 28 198 48H136Z" fill="#CFE0DC" stroke={P.sandDark} />
    <path d="M10 70H272" stroke={P.gold} strokeWidth={2} /><path d="M134 18V84" stroke={P.sandDark} opacity={0.5} />
    <rect x={262} y={62} width={14} height={12} rx={3} fill="#FBE7BE" stroke={P.sandDark} /><rect x={4} y={62} width={10} height={10} rx={2} fill={PINK} />
    <rect x={2} y={78} width={40} height={6} fill="#B9B2AB" /><rect x={244} y={78} width={34} height={6} fill="#B9B2AB" />
    <Arch x={66} y={84} r={21} /><Arch x={216} y={84} r={21} />
    <Garland x1={46} y1={46} x2={128} y2={8} sag={-8} r={5.5} leaves={false} /><Garland x1={128} y1={8} x2={206} y2={46} sag={-8} r={5.5} leaves={false} />
    <Garland x1={214} y1={50} x2={268} y2={62} sag={12} r={5.5} leaves={false} />
    <Marigold x={128} y={6} r={10} c={P.rose} d={PINK} /><Marigold x={268} y={58} r={8} c={P.rose} d={PINK} />
    <Garland x1={78} y1={58} x2={190} y2={58} sag={10} r={4.5} leaves={false} />
    <circle cx={92} cy={38} r={8} fill={P.brown} /><circle cx={162} cy={36} r={8} fill={P.marigold} /><path d="M154 36C156 26 170 26 170 36Z" fill={P.marigoldDeep} />
  </g> },
  "v-van": { w: 300, h: 130, scale: 2, art: () => <g>
    <rect x={40} y={26} width={190} height={5} fill={COCH} />
    {[[52, 54, 22, TEAL], [108, 40, 18, P.maroon], [150, 60, 22, P.marigold], [212, 22, 15, P.rose]].map(([x, w, h, c]) => <g key={`${x}`}><rect x={x as number} y={26 - (h as number)} width={w as number} height={h as number} rx={3} fill={c as string} stroke={COCH} strokeWidth={0.8} /><path d={`M${(x as number) + (w as number) / 2} ${26 - (h as number)}V26`} stroke={P.ivory} /></g>)}
    <path d="M14 34C14 31 18 30 22 30H226C252 30 268 52 282 66C292 70 294 78 294 98V106H14Z" fill={P.ivory} stroke={P.sandDark} strokeWidth={1.3} />
    {[34, 80, 126, 172].map((x) => <rect key={x} x={x} y={42} width={38} height={28} rx={3} fill="#CFE0DC" stroke={P.sandDark} />)}
    <path d="M224 42C244 42 258 56 268 70H224Z" fill="#CFE0DC" stroke={P.sandDark} />
    {[[42, P.marigold], [92, P.brown], [136, PINK], [182, P.brown]].map(([x, c]) => <circle key={`${x}`} cx={(x as number) + 10} cy={60} r={7} fill={c as string} />)}
    <path d="M14 78H294" stroke={PINK} strokeWidth={5} /><path d="M14 85H294" stroke={P.gold} strokeWidth={2} />
    <rect x={284} y={84} width={12} height={10} rx={2} fill="#FBE7BE" stroke={P.sandDark} /><rect x={12} y={84} width={8} height={10} fill={PINK} />
    <Arch x={70} y={106} r={22} /><Arch x={236} y={106} r={22} />
    <Garland x1={244} y1={36} x2={292} y2={70} sag={6} r={4.5} leaves={false} />
  </g> },
  "v-auto": { w: 180, h: 126, scale: 2, art: () => <g>
    <path d="M28 18C34 6 124 4 150 16L160 36H22Z" fill={COCH} /><path d="M30 18C36 8 122 6 146 17L150 24H28Z" fill={P.marigold} />
    <path d="M26 36H150L168 74C172 82 170 94 168 96H16C12 84 14 54 26 36Z" fill={P.marigold} stroke={COCH} strokeWidth={1.2} />
    <path d="M14 76H170V96H16Z" fill={DEEP} /><path d="M14 75H170" stroke={P.ivory} strokeWidth={2} />
    <path d="M34 40H84V74H22C22 60 26 48 34 40Z" fill="#3A2A25" opacity={0.85} /><path d="M94 40H146L162 72H94Z" fill="#CFE0DC" opacity={0.75} stroke={COCH} strokeWidth={0.8} />
    <circle cx={112} cy={50} r={9} fill={P.sandDark} /><path d="M100 72C102 58 124 58 128 72Z" fill={P.ivory} /><path d="M126 62L148 60" stroke={COCH} strokeWidth={2.4} />
    <circle cx={54} cy={50} r={8} fill={P.sandDark} /><path d="M42 72C44 58 66 58 68 72Z" fill={PINK} />
    <rect x={170} y={80} width={8} height={9} rx={2} fill="#FBE7BE" stroke={COCH} strokeWidth={0.7} />
    <Arch x={50} y={96} r={14} /><Arch x={146} y={96} r={14} />
    <Marigold x={150} y={40} r={5} />
  </g> },
  "v-scooter": { w: 160, h: 140, scale: 2, art: () => <g>
    <path d="M86 92C84 66 90 48 96 40C108 42 112 58 114 74L126 76L122 84L100 88L96 104H88Z" fill={P.ivory} stroke={P.sandDark} strokeWidth={0.8} />
    <circle cx={98} cy={30} r={9} fill={P.sandDark} /><path d="M88 30C86 16 110 16 108 30C102 24 94 24 88 30Z" fill={TEAL} />
    <path d="M42 96C40 72 46 54 54 46C64 50 72 66 76 84L82 112H52Z" fill={PINK} />
    <circle cx={54} cy={36} r={8} fill={P.sandDark} /><path d="M44 38C42 22 66 22 64 36C60 30 50 30 46 40Z" fill={P.ink} />
    <path className="scarf" d="M48 40C34 42 20 50 4 46C14 56 30 60 48 52Z" fill={P.rose} />
    <path d="M34 100C34 90 46 88 62 88H96L102 106H124L120 66H112L110 58H126L134 106C136 112 134 116 128 116H42C36 116 32 108 34 100Z" fill={P.maroon} stroke={COCH} strokeWidth={1} />
    <path d="M52 88C50 80 86 80 92 88Z" fill={COCH} /><path d="M118 62H128" stroke={COCH} strokeWidth={3.4} /><circle cx={129} cy={72} r={4} fill="#FBE7BE" stroke={COCH} strokeWidth={0.7} />
    <Arch x={44} y={116} r={11} /><Arch x={130} y={116} r={11} />
  </g> },
  "v-camel": { w: 360, h: 190, scale: 2, art: () => <g>
    <path d="M8 108H150L156 124H2Z" fill={P.sandDark} stroke={COCH} strokeWidth={0.9} /><path d="M2 124H158V130H2Z" fill={P.brown} />
    {[[20, 86, 40, 24, P.champagne], [62, 82, 36, 28, P.rose], [100, 88, 38, 22, P.champagne]].map(([x, y, w, h, c]) => <rect key={`${x}`} x={x as number} y={y as number} width={w as number} height={h as number} rx={6} fill={c as string} stroke={P.sandDark} strokeWidth={0.8} />)}
    <Marigold x={40} y={80} r={9} /><Marigold x={120} y={82} r={8} />
    <circle cx={116} cy={58} r={9} fill={P.sandDark} /><path d="M104 62C102 46 128 46 128 60C122 52 110 52 104 62Z" fill={PINK} />
    <path d="M102 90C100 72 106 66 116 66C126 66 132 74 132 90Z" fill={P.ivory} stroke={P.sandDark} strokeWidth={0.7} />
    <path d="M132 76C160 72 180 76 206 88" fill="none" stroke={COCH} strokeWidth={1.2} /><path d="M150 118L204 108" stroke={P.brown} strokeWidth={5} />
    <path d="M190 112C188 92 204 84 216 78C226 58 244 58 252 78C262 80 276 90 280 100C288 84 290 62 288 44C288 26 304 18 322 20C340 22 350 30 350 36C344 42 330 42 318 40C314 62 312 94 296 116C286 130 262 136 236 134C212 134 192 128 190 112Z" fill="#C9A47E" stroke={P.sandDark} strokeWidth={1} />
    <path d="M204 90C224 72 262 76 280 104C260 120 222 120 204 112Z" fill={P.maroon} stroke={P.gold} strokeWidth={1.6} /><path d="M208 112C228 120 258 120 278 106" stroke={P.gold} strokeWidth={3} strokeDasharray="1 6" strokeLinecap="round" fill="none" />
    <circle cx={330} cy={28} r={2.2} fill={COCH} /><path d="M314 20C314 14 322 14 322 20Z" fill="#B48E69" /><path d="M300 42C308 50 316 44 318 40" stroke={P.gold} strokeWidth={2.4} fill="none" />
    {[290, 296, 302].map((x, i) => <circle key={x} cx={x} cy={84 + i * 12} r={3.5} fill={i % 2 ? P.marigold : P.rose} />)}
    <Arch x={80} y={130} r={24} />
  </g> },
};
