"use client";
import { createElement, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/use-motion-ok";

/** Heading set in hand-chosen lines. Each line rises from behind a mask when reached. */
export function MaskHeading({ lines, as = "h2", className = "t-room", id }: { lines: string[]; as?: "h1" | "h2" | "h3"; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (prefersReducedMotion() || !el || el.getBoundingClientRect().top < window.innerHeight * 0.88) return;
    const spans = el.querySelectorAll(".mask-line > span");
    gsap.set(spans, { yPercent: 108 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      gsap.to(spans, { yPercent: 0, duration: 1.15, ease: "power3.out", stagger: 0.09 });
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => { io.disconnect(); gsap.killTweensOf(spans); gsap.set(spans, { clearProps: "all" }); };
  }, []);
  return createElement(as, { ref, className, id, "aria-label": lines.join(" ") },
    lines.map((l, i) => <span key={i} className="mask-line" aria-hidden="true"><span>{l}</span></span>));
}
