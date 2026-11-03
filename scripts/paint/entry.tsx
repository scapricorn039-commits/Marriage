import { renderToStaticMarkup } from "react-dom/server";
import { scenes } from "./scenes";
(globalThis as unknown as { JOBS: unknown }).JOBS = Object.entries(scenes).map(([name, S]) => ({ name, w: S.w, h: S.h, scale: S.scale ?? 1, html: renderToStaticMarkup(<svg viewBox={`0 0 ${S.w} ${S.h}`} width={S.w} height={S.h}>{S.art()}</svg>) }));
