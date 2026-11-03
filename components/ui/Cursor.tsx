"use client";
import { useEffect, useRef, useState } from "react";

/** A small gold lozenge trailing the pointer on desktop. The native cursor always stays. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches); }, []);
  useEffect(() => {
    if (!on) return;
    let x = -40, y = -40, cx = -40, cy = -40, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      ref.current?.classList.toggle("hot", !!(e.target as Element)?.closest?.("a,button,label,input,textarea,select"));
    };
    const tick = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; if (ref.current) ref.current.style.transform = `translate3d(${cx}px,${cy}px,0) rotate(45deg)`; raf = requestAnimationFrame(tick); };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [on]);
  return on ? <div ref={ref} className="cursor-dot" aria-hidden="true" /> : null;
}
