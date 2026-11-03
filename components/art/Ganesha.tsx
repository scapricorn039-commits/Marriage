import { P } from "./paint";

/**
 * An original minimal line drawing of Ganesha's face: crown, broad ears, tilak,
 * one tusk, and the trunk curving to his left. The lines can draw themselves.
 */
export function Ganesha({ size = 56, color = P.maroon, accent = P.gold, tint = "none", className = "" }: { size?: number | string; color?: string; accent?: string; tint?: string; className?: string }) {
  const line = { fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1, className: "gl" };
  const gold = { ...line, stroke: accent };
  return (
    <svg viewBox="0 0 140 150" width={size} className={`ganesha ${className}`} aria-hidden="true">
      {/* soft colour under the lines */}
      <g className="gf" fill={tint}>
        <path d="M46 44C24 28 4 42 8 64C11 82 30 92 46 78C50 92 54 102 54 112C54 132 76 142 92 132C104 124 102 106 88 106C82 106 80 110 82 113C76 104 86 92 94 78C110 92 129 82 132 64C136 42 116 28 94 44C88 34 52 34 46 44Z" />
      </g>
      {/* crown */}
      <path {...gold} d="M48 42C46 28 56 26 58 18C62 22 64 24 70 8C76 24 78 22 82 18C84 26 94 28 92 42C80 36 60 36 48 42Z" />
      <path {...gold} d="M70 8V2" />
      <circle className="gdot" cx={70} cy={30} r={2.6} fill={accent} />
      {/* ears */}
      <path {...line} d="M46 46C26 28 4 42 8 64C11 83 32 92 46 76" />
      <path {...line} d="M94 46C114 28 136 42 132 64C129 83 108 92 94 76" />
      <path {...gold} d="M38 50C26 44 16 52 18 63C20 72 30 76 38 70" />
      <path {...gold} d="M102 50C114 44 124 52 122 63C120 72 110 76 102 70" />
      {/* trunk, curving to his left and ending in a soft curl */}
      <path {...line} d="M46 76C51 90 55 100 55 112C55 133 78 143 93 132C105 123 101 106 88 106C81 106 79 113 84 116" />
      <path {...line} d="M94 76C91 86 83 93 78 103C75 110 75 116 77 120" />
      <path {...gold} d="M59 88C64 91 72 91 79 88M59 98C64 101 70 101 75 99M60 108C64 110 69 110 73 108" />
      {/* eyes */}
      <path {...line} strokeWidth={2} d="M52 64C55 60 61 60 64 64C61 67 55 67 52 64Z" />
      <path {...line} strokeWidth={2} d="M76 64C79 60 85 60 88 64C85 67 79 67 76 64Z" />
      <circle className="gdot" cx={58} cy={63.5} r={1.6} fill={color} /><circle className="gdot" cx={82} cy={63.5} r={1.6} fill={color} />
      {/* tilak */}
      <path {...gold} strokeWidth={2} d="M63 44C63 52 66 56 70 57C74 56 77 52 77 44" />
      <circle className="gdot" cx={70} cy={50} r={2.2} fill={P.maroon} />
      {/* tusks: his right tusk is broken, as the story goes */}
      <path {...line} strokeWidth={2} d="M47 84C42 86 39 90 40 95C45 94 49 91 50 87" />
      <path {...line} strokeWidth={2} d="M92 84C96 90 100 98 104 102C106 94 101 86 95 80" />
    </svg>
  );
}
