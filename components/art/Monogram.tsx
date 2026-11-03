import { wedding } from "@/config/wedding.config";
import { P } from "./paint";

/** Two initials in a fine circle. */
export function MonogramMark({ color = P.gold, ring = true }: { color?: string; ring?: boolean; fill?: string; draw?: boolean; title?: string }) {
  const a = wedding.couple.bride.initial, b = wedding.couple.groom.initial;
  const t = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, fontStyle: "italic", fill: color, textAnchor: "middle" as const };
  return <g>{ring && <circle cx={50} cy={52} r={47} fill="none" stroke={color} strokeWidth={1} />}<text x={36} y={58} {...t}>{a}</text><text x={64} y={72} {...t}>{b}</text></g>;
}
export function Monogram({ size = 64, color = P.gold, className }: { size?: number; color?: string; className?: string }) {
  return <svg viewBox="0 0 100 104" width={size} height={size * 1.04} className={className} aria-hidden="true"><MonogramMark color={color} /></svg>;
}
