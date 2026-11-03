"use client";
import { collectHeart, useHearts } from "@/lib/hearts";
import { useToast } from "./bits";
import { P } from "@/components/art/paint";

export const HEART_IDS = ["arch", "lake", "book"] as const;
export const HeartShape = ({ fill = P.rose, size = 15 }: { fill?: string; size?: number }) => (
  <svg viewBox="0 0 20 18" width={size} height={size} aria-hidden="true"><path d="M10 17.5C4 13 .5 9.8.5 5.6.5 2.6 2.8.5 5.4.5c2 0 3.6 1 4.6 3 1-2 2.6-3 4.6-3 2.6 0 4.9 2.1 4.9 5.1C19.500 9.8 16 13 10 17.5Z" fill={fill} stroke={P.roseDeep} strokeWidth={0.7} /></svg>
);

/** A small heart tucked into the architecture. Collected on tap. */
export function HiddenHeart({ id, style }: { id: (typeof HEART_IDS)[number]; style: React.CSSProperties }) {
  const found = useHearts();
  const toast = useToast();
  if (found.includes(id)) return null;
  return (
    <button type="button" className="heart-btn" style={style} data-heart={id} aria-label="You found a hidden heart. Collect it"
      onClick={() => { collectHeart(id); const c = found.length + 1; toast(c === 3 ? "All three hearts found. A secret awaits in the Fun Corner." : `Hidden heart found: ${c} of 3.`); }}>
      <HeartShape />
    </button>
  );
}
