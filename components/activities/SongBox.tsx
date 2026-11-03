"use client";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitSong } from "@/lib/api-client";
import { DemoNote } from "@/components/ui/bits";

export function SongBox() {
  const [v, set] = useState({ title: "", artist: "", suggestedBy: "", website: "" });
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!v.title.trim()) { setErr("Please add the song name."); return; }
    setStatus("busy"); setErr(""); setNote("");
    const r = await submitSong(v);
    setStatus("idle");
    if (!r.ok) { setErr(r.error); return; }
    setNote(r.data.duplicate ? `"${v.title.trim()}" is already on the list. Good taste runs in this family.` : `"${v.title.trim()}" is on the list for the celebration.`);
    set((s) => ({ ...s, title: "", artist: "" }));
  };
  return (
    <form className="play-sheet fun-song" onSubmit={send} noValidate>
      <header className="game-head">
        <h3 className="game-title">Choose a song for our celebration</h3>
        <p className="game-intro">Tell us what should get everyone dancing at the Sangeet.</p>
      </header>
      <div className="game-body">
        <div className="field"><label htmlFor="song-title">Song name</label><input id="song-title" className="input" maxLength={120} value={v.title} onChange={(e) => set({ ...v, title: e.target.value })} required /></div>
        <div className="field"><label htmlFor="song-artist">Singer or film (optional)</label><input id="song-artist" className="input" maxLength={120} value={v.artist} onChange={(e) => set({ ...v, artist: e.target.value })} /></div>
        <div className="field"><label htmlFor="song-by">Your name (optional)</label><input id="song-by" className="input" maxLength={80} autoComplete="name" value={v.suggestedBy} onChange={(e) => set({ ...v, suggestedBy: e.target.value })} /></div>
        <div className="hp" aria-hidden="true"><label htmlFor="song-website">Leave this empty</label><input id="song-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set({ ...v, website: e.target.value })} /></div>
        {err && <p className="form-error" role="alert">{err}</p>}
        <AnimatePresence>{note && <motion.p key={note} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} aria-live="polite" className="hand" data-song-note>{note}</motion.p>}</AnimatePresence>
        <div><button type="submit" className="btn" disabled={status === "busy"}>{status === "busy" ? "Adding" : "Suggest this song"}</button></div>
        <DemoNote />
      </div>
    </form>
  );
}
