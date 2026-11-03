// Development tool: renders the drawings, then runs the watercolour pass into public/art.
import { createRequire } from "node:module";
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const root = process.cwd(), tmp = process.env.PAINT_TMP, only = process.argv[2];
const { chromium } = createRequire(tmp + "/")("playwright");
mkdirSync(tmp, { recursive: true }); mkdirSync("public/art", { recursive: true });
const js = await build({ entryPoints: ["scripts/paint/entry.tsx"], bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, alias: { "@": root }, logLevel: "error" });
const font = (rel, weight, style = "normal") => `@font-face{font-family:'Cormorant Garamond';font-weight:${weight};font-style:${style};src:url(file://${root}/node_modules/@fontsource/cormorant-garamond/files/${rel})}`;
const css = font("cormorant-garamond-latin-500-normal.woff2", 500) + font("cormorant-garamond-latin-400-italic.woff2", 400, "italic") + `:root{--font-display:'Cormorant Garamond'}html,body{margin:0;background:transparent}svg{display:block}.fill{width:100%;height:100%}svg:not([width]){width:100%;height:100%}`;
writeFileSync(path.join(tmp, "base.css"), css);
writeFileSync(path.join(tmp, "jobs.js"), js.outputFiles[0].text);
writeFileSync(path.join(tmp, "base.html"), `<!doctype html><meta charset=utf-8><link rel=stylesheet href=base.css><div id=r></div><script src=jobs.js></script>`);
const b = await chromium.launch();
const p0 = await b.newPage(); await p0.goto(`file://${tmp}/base.html`);
const jobs = (await p0.evaluate(() => globalThis.JOBS)).filter((j) => !only || j.name.includes(only));
await p0.close();
const list = [];
for (const j of jobs) {
  const c = await b.newContext({ viewport: { width: Math.ceil(j.w), height: Math.ceil(j.h) }, deviceScaleFactor: j.scale });
  const p = await c.newPage(); await p.goto(`file://${tmp}/base.html`);
  await p.evaluate(async ({ html, css }) => { document.getElementById("r").innerHTML = (css ? `<style>${css}</style>` : "") + html; await document.fonts.ready; }, j);
  await p.waitForTimeout(150);
  const raw = path.join(tmp, j.name + ".png");
  await p.screenshot({ path: raw, omitBackground: true });
  list.push(`${raw} ${root}/public/art/${j.name}.webp ${j.name.startsWith("v-") ? 0.8 : j.w > 1900 ? 1.1 : j.scale} ${66}`);
  await c.close();
}
await b.close();
writeFileSync(path.join(tmp, "list.txt"), list.join("\n") + "\n");
console.log(execFileSync("python3", ["scripts/paint/watercolour.py", path.join(tmp, "list.txt")], { encoding: "utf8", maxBuffer: 1e8 }).trim().split("\n").length, "painted");
