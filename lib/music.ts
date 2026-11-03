"use client";
import { wedding } from "@/config/wedding.config";

/**
 * Background sound, set in the `music` block of the config.
 * With `src` set, your own file plays. With `src` null, an original instrumental plays:
 * bansuri-style flute, tanpura and a soft temple bell, phrased in the eight-syllable lines of
 * the Vakratunda Mahakaya shloka (a traditional invocation of Ganesha). Each syllable is one
 * note and each line ends on a long held note, as it would when chanted.
 */
export type MusicEngine = { start(): Promise<boolean>; stop(): void; pause(): void; resume(): void };

const SA = 293.66; // D4
const N: Record<string, number> = { S: 0, R: 2, G: 4, M: 5, P: 7, D: 9, N: 11, "S'": 12, "R'": 14, ".D": -3, ".P": -5 };

/** Four lines of eight syllables. The final syllable of each line is held. */
export const PHRASES: string[][] = [
  ["S", "R", "G", "G", "P", "G", "R", "S"],
  ["R", "G", "P", "P", "D", "P", "G", "G"],
  ["P", "D", "S'", "S'", "D", "P", "G", "R"],
  ["G", "R", "S", "R", "G", "R", "S", "S"],
];
const BEAT = .62, HOLD = 2.1, BREATH = .9;

export function phraseLength(line: string[]) { return (line.length - 1) * BEAT + HOLD + BREATH; }
export function cycleLength() { return PHRASES.reduce((a, l) => a + phraseLength(l), 0); }

function noiseBuffer(ctx: BaseAudioContext) {
  const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function flute(ctx: BaseAudioContext, out: AudioNode, noise: AudioBuffer, f: number, from: number | null, at: number, len: number, vol: number) {
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = f * 4.5;
  o.type = "sine"; o2.type = "triangle";
  /* Each note slides up from the last, as a bansuri player would (meend). */
  o.frequency.setValueAtTime(from ?? f, at); o.frequency.exponentialRampToValueAtTime(f, at + .11);
  o2.frequency.setValueAtTime((from ?? f) * 2, at); o2.frequency.exponentialRampToValueAtTime(f * 2, at + .11);
  if (len > 1) {
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    vib.frequency.value = 4.7; vg.gain.setValueAtTime(0, at); vg.gain.linearRampToValueAtTime(f * .009, at + .9);
    vib.connect(vg); vg.connect(o.frequency); vib.start(at); vib.stop(at + len + .3);
  }
  g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .07); g.gain.setValueAtTime(vol, at + Math.max(.08, len - .22)); g.gain.exponentialRampToValueAtTime(.0005, at + len + .2);
  g2.gain.value = .14;
  o.connect(g); o2.connect(g2).connect(g); g.connect(lp).connect(out);
  o.start(at); o2.start(at); o.stop(at + len + .25); o2.stop(at + len + .25);
  const n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
  n.buffer = noise; n.loop = true; nf.type = "bandpass"; nf.frequency.value = f * 2.4; nf.Q.value = 2;
  ng.gain.setValueAtTime(0, at); ng.gain.linearRampToValueAtTime(vol * .05, at + .05); ng.gain.exponentialRampToValueAtTime(.0003, at + len + .1);
  n.connect(nf).connect(ng).connect(out); n.start(at, Math.random()); n.stop(at + len + .15);
}

function bell(ctx: BaseAudioContext, out: AudioNode, at: number, vol: number) {
  [[1, 1, 3.4], [2.76, .42, 2.2], [5.4, .18, 1.1], [8.9, .07, .6]].forEach(([r, a, t]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = SA * 2 * r;
    g.gain.setValueAtTime(vol * a, at); g.gain.exponentialRampToValueAtTime(.0002, at + t);
    o.connect(g).connect(out); o.start(at); o.stop(at + t + .05);
  });
}

function tanpura(ctx: BaseAudioContext, out: AudioNode, at: number, vol: number) {
  /* Pa, Sa, Sa, low Sa: the classic slow pluck order. */
  [[SA * .75, 0], [SA, 1.6], [SA, 3.2], [SA / 2, 4.8]].forEach(([f, d]) => {
    [1, 2, 3, 4, 5].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f * h * (1 + i * .0006);
      const v = vol / (h * 1.5), s = at + d;
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(v, s + .05); g.gain.exponentialRampToValueAtTime(.0004, s + 6);
      o.connect(g).connect(out); o.start(s); o.stop(s + 6.1);
    });
  });
}

/** Builds the room and master level. */
function graph(ctx: BaseAudioContext) {
  const master = ctx.createGain(), comp = ctx.createDynamicsCompressor();
  master.gain.value = .75;
  const delay = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(), lp = ctx.createBiquadFilter();
  delay.delayTime.value = .31; fb.gain.value = .36; wet.gain.value = .3; lp.type = "lowpass"; lp.frequency.value = 2400;
  master.connect(comp); comp.connect(ctx.destination);
  master.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(comp);
  return master;
}

/** Schedules one full cycle of the four lines. Returns when it ends. */
export function scheduleCycle(ctx: BaseAudioContext, master: AudioNode, noise: AudioBuffer, start: number) {
  let t = start, prev: number | null = null;
  for (let at = start; at < start + cycleLength(); at += 6.4) tanpura(ctx, master, at, .11);
  PHRASES.forEach((line, li) => {
    bell(ctx, master, t, li === 0 ? .08 : .045);
    line.forEach((syl, i) => {
      const last = i === line.length - 1, f = SA * Math.pow(2, N[syl] / 12), len = last ? HOLD : BEAT * .94;
      flute(ctx, master, noise, f, prev, t, len, .26);
      prev = f; t += last ? HOLD : BEAT;
    });
    t += BREATH;
  });
  return t;
}

export { graph as buildGraph, noiseBuffer };

function builtInEngine(): MusicEngine {
  let ctx: AudioContext | null = null, master: GainNode | null = null, noise: AudioBuffer | null = null, timer: ReturnType<typeof setTimeout> | undefined, next = 0;
  const pump = () => {
    if (!ctx || !master || !noise) return;
    if (next - ctx.currentTime < 8) next = scheduleCycle(ctx, master, noise, Math.max(next, ctx.currentTime + .15));
    timer = setTimeout(pump, 2500);
  };
  return {
    async start() {
      if (!ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctx = new AC();
        noise = noiseBuffer(ctx);
        master = graph(ctx);
      }
      await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 300))]);
      if (ctx.state !== "running") return false;
      if (!next) { next = ctx.currentTime + .2; pump(); }
      return true;
    },
    stop() { if (timer) clearTimeout(timer); timer = undefined; const c = ctx; ctx = null; master = null; next = 0; if (c) setTimeout(() => c.close().catch(() => {}), 60); },
    pause() { ctx?.suspend().catch(() => {}); },
    resume() { ctx?.resume().catch(() => {}); },
  };
}

/** Plays the file named in the config. If the file cannot be loaded, the built-in piece takes over. */
function fileEngine(src: string): MusicEngine {
  const { loop, volume, fadeInSeconds } = wedding.music;
  const target = Math.min(1, Math.max(0, volume));
  const audio = new Audio();
  audio.src = src; audio.loop = loop; audio.preload = "none";
  let fade: ReturnType<typeof setInterval> | undefined, fallback: MusicEngine | null = null, started = false;
  const fadeIn = () => {
    clearInterval(fade);
    if (fadeInSeconds <= 0) { audio.volume = target; return; }
    audio.volume = 0;
    const from = performance.now();
    fade = setInterval(() => {
      const t = Math.min(1, (performance.now() - from) / (fadeInSeconds * 1000));
      audio.volume = target * t;
      if (t >= 1) clearInterval(fade);
    }, 60);
  };
  return {
    async start() {
      if (fallback) return fallback.start();
      try {
        if (!started) fadeIn();
        await audio.play();
        started = true;
        return true;
      } catch (e) {
        if ((e as Error).name === "NotAllowedError") { clearInterval(fade); return false; }
        clearInterval(fade);
        console.warn(`Could not play ${src}. Check music.src in the config. Using the built-in piece instead.`);
        fallback = builtInEngine();
        return fallback.start();
      }
    },
    stop() { clearInterval(fade); audio.pause(); fallback?.stop(); },
    pause() { clearInterval(fade); if (started) audio.volume = target; audio.pause(); fallback?.pause(); },
    resume() { if (fallback) fallback.resume(); else audio.play().catch(() => {}); },
  };
}

export function createMusic(): MusicEngine {
  return wedding.music.src ? fileEngine(wedding.music.src) : builtInEngine();
}
