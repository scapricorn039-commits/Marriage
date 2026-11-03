/**
 * Everything the browser sends to the backend passes through here.
 * The preview build sets NEXT_PUBLIC_DEMO=1 and keeps entries in this browser only.
 */
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export type Result<T = object> = { ok: true; data: T } | { ok: false; error: string };
export type PublicBlessing = { id: string; name: string; family: string | null; message: string; createdAt: string };
export type GuestInfo = {
  displayName: string;
  maxAttendees: number | null;
  rsvp: null | { attending: boolean; attendees: number; functions: string[]; dietary: string | null; message: string | null };
};
export type RsvpInput = { guestName: string; attending: boolean; attendees: number; functions: string[]; dietary: string; message: string; token?: string; website?: string };
export type BlessingInput = { name: string; family: string; message: string; website?: string };
export type SongInput = { title: string; artist: string; suggestedBy: string; website?: string };

const demoRead = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? "") as T; } catch { return d; } };
const demoWrite = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage may be blocked */ } };
const pause = () => new Promise((r) => setTimeout(r, 450));

async function send<T>(url: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error ?? "We could not save that. Check your connection and try again." };
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "We could not reach the haveli. Check your connection and try again." };
  }
}
const post = <T,>(url: string, body: unknown) => send<T>(url, { method: "POST", body: JSON.stringify(body) });

export async function submitRsvp(input: RsvpInput) {
  if (DEMO) { await pause(); demoWrite("demo-rsvp", input); return { ok: true, data: {} } as Result; }
  return post("/api/rsvp", input);
}
export async function submitBlessing(input: BlessingInput) {
  if (DEMO) { await pause(); return { ok: true, data: {} } as Result; }
  return post("/api/guestbook", input);
}
export async function fetchBlessings(): Promise<PublicBlessing[]> {
  if (DEMO) return [];
  const r = await send<{ blessings: PublicBlessing[] }>("/api/guestbook");
  return r.ok ? r.data.blessings : [];
}
export async function submitSong(input: SongInput): Promise<Result<{ duplicate: boolean }>> {
  if (DEMO) {
    await pause();
    const key = `${input.title}|${input.artist}`.toLowerCase().replace(/[^a-z0-9|]/g, "");
    const seen = demoRead<string[]>("demo-songs", []);
    const duplicate = seen.includes(key);
    if (!duplicate) demoWrite("demo-songs", [...seen, key]);
    return { ok: true, data: { duplicate } };
  }
  return post("/api/songs", input);
}
export async function fetchGuest(token: string): Promise<GuestInfo | null> {
  if (DEMO) return null;
  const r = await send<GuestInfo>(`/api/guest?token=${encodeURIComponent(token)}`);
  return r.ok ? r.data : null;
}
