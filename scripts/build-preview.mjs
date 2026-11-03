// Builds one self-contained HTML page of the invitation for sharing a look.
// Entries stay in the viewer's browser, because a single page has no server.
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd(), out = path.join(root, "dist-preview");
mkdirSync(out, { recursive: true });

const js = await build({
  entryPoints: ["preview/entry.tsx"], bundle: true, minify: true, write: false, format: "iife", target: "es2020", jsx: "automatic", charset: "utf8",
  define: { "process.env.NEXT_PUBLIC_DEMO": '"1"', "process.env.NODE_ENV": '"production"' },
  alias: { "next/image": path.join(root, "preview/shim-image.tsx"), "@": root },
  logLevel: "error",
});

execSync(`npx @tailwindcss/cli -i app/globals.css -o dist-preview/site.css --minify`, { stdio: "ignore" });
const css = readFileSync(path.join(out, "site.css"), "utf8");
const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const fonts = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Noto+Serif+Devanagari:wght@400&display=swap";

const html = `<title>Royal Aangan Minimal</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>${css}</style>
<div id="root"></div>
<script>${code}</script>
`;
writeFileSync(path.join(out, "royal-aangan.html"), html);
cpSync("public/art", path.join(out, "art"), { recursive: true });
console.log(`dist-preview/royal-aangan.html ${(html.length / 1024).toFixed(0)} KB`);
