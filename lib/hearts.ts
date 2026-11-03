"use client";
import { useEffect, useState } from "react";

const KEY = "aangan-hearts";
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; } };
const listeners = new Set<(v: string[]) => void>();

export function collectHeart(id: string) {
  const next = Array.from(new Set([...read(), id]));
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* still works for this page view */ }
  memory = next;
  listeners.forEach((l) => l(next));
}
let memory: string[] | null = null;

export function useHearts() {
  const [found, setFound] = useState<string[]>([]);
  useEffect(() => {
    setFound(memory ?? read());
    listeners.add(setFound);
    return () => { listeners.delete(setFound); };
  }, []);
  return found;
}
