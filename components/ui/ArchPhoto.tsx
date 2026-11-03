"use client";
import Image from "next/image";
import type { Photo } from "@/config/wedding.config";
import { Vignette } from "@/components/art/Vignettes";
import { multifoil, ogee, P } from "@/components/art/paint";

export type ArchShape = "multifoil" | "ogee" | "jharokha" | "plain";

const outline: Record<ArchShape, string> = {
  multifoil: multifoil(0, 1000, 1000, 400, 400, 6),
  ogee: ogee(0, 1000, 1000, 340, 340),
  jharokha: multifoil(0, 1000, 1000, 210, 210, 4, 0.9),
  plain: "M0 0H1000V1000H0Z",
};

/** Shared clip shapes for jharokha image masks. Rendered once near the top of the page. */
export function ClipDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        {Object.entries(outline).map(([k, d]) => <clipPath key={k} id={`clip-${k}`} clipPathUnits="objectBoundingBox"><path transform="scale(.001)" d={d} /></clipPath>)}
        <clipPath id="clip-arch-tall" clipPathUnits="objectBoundingBox"><path transform="scale(.001)" d={multifoil(0, 1000, 1000, 300, 300, 5)} /></clipPath>
      </defs>
    </svg>
  );
}

export function PhotoArt({ photo, sizes, priority }: { photo: Photo; sizes: string; priority?: boolean }) {
  if (photo.src) return <Image className="art pic" src={photo.src} alt={photo.caption} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />;
  return <Vignette name={photo.vignette} className="art" />;
}

/** A photograph in an architectural frame. Becomes a button when it opens the viewer. */
export function ArchPhoto({ photo, shape = "multifoil", ratio = "4 / 5", sizes = "(min-width: 900px) 40vw, 90vw", onOpen, label }: { photo: Photo; shape?: ArchShape; ratio?: string; sizes?: string; onOpen?: () => void; label?: string }) {
  const inner = (
    <>
      <span className="clip" style={{ clipPath: `url(#clip-${shape})` }} data-frame-clip>
        <span data-frame-art style={{ display: "block", position: "relative", width: "100%", height: "100%" }}><PhotoArt photo={photo} sizes={sizes} /></span>
      </span>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="ink" aria-hidden="true">
        <path d={outline[shape]} fill="none" stroke={P.gold} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
    </>
  );
  const style = { aspectRatio: ratio };
  return onOpen
    ? <button type="button" className="arch-photo bare hover-photo" style={style} onClick={onOpen} aria-label={label ?? `Open: ${photo.caption}`} data-reveal>{inner}<span className="photo-cap">{photo.caption}</span></button>
    : <span className="arch-photo bare hover-photo" style={style} role="img" aria-label={photo.caption} data-reveal>{inner}</span>;
}
