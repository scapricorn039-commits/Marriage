import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { coupleLine, wedding } from "@/config/wedding.config";
import { multifoil } from "@/components/art/paint";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Royal Aangan wedding invitation";

/** The card WhatsApp shows when the invitation link is shared. */
export default async function OG() {
  const font = await readFile(path.join(process.cwd(), "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff"));
  const arch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#F4ECDF"/><rect x="18" y="18" width="1164" height="594" fill="none" stroke="#B89A68" stroke-width="2"/><path d="${multifoil(280, 630, 640, 300, 250, 7)}" fill="#E8D9C3" stroke="#B89A68" stroke-width="3"/><path d="${multifoil(304, 630, 592, 312, 226, 7)}" fill="#F4ECDF" stroke="#B89A68"/></svg>`;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "Cormorant", color: "#713441" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src={`data:image/svg+xml;base64,${Buffer.from(arch).toString("base64")}`} width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
      <div style={{ fontSize: 66, marginTop: 110, textAlign: "center", maxWidth: 520, lineHeight: 1.05, display: "flex", justifyContent: "center" }}>{coupleLine()}</div>
      <div style={{ fontSize: 34, marginTop: 22, color: "#49372E" }}>{wedding.project.name}</div>
      <div style={{ fontSize: 26, marginTop: 8, color: "#49372E" }}>{wedding.city}</div>
    </div>,
    { ...size, fonts: [{ name: "Cormorant", data: font, weight: 500, style: "normal" }] },
  );
}
