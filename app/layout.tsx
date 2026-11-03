import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource-variable/dm-sans/index.css";
import "@fontsource/noto-serif-devanagari/devanagari-400.css";
import "./globals.css";
import { coupleLine, wedding } from "@/config/wedding.config";

export const metadata: Metadata = {
  metadataBase: new URL(wedding.siteUrl),
  title: `${coupleLine()} | ${wedding.project.name}`,
  description: `${wedding.project.tagline} You are invited to celebrate in ${wedding.city}.`,
  icons: { icon: "/mark.svg" },
  robots: { index: false, follow: false },
  openGraph: { title: `${coupleLine()} | ${wedding.project.name}`, description: wedding.project.tagline, type: "website" },
};
export const viewport: Viewport = { themeColor: "#713441", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
