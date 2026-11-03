import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";

export type GuestRow = { id: string; token: string; display_name: string; max_attendees: number | null; audience: "family" | "friends"; created_at: string };
export type RsvpRow = { id: string; guest_id: string | null; guest_name: string; attending: boolean; attendees: number; functions: string[]; dietary: string | null; message: string | null; ip_hash: string | null; created_at: string; updated_at: string };
export type BlessingStatus = "pending" | "approved" | "rejected";
export type BlessingRow = { id: string; name: string; family: string | null; message: string; status: BlessingStatus; ip_hash: string | null; created_at: string };
export type SongRow = { id: string; title: string; artist: string | null; suggested_by: string | null; dedupe_key: string; ip_hash: string | null; created_at: string };
type Throttled = "rsvps" | "blessings" | "songs";

export interface Repo {
  guestByToken(token: string): Promise<GuestRow | null>;
  rsvpForGuest(guestId: string): Promise<RsvpRow | null>;
  saveRsvp(row: Omit<RsvpRow, "id" | "created_at" | "updated_at">): Promise<void>;
  addBlessing(row: Pick<BlessingRow, "name" | "family" | "message" | "ip_hash">): Promise<void>;
  approvedBlessings(): Promise<BlessingRow[]>;
  addSong(row: Pick<SongRow, "title" | "artist" | "suggested_by" | "dedupe_key" | "ip_hash">): Promise<{ duplicate: boolean }>;
  recentCount(table: Throttled, ipHash: string, sinceIso: string): Promise<number>;
  listGuests(): Promise<GuestRow[]>;
  addGuest(displayName: string, maxAttendees: number | null, audience: "family" | "friends"): Promise<GuestRow>;
  deleteGuest(id: string): Promise<void>;
  listRsvps(): Promise<RsvpRow[]>;
  listBlessings(): Promise<BlessingRow[]>;
  setBlessingStatus(id: string, status: BlessingStatus): Promise<void>;
  listSongs(): Promise<SongRow[]>;
  deleteSong(id: string): Promise<void>;
}

const newToken = () => randomBytes(12).toString("base64url");

function must<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

class SupabaseRepo implements Repo {
  constructor(private db: SupabaseClient) {}
  async guestByToken(token: string) { return must(await this.db.from("guests").select("*").eq("token", token).maybeSingle()) as GuestRow | null; }
  async rsvpForGuest(id: string) { return must(await this.db.from("rsvps").select("*").eq("guest_id", id).maybeSingle()) as RsvpRow | null; }
  async saveRsvp(row: Omit<RsvpRow, "id" | "created_at" | "updated_at">) {
    const payload = { ...row, updated_at: new Date().toISOString() };
    if (row.guest_id) must(await this.db.from("rsvps").upsert(payload, { onConflict: "guest_id" }));
    else must(await this.db.from("rsvps").insert(payload));
  }
  async addBlessing(row: Pick<BlessingRow, "name" | "family" | "message" | "ip_hash">) { must(await this.db.from("blessings").insert({ ...row, status: "pending" })); }
  async approvedBlessings() { return must(await this.db.from("blessings").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(60)) as BlessingRow[]; }
  async addSong(row: Pick<SongRow, "title" | "artist" | "suggested_by" | "dedupe_key" | "ip_hash">) {
    const { error } = await this.db.from("songs").insert(row);
    if (error?.code === "23505") return { duplicate: true };
    if (error) throw new Error(error.message);
    return { duplicate: false };
  }
  async recentCount(table: Throttled, ipHash: string, since: string) {
    const r = await this.db.from(table).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
    if (r.error) throw new Error(r.error.message);
    return r.count ?? 0;
  }
  async listGuests() { return must(await this.db.from("guests").select("*").order("created_at", { ascending: false })) as GuestRow[]; }
  async addGuest(display_name: string, max_attendees: number | null, audience: "family" | "friends") { return must(await this.db.from("guests").insert({ display_name, max_attendees, audience, token: newToken() }).select("*").single()) as GuestRow; }
  async deleteGuest(id: string) { must(await this.db.from("guests").delete().eq("id", id)); }
  async listRsvps() { return must(await this.db.from("rsvps").select("*").order("updated_at", { ascending: false })) as RsvpRow[]; }
  async listBlessings() { return must(await this.db.from("blessings").select("*").order("created_at", { ascending: false })) as BlessingRow[]; }
  async setBlessingStatus(id: string, status: BlessingStatus) { must(await this.db.from("blessings").update({ status }).eq("id", id)); }
  async listSongs() { return must(await this.db.from("songs").select("*").order("created_at", { ascending: false })) as SongRow[]; }
  async deleteSong(id: string) { must(await this.db.from("songs").delete().eq("id", id)); }
}

/** A plain file on disk, so the whole site can be tried on a computer before Supabase is set up. */
type Store = { guests: GuestRow[]; rsvps: RsvpRow[]; blessings: BlessingRow[]; songs: SongRow[] };
class FileRepo implements Repo {
  private file = path.join(process.cwd(), ".data", "store.json");
  private queue: Promise<unknown> = Promise.resolve();
  private async load(): Promise<Store> {
    try { return JSON.parse(await fs.readFile(this.file, "utf8")); } catch { return { guests: [], rsvps: [], blessings: [], songs: [] }; }
  }
  private change<T>(fn: (s: Store) => T): Promise<T> {
    const job = this.queue.then(async () => {
      const s = await this.load();
      const out = fn(s);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, JSON.stringify(s, null, 2));
      return out;
    });
    this.queue = job.catch(() => undefined);
    return job;
  }
  async guestByToken(t: string) { return (await this.load()).guests.find((g) => g.token === t) ?? null; }
  async rsvpForGuest(id: string) { return (await this.load()).rsvps.find((r) => r.guest_id === id) ?? null; }
  async saveRsvp(row: Omit<RsvpRow, "id" | "created_at" | "updated_at">) {
    const now = new Date().toISOString();
    await this.change((s) => {
      const hit = row.guest_id ? s.rsvps.find((r) => r.guest_id === row.guest_id) : undefined;
      if (hit) Object.assign(hit, row, { updated_at: now });
      else s.rsvps.push({ ...row, id: randomUUID(), created_at: now, updated_at: now });
    });
  }
  async addBlessing(row: Pick<BlessingRow, "name" | "family" | "message" | "ip_hash">) {
    await this.change((s) => { s.blessings.push({ ...row, id: randomUUID(), status: "pending", created_at: new Date().toISOString() }); });
  }
  async approvedBlessings() { return (await this.listBlessings()).filter((b) => b.status === "approved").slice(0, 60); }
  async addSong(row: Pick<SongRow, "title" | "artist" | "suggested_by" | "dedupe_key" | "ip_hash">) {
    return this.change((s) => {
      if (s.songs.some((x) => x.dedupe_key === row.dedupe_key)) return { duplicate: true };
      s.songs.push({ ...row, id: randomUUID(), created_at: new Date().toISOString() });
      return { duplicate: false };
    });
  }
  async recentCount(t: Throttled, ip: string, since: string) {
    const s = await this.load();
    return (s[t] as { ip_hash: string | null; created_at: string }[]).filter((r) => r.ip_hash === ip && r.created_at >= since).length;
  }
  async listGuests() { return (await this.load()).guests.slice().reverse(); }
  async addGuest(display_name: string, max_attendees: number | null, audience: "family" | "friends") {
    return this.change((s) => { const g = { id: randomUUID(), token: newToken(), display_name, max_attendees, audience, created_at: new Date().toISOString() }; s.guests.push(g); return g; });
  }
  async deleteGuest(id: string) { await this.change((s) => { s.guests = s.guests.filter((g) => g.id !== id); s.rsvps.forEach((r) => { if (r.guest_id === id) r.guest_id = null; }); }); }
  async listRsvps() { return (await this.load()).rsvps.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)); }
  async listBlessings() { return (await this.load()).blessings.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)); }
  async setBlessingStatus(id: string, status: BlessingStatus) { await this.change((s) => { const b = s.blessings.find((x) => x.id === id); if (b) b.status = status; }); }
  async listSongs() { return (await this.load()).songs.slice().reverse(); }
  async deleteSong(id: string) { await this.change((s) => { s.songs = s.songs.filter((x) => x.id !== id); }); }
}

let cached: Repo | null = null;

/** Returns null when a live site has no database connected, so routes can say so plainly. */
export function getRepo(): Repo | null {
  if (cached) return cached;
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NODE_ENV, ALLOW_FILE_STORE } = process.env;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    cached = new SupabaseRepo(createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }));
  } else if (NODE_ENV !== "production" || ALLOW_FILE_STORE === "1") {
    cached = new FileRepo();
  }
  return cached;
}
