"use client";
import { useEffect, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { visibleEvents, wedding } from "@/config/wedding.config";
import { submitRsvp } from "@/lib/api-client";
import { useGuest } from "@/lib/guest-context";
import { MaskHeading } from "@/components/motion/MaskHeading";
import { Pic } from "@/components/art/Painted";
import { DemoNote, WaxSeal } from "@/components/ui/bits";
import { P } from "@/components/art/paint";

export function Rsvp() {
  const { guest, token } = useGuest();
  const events = visibleEvents();
  const max = guest?.maxAttendees ?? 20;
  const [v, set] = useState({ guestName: "", attending: null as boolean | null, attendees: 1, functions: [] as string[], dietary: "", dietaryNote: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<null | { attending: boolean; name: string }>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!guest) return;
    const r = guest.rsvp;
    const known = wedding.dietaryOptions.includes(r?.dietary ?? "");
    set((s) => ({
      ...s, guestName: guest.displayName, attending: r ? r.attending : null, attendees: r?.attendees || 1, functions: r?.functions ?? [],
      dietary: known ? r!.dietary! : r?.dietary ? "Other" : "", dietaryNote: known ? "" : r?.dietary ?? "", message: r?.message ?? "",
    }));
  }, [guest]);

  const toggleFn = (id: string) => set((s) => ({ ...s, functions: s.functions.includes(id) ? s.functions.filter((f) => f !== id) : [...s.functions, id] }));

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!v.guestName.trim()) { setErr("Please add your name or family name."); return; }
    if (v.attending === null) { setErr("Please tell us whether you can attend."); return; }
    setBusy(true); setErr("");
    const dietary = v.dietary === "Other" ? v.dietaryNote : v.dietary;
    const r = await submitRsvp({ guestName: v.guestName, attending: v.attending, attendees: v.attending ? v.attendees : 0, functions: v.functions, dietary, message: v.message, token: token ?? undefined, website: v.website });
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    setDone({ attending: v.attending, name: v.guestName.trim() });
  };

  return (
    <section id="rsvp" className="room">
      <div className="room-inner rsvp-grid">
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <MaskHeading className="t-room" lines={["We would be", "honoured to", "celebrate with you."]} />
          <div className="rsvp-art" data-reveal><Pic name="scene-lanterns" /></div>
          {guest && <p className="t-sub" style={{ color: P.maroon, fontStyle: "italic" }}>This invitation was prepared for {guest.displayName}{guest.maxAttendees ? `, with seats for ${guest.maxAttendees}` : ""}.</p>}
        </div>
        <div className="rsvp-sheet" data-perch="tr">
          {done ? (
            <div style={{ display: "grid", gap: "1rem", justifyItems: "center", textAlign: "center", paddingBlock: "1.5rem" }} aria-live="polite" data-rsvp-done>
              <motion.div initial={reduced ? false : { scale: 2.3, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}><WaxSeal size={110} /></motion.div>
              <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} style={{ display: "grid", gap: ".6rem", justifyItems: "center" }}>
                <p className="t-room" style={{ fontSize: "clamp(2rem, 6vw, 3rem)", color: P.maroon }}>{done.attending ? "Your place is saved." : "We will miss you."}</p>
                <p className="t-body">{done.attending ? `Thank you, ${done.name}. The courtyard will be brighter for having you in it.` : `Thank you for letting us know, ${done.name}. You will be in our thoughts on the day.`}</p>
                <button type="button" className="btn btn-line" onClick={() => setDone(null)}>Change my response</button>
              </motion.div>
            </div>
          ) : (
            <form onSubmit={send} style={{ display: "grid", gap: "1.25rem" }} noValidate>
              <div className="field"><label htmlFor="r-name">Guest or family name</label><input id="r-name" className="input" autoComplete="name" maxLength={120} value={v.guestName} onChange={(e) => set({ ...v, guestName: e.target.value })} required /></div>
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="legend" style={{ marginBottom: ".4rem" }}>Will you join us?</legend>
                <div className="toggle-row">
                  <label className="toggle"><input type="radio" name="attending" checked={v.attending === true} onChange={() => set({ ...v, attending: true })} />Joyfully, yes</label>
                  <label className="toggle"><input type="radio" name="attending" checked={v.attending === false} onChange={() => set({ ...v, attending: false })} />Sadly, no</label>
                </div>
              </fieldset>
              {v.attending && (
                <motion.div initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gap: "1.25rem" }}>
                  <div className="field">
                    <span className="legend" id="r-count-l">Number of attendees</span>
                    <div className="stepper" role="group" aria-labelledby="r-count-l">
                      <button type="button" aria-label="One fewer" disabled={v.attendees <= 1} onClick={() => set({ ...v, attendees: Math.max(1, v.attendees - 1) })}>−</button>
                      <output aria-live="polite" id="r-count">{v.attendees}</output>
                      <button type="button" aria-label="One more" disabled={v.attendees >= max} onClick={() => set({ ...v, attendees: Math.min(max, v.attendees + 1) })}>+</button>
                    </div>
                  </div>
                  {events.length > 0 && (
                    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                      <legend className="legend" style={{ marginBottom: ".4rem" }}>Functions you plan to attend</legend>
                      <div className="fn-row">
                        {events.map((f) => <label className="fn" key={f.id}><input type="checkbox" checked={v.functions.includes(f.id)} onChange={() => toggleFn(f.id)} />{f.name}</label>)}
                      </div>
                    </fieldset>
                  )}
                  <div className="field">
                    <label htmlFor="r-diet">Dietary preference (optional)</label>
                    <select id="r-diet" className="input" value={v.dietary} onChange={(e) => set({ ...v, dietary: e.target.value })}>
                      <option value="">No preference</option>
                      {wedding.dietaryOptions.map((o) => <option key={o}>{o}</option>)}
                      <option value="Other">Other</option>
                    </select>
                    {v.dietary === "Other" && <input aria-label="Tell us your dietary preference" className="input" maxLength={300} value={v.dietaryNote} onChange={(e) => set({ ...v, dietaryNote: e.target.value })} placeholder="Tell us what to prepare" />}
                  </div>
                </motion.div>
              )}
              <div className="field"><label htmlFor="r-msg">Message (optional)</label><textarea id="r-msg" className="input" rows={2} maxLength={1000} value={v.message} onChange={(e) => set({ ...v, message: e.target.value })} /></div>
              <div className="hp" aria-hidden="true"><label htmlFor="r-website">Leave this empty</label><input id="r-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set({ ...v, website: e.target.value })} /></div>
              {err && <p className="form-error" role="alert">{err}</p>}
              <div><button type="submit" className="btn" disabled={busy}>{busy ? "Sending" : "Send my response"}</button></div>
              <p className="t-note">Only the couple can see your response.</p>
              <DemoNote />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
