"use client";
import { useEffect, useRef } from "react";

const SKYLINE = "M0 200V120H70V96H96V120H170V86C170 62 198 56 214 30C230 56 258 62 258 86V120H330V100H352V120H430V94H452V70C452 50 476 44 490 22C504 44 528 50 528 70V94H552V120H640V100H662V120H740V88C740 64 768 58 784 32C800 58 828 64 828 88V120H900V96H926V120H1000V200Z";

/** Value that eases from 0 to 1 as p travels from a to b. */
const ramp = (p: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (p - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * One whole day, told in the page's own pastels:
 * dawn at the first page, morning, soft midday, golden afternoon, a red dusk, twilight, then night at the farewell.
 * Each sky blends into the next, and the sun climbs and sets on a single arc.
 */
export function Sky() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current!, html = document.documentElement;
    html.classList.add("sky-on");
    const $ = <T extends HTMLElement | SVGElement>(s: string) => el.querySelector<T>(s)!;
    const dawn = $<HTMLElement>(".sky-dawn"), gold = $<HTMLElement>(".sky-gold"), dusk = $<HTMLElement>(".sky-dusk"), late = $<HTMLElement>(".sky-late"), twilight = $<HTMLElement>(".sky-twilight"), night = $<HTMLElement>(".sky-night");
    const sun = $<HTMLElement>(".sky-sun"), warm = $<HTMLElement>(".sun-warm"), moon = $<HTMLElement>(".sky-moon"), stars = $<HTMLElement>(".sky-stars");
    const lineDay = $<SVGElement>(".line-day"), lineNight = $<SVGElement>(".line-night"), windows = $<HTMLElement>(".sky-windows"), line = $<HTMLElement>(".sky-line");
    const cloudA = $<SVGElement>(".sky-cloud-a"), cloudB = $<SVGElement>(".sky-cloud-b"), birds = $<SVGElement>(".sky-birds");
    let cur = -1, raf = 0, dayEnd = 1, nightEnd = 1;

    const measure = () => {
      const f = document.getElementById("farewell"), vh = window.innerHeight;
      const top = f ? f.getBoundingClientRect().top + window.scrollY : document.documentElement.scrollHeight;
      dayEnd = Math.max(1, top - vh);  /* the red of dusk is complete as the RSVP form ends */
      nightEnd = top + vh;             /* then the sky takes two full screens to reach night */
    };
    /* 0 to .8 is the day across the page; .8 to 1 is nightfall. */
    const target = () => { const y = window.scrollY; return y <= dayEnd ? (y / dayEnd) * .8 : .8 + Math.min(1, (y - dayEnd) / (nightEnd - dayEnd)) * .2; };

    const paint = (p: number) => {
      dawn.style.opacity = String(1 - ramp(p, .02, .2));
      /* Every colour starts before the last one has finished, so no step is ever visible. */
      gold.style.opacity = String(ramp(p, .36, .6));
      dusk.style.opacity = String(ramp(p, .54, .76));
      late.style.opacity = String(ramp(p, .77, .9));
      twilight.style.opacity = String(ramp(p, .85, .95));
      night.style.opacity = String(ramp(p, .91, 1));
      stars.style.opacity = String(ramp(p, .92, 1));
      /* The sun rises from behind the skyline at dawn and sets behind it at the end of dusk. */
      const t = Math.min(1, p / .86), arc = Math.sin(t * Math.PI), vw = window.innerWidth;
      const x = (.08 + t * .84) * vw, y = window.innerHeight * (.86 - arc * .72), size = 1 + (1 - arc) * .35;
      sun.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${size.toFixed(3)})`;
      warm.style.opacity = String(1 - Math.min(1, arc * 1.5));
      sun.style.opacity = String(.34 + (1 - arc) * .4);
      sun.style.visibility = t >= 1 ? "hidden" : "visible";
      const m = ramp(p, .9, 1);
      moon.style.opacity = String(m);
      /* On a very short screen the moon drifts up so it stays clear of the closing words. */
      const lift = window.innerHeight < 620 ? Math.max(0, window.scrollY - nightEnd) * .3 : 0;
      moon.style.transform = `translate3d(0, calc(${((1 - m) * 26).toFixed(2)}vh - ${lift.toFixed(1)}px), 0)`;
      lineDay.style.opacity = String((1 - ramp(p, .78, .93)) * .16);
      lineNight.style.opacity = String(ramp(p, .78, .93) * .92);
      windows.style.opacity = String(ramp(p, .9, 1));
      line.style.transform = `translate3d(0, ${((1 - p) * 5).toFixed(2)}vh, 0)`;
      const clouds = (1 - ramp(p, .7, .86));
      cloudA.style.opacity = String(.4 * clouds); cloudB.style.opacity = String(.3 * clouds);
      cloudA.style.transform = `translate3d(${(-8 + p * 44).toFixed(2)}vw, 0, 0)`;
      cloudB.style.transform = `translate3d(${(6 - p * 38).toFixed(2)}vw, 0, 0)`;
      const bp = ramp(p, .25, .62);
      birds.style.opacity = String(bp > 0 && bp < 1 ? .4 : 0);
      birds.style.transform = `translate3d(${(-14 + bp * 120).toFixed(2)}vw, ${(4 - bp * 9).toFixed(2)}vh, 0)`;
      html.classList.toggle("is-night", p > .96);
    };
    const frame = () => {
      const goal = target();
      if (cur < 0) cur = goal;
      cur += (goal - cur) * .12;
      if (Math.abs(goal - cur) < .0002) cur = goal;
      paint(cur);
      el.dataset.p = cur.toFixed(3);
      raf = cur === goal ? 0 : requestAnimationFrame(frame);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
    measure(); wake();
    addEventListener("scroll", wake, { passive: true });
    const ro = new ResizeObserver(() => { measure(); wake(); });
    ro.observe(document.body);
    return () => { removeEventListener("scroll", wake); ro.disconnect(); if (raf) cancelAnimationFrame(raf); html.classList.remove("sky-on", "is-night"); };
  }, []);
  return (
    <div ref={root} className="sky" aria-hidden="true" data-p="0">
      <div className="sky-layer sky-dawn" />
      <div className="sky-layer sky-gold" />
      <div className="sky-layer sky-dusk" />
      <div className="sky-layer sky-late" />
      <div className="sky-layer sky-twilight" />
      <div className="sky-layer sky-night" />
      <div className="sky-stars">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ left: `${(i * 29 + 7) % 100}%`, top: `${(i * 47 + 5) % 32}%`, animationDelay: `${(i % 7) * .6}s` }} />)}</div>
      <div className="sky-moon" />
      <div className="sky-sun"><span className="sun-warm" /></div>
      <svg className="sky-cloud sky-cloud-a" viewBox="-130 -40 260 70"><path d="M-120 12C-96 -14 -64 -10 -50 0C-30 -30 20 -28 34 0C60 -10 96 -4 116 14C50 26 -60 26 -120 12Z" /></svg>
      <svg className="sky-cloud sky-cloud-b" viewBox="-130 -40 260 70"><path d="M-120 12C-96 -14 -64 -10 -50 0C-30 -30 20 -28 34 0C60 -10 96 -4 116 14C50 26 -60 26 -120 12Z" /></svg>
      <svg className="sky-birds" viewBox="0 0 90 40"><path d="M2 20q12 -12 22 0q10 -12 22 0M50 8q9 -9 17 0q8 -9 17 0" /></svg>
      <div className="sky-line">
        <svg className="line-day" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMax slice"><path d={SKYLINE} /></svg>
        <svg className="line-night" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMax slice"><path d={SKYLINE} /></svg>
        <div className="sky-windows">{[6, 15, 24, 36, 45, 58, 66, 78, 88, 96].map((x, i) => <i key={x} style={{ left: `${x}%`, bottom: `${18 + (i % 3) * 10}%`, animationDelay: `${i * .4}s` }} />)}</div>
      </div>
    </div>
  );
}
