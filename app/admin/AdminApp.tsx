"use client";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { visibleEvents } from "@/config/wedding.config";

type Guest = { id: string; token: string; display_name: string; max_attendees: number | null; audience?: "family" | "friends" };
type Rsvp = { id: string; guest_id: string | null; guest_name: string; attending: boolean; attendees: number; functions: string[]; dietary: string | null; message: string | null; updated_at: string };
type Blessing = { id: string; name: string; family: string | null; message: string; status: "pending" | "approved" | "rejected"; created_at: string };
type Song = { id: string; title: string; artist: string | null; suggested_by: string | null };
type Data = { guests: Guest[]; rsvps: Rsvp[]; blessings: Blessing[]; songs: Song[] };

const call = (url: string, method: string, body?: unknown) => fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const send = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await call("/api/admin/login", "POST", { password: pw });
    setBusy(false);
    if (r.ok) onDone(); else setErr((await r.json().catch(() => ({}))).error ?? "Could not sign in.");
  };
  return (
    <form onSubmit={send} style={{ maxWidth: 380, display: "grid", gap: "1rem", marginTop: "2rem" }}>
      <div className="field"><label htmlFor="pw">Password</label><input id="pw" type="password" className="input" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
      {err && <p className="form-error" role="alert">{err}</p>}
      <div><button className="btn" disabled={busy}>Sign in</button></div>
    </form>
  );
}

export function AdminApp() {
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "login" | "ready" | "error">("loading");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"rsvps" | "blessings" | "songs" | "guests">("rsvps");
  const [ng, setNg] = useState({ name: "", max: "", audience: "family" });

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/data");
    if (r.status === 401) { setState("login"); return; }
    if (!r.ok) { setMsg((await r.json().catch(() => ({}))).error ?? "Could not load data."); setState("error"); return; }
    setData(await r.json()); setState("ready");
  }, []);
  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const yes = data?.rsvps.filter((r) => r.attending) ?? [];
    const seen = new Map<string, number>();
    data?.rsvps.forEach((r) => { const k = r.guest_name.trim().toLowerCase(); seen.set(k, (seen.get(k) ?? 0) + 1); });
    return {
      yes: yes.length, no: (data?.rsvps.length ?? 0) - yes.length, people: yes.reduce((a, r) => a + r.attendees, 0),
      perFn: visibleEvents().map((e) => ({ name: e.name, n: yes.filter((r) => r.functions.includes(e.id)).reduce((a, r) => a + r.attendees, 0) })),
      dupes: seen,
    };
  }, [data]);

  const decide = async (id: string, status: Blessing["status"]) => { await call("/api/admin/blessings", "PATCH", { id, status }); load(); };
  const addGuest = async (e: FormEvent) => {
    e.preventDefault();
    const r = await call("/api/admin/guests", "POST", { displayName: ng.name, maxAttendees: ng.max ? Number(ng.max) : null, audience: ng.audience });
    if (r.ok) { setNg({ name: "", max: "", audience: ng.audience }); load(); } else setMsg((await r.json()).error);
  };
  const removeGuest = async (id: string) => { await call("/api/admin/guests", "DELETE", { id }); load(); };
  const removeSong = async (id: string) => { await call("/api/admin/songs", "DELETE", { id }); load(); };
  const link = (t: string, a?: string) => `${window.location.origin}/${a === "friends" ? "friends" : "family"}?g=${t}`;

  return (
    <div className="admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <h1 className="t-room" style={{ fontSize: "2.6rem" }}>The couple&apos;s desk</h1>
        {state === "ready" && <button className="btn btn-line" onClick={async () => { await call("/api/admin/login", "DELETE"); setData(null); setState("login"); }}>Sign out</button>}
      </div>
      {state === "loading" && <p>Opening the desk.</p>}
      {state === "login" && <Login onDone={load} />}
      {state === "error" && <p className="form-error" role="alert">{msg}</p>}
      {state === "ready" && data && (
        <>
          <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginTop: "1.2rem", borderBottom: "1px solid var(--color-gold)" }}>
            {([["rsvps", `RSVPs (${data.rsvps.length})`], ["blessings", `Blessings (${data.blessings.filter((b) => b.status === "pending").length} to read)`], ["songs", `Songs (${data.songs.length})`], ["guests", `Guest links (${data.guests.length})`]] as const).map(([k, l]) => (
              <button key={k} role="tab" className="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            {tab === "rsvps" && (
              <>
                <p className="t-sub">{totals.people} people coming, from {totals.yes} responses. {totals.no} cannot attend.</p>
                <p className="t-note" style={{ marginBlock: ".4rem 1rem" }}>{totals.perFn.map((f) => `${f.name}: ${f.n}`).join(". ")}</p>
                <p style={{ marginBottom: "1rem" }}><a className="btn btn-line" href="/api/admin/export">Download spreadsheet</a></p>
                <div className="scroll-x"><table>
                  <thead><tr><th>Name</th><th>Attending</th><th>Guests</th><th>Functions</th><th>Dietary</th><th>Message</th></tr></thead>
                  <tbody>{data.rsvps.map((r) => <tr key={r.id}><td>{r.guest_name}{(totals.dupes.get(r.guest_name.trim().toLowerCase()) ?? 0) > 1 ? " (possible duplicate)" : ""}</td><td>{r.attending ? "Yes" : "No"}</td><td>{r.attendees}</td><td>{r.functions.join(", ")}</td><td>{r.dietary}</td><td>{r.message}</td></tr>)}</tbody>
                </table></div>
                {data.rsvps.length === 0 && <p>No responses yet. Send your guest links to get the first one.</p>}
              </>
            )}
            {tab === "blessings" && (
              <div style={{ display: "grid", gap: "1rem" }}>
                {data.blessings.length === 0 && <p>No blessings yet.</p>}
                {data.blessings.map((b) => (
                  <article key={b.id} style={{ borderBottom: "1px solid var(--color-gold)", paddingBottom: "1rem" }} data-blessing={b.status}>
                    <p className="hand">{b.message}</p>
                    <p className="t-note">{b.name}{b.family ? `, ${b.family}` : ""}. Status: {b.status}</p>
                    <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem", flexWrap: "wrap" }}>
                      {b.status !== "approved" && <button className="btn" onClick={() => decide(b.id, "approved")}>Show in the book</button>}
                      {b.status !== "rejected" && <button className="btn btn-line" onClick={() => decide(b.id, "rejected")}>Keep private</button>}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {tab === "songs" && (
              <div className="scroll-x"><table>
                <thead><tr><th>Song</th><th>Singer or film</th><th>Suggested by</th><th></th></tr></thead>
                <tbody>{data.songs.map((s) => <tr key={s.id}><td>{s.title}</td><td>{s.artist}</td><td>{s.suggested_by}</td><td><button className="link" style={{ background: "none", border: 0 }} onClick={() => removeSong(s.id)}>Remove</button></td></tr>)}</tbody>
              </table>{data.songs.length === 0 && <p style={{ marginTop: "1rem" }}>No songs suggested yet.</p>}</div>
            )}
            {tab === "guests" && (
              <>
                <form onSubmit={addGuest} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end", marginBottom: "1.5rem" }}>
                  <div className="field" style={{ flex: "1 1 240px" }}><label htmlFor="ng">Guest or family name</label><input id="ng" className="input" value={ng.name} onChange={(e) => setNg({ ...ng, name: e.target.value })} /></div>
                  <div className="field" style={{ width: 130 }}><label htmlFor="nm">Seats (optional)</label><input id="nm" className="input" inputMode="numeric" value={ng.max} onChange={(e) => setNg({ ...ng, max: e.target.value.replace(/\D/g, "") })} /></div>
                  <div className="field" style={{ width: 140 }}><label htmlFor="na">Page</label><select id="na" className="input" value={ng.audience} onChange={(e) => setNg({ ...ng, audience: e.target.value })}><option value="family">Family</option><option value="friends">Friends</option></select></div>
                  <button className="btn">Create personal link</button>
                </form>
                {msg && <p className="form-error" role="alert">{msg}</p>}
                <div className="scroll-x"><table>
                  <thead><tr><th>Guest</th><th>Page</th><th>Seats</th><th>Response</th><th>Link</th><th></th></tr></thead>
                  <tbody>{data.guests.map((g) => {
                    const r = data.rsvps.find((x) => x.guest_id === g.id);
                    return <tr key={g.id}><td>{g.display_name}</td><td>{g.audience === "friends" ? "Friends" : "Family"}</td><td>{g.max_attendees ?? "Any"}</td><td>{r ? (r.attending ? `Yes, ${r.attendees}` : "No") : "Waiting"}</td>
                      <td><code data-link style={{ fontSize: ".8rem", wordBreak: "break-all" }}>{link(g.token, g.audience)}</code><br />
                        <a className="link" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`You are invited. Your personal invitation: ${link(g.token, g.audience)}`)}`}>Send on WhatsApp</a></td>
                      <td><button className="link" style={{ background: "none", border: 0 }} onClick={() => removeGuest(g.id)}>Delete</button></td></tr>;
                  })}</tbody>
                </table></div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
