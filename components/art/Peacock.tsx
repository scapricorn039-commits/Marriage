"use client";
import { useEffect, useState } from "react";
import { P, n } from "./paint";

const TEAL = "#4F7470", DEEP = "#35554F";

/** An original peacock. It fans its tail on hover or tap. */
export function PeacockButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  /* It shows off once when the page opens, so guests know it can. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = setTimeout(() => setOpen(true), 2100), b = setTimeout(() => setOpen(false), 4300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const rings: React.ReactNode[] = [];
  for (let ring = 0; ring < 3; ring++) {
    const count = 9 + ring * 3, rad = 58 + ring * 42;
    for (let i = 0; i < count; i++) {
      const a = Math.PI + (Math.PI * (i + 0.5)) / count, x = Math.cos(a) * rad, y = Math.sin(a) * rad, deg = n((a * 180) / Math.PI + 90);
      rings.push(<g key={`${ring}-${i}`} transform={`translate(${n(x)} ${n(y)})`}><path d={`M0 0L${n(-x * .45)} ${n(-y * .45)}`} stroke={DEEP} strokeWidth={0.8} /><ellipse rx={8} ry={11} transform={`rotate(${deg})`} fill={TEAL} /><ellipse rx={4.6} ry={6.6} transform={`rotate(${deg})`} fill={P.gold} /><circle r={2.2} fill={DEEP} /></g>);
    }
  }
  return (
    <button type="button" className={`peacock ${className}`} data-open={open} aria-pressed={open} aria-label={open ? "Fold the peacock's tail" : "Fan the peacock's tail"}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false); }} onClick={() => setOpen((v) => !v)} data-peacock>
      <svg viewBox="-170 -170 340 260" aria-hidden="true">
        <g className="fan">
          <path d="M-162 0A162 158 0 0 1 162 0Z" fill={P.sageLight} /><path d="M-116 0A116 112 0 0 1 116 0Z" fill={P.sage} opacity={.55} />{rings}
        </g>
        <path className="tail-folded" d="M-6 30C-50 40 -110 60 -150 76C-104 80 -50 72 8 50Z" fill={TEAL} stroke={DEEP} />
        <path d="M-22 44C-34 6 -22 -40 -8 -66C-12 -82 -2 -94 8 -90C16 -86 15 -76 8 -70C2 -44 22 -6 20 44C10 58 -14 58 -22 44Z" fill={DEEP} />
        <path d="M-13 38C-20 8 -11 -28 -2 -54C2 -30 10 6 10 38C4 48 -8 48 -13 38Z" fill={TEAL} />
        <path d="M8 -86L26 -82L9 -76Z" fill={P.gold} /><circle cx={3} cy={-84} r={2.2} fill={P.ivory} />
        {[-4, 2, 8].map((c, i) => <path key={c} d={`M${c - 2} -92L${c + i - 2} -108`} stroke={DEEP} strokeWidth={1.4} />)}
        <path d="M-10 52V80M-18 80H-2M8 52V80M0 80H16" stroke={P.goldDeep} strokeWidth={3} />
      </svg>
    </button>
  );
}
