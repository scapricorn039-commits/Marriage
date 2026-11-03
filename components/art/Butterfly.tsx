import { P } from "./paint";

const UPPER = "M1 -4C8 -26 26 -46 44 -41C55 -37 50 -12 30 -2C18 3 8 2 1 1Z";
const LOWER = "M1 3C14 2 31 6 33 20C34 34 18 39 10 29C5 21 2 12 1 6Z";

function Wing({ fill, line }: { fill: string; line: string }) {
  return (
    <>
      <path d={UPPER} fill={fill} stroke={line} strokeWidth={0.9} />
      <path d={LOWER} fill={fill} stroke={line} strokeWidth={0.9} />
      <g fill="none" stroke={line} strokeWidth={0.6}>
        <path d="M2 -2C12 -14 26 -28 40 -36M2 -1C16 -8 32 -14 46 -22M3 5C10 8 20 14 26 26" />
      </g>
      <circle cx={41} cy={-30} r={2.4} fill={line} /><circle cx={25} cy={25} r={2} fill={line} />
    </>
  );
}

/** An original butterfly, seen from above. Wings scale from the body. */
export function ButterflyMark({ fill = P.maroon, line = P.goldPale, body = P.brown }: { fill?: string; line?: string; body?: string }) {
  return (
    <g>
      <g className="wing wing-r"><Wing fill={fill} line={line} /></g>
      <g className="wing wing-l"><Wing fill={fill} line={line} /></g>
      <path d="M0 -10C2 -10 2.400 -6 2 0L1 16C.5 18 -.5 18 -1 16L-2 0C-2.400 -6 -2 -10 0 -10Z" fill={body} stroke={line} strokeWidth={0.4} />
      <path d="M-.5 -10C-2 -18 -6 -22 -10 -24M.5 -10C2 -18 6 -22 10 -24" fill="none" stroke={body} strokeWidth={0.8} />
    </g>
  );
}
