"use client";
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/** Pictures and panels rise softly the first time they reach the screen. Visible by default if this never runs. */
export function Reveals() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        gsap.to(e.target, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", clearProps: "transform" });
      }), { rootMargin: "0px 0px -8% 0px" });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight * .92) return;
        gsap.set(el, { opacity: 0, y: 28 });
        io.observe(el);
      });
      return () => io.disconnect();
    });
    return () => mm.revert();
  }, []);
  return null;
}
