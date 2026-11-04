"use client";
import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding.config";
import { saveTheDateItem } from "@/lib/calendar";
import { Monogram } from "@/components/art/Monogram";
import { ButterflyMark } from "@/components/art/Butterfly";
import { CalendarButton, S, useToast } from "@/components/ui/bits";
import { P } from "@/components/art/paint";
import { telHref, whatsappHref } from "./Destination";

const SHARE_TEXT = () => `${wedding.project.name}: ${wedding.couple.bride.name} & ${wedding.couple.groom.name} invite you to celebrate in ${wedding.city}.`;
/** A shared link keeps the page but never the guest's private ?g= token. */
const shareUrl = () => `${window.location.origin}${window.location.pathname}`;

/** Night has fallen. The two butterflies meet, and the page closes on one quiet screen. */
export function Farewell() {
  const toast = useToast();
  const [canShare, setCanShare] = useState(false);
  const [waText, setWaText] = useState(SHARE_TEXT());
  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
    setWaText(`${SHARE_TEXT()}\n\n${shareUrl()}`);
  }, []);
  const share = async () => {
    const url = shareUrl();
    try { if (navigator.share) { await navigator.share({ title: wedding.project.name, text: SHARE_TEXT(), url }); return; } }
    catch (e) { if ((e as Error).name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); toast("Invitation link copied."); } catch { toast(`Copy this link: ${url}`); }
  };
  const top = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return (
    <section id="farewell" className="farewell on-dark" aria-label="The Final Farewell">
      <div className="fare-close">
        <div className="meeting">
          <Monogram size={72} color={P.gold} />
          <span className="meet-perch" data-perch="tc" />
          <svg className="still-butterfly still-meet" viewBox="-50 -50 100 100" aria-hidden="true"><ButterflyMark fill={P.gold} /></svg>
          <svg className="partner" viewBox="-50 -50 100 100" aria-hidden="true"><ButterflyMark fill={P.rose} line={P.ivory} body={P.goldPale} /></svg>
        </div>
        <p className="fare-line" data-reveal>{wedding.farewell.message}</p>
        <p className="fare-final" data-reveal>{wedding.farewell.closing}</p>
        <div className="fare-sign" data-reveal>
          <p className="fare-love">With love,</p>
          <p className="fare-names"><S>{wedding.couple.bride.name}</S><em>&amp;</em><S>{wedding.couple.groom.name}</S></p>
        </div>
        <div className="lamps" aria-hidden="true" data-reveal>{Array.from({ length: 5 }, (_, i) => <span key={i} className="lamp" />)}</div>
        <footer className="fare-foot">
        <div className="actions">
          <CalendarButton item={saveTheDateItem()} label="Save the date" variant="btn btn-gold" />
          <button type="button" className="btn btn-line" onClick={share} data-share>{canShare ? "Share invitation" : "Copy invitation link"}</button>
          <a className="btn btn-line" href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer" data-wa>Send on WhatsApp</a>
        </div>
        <p className="fare-help">Need help on the way? <S>{wedding.assistance.name}</S>, <a href={telHref(wedding.assistance.phone)}><S>{wedding.assistance.phone}</S></a> or <a href={whatsappHref(wedding.assistance.phone)} target="_blank" rel="noreferrer">WhatsApp</a></p>
        <button type="button" onClick={top} className="fare-top" data-top>Back to the top</button>
        </footer>
      </div>
    </section>
  );
}
