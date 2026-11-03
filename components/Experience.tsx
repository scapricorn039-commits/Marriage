"use client";
import { useEffect, useState, type ReactNode } from "react";
import { GuestProvider } from "@/lib/guest-context";
import { AudienceProvider } from "@/lib/audience";
import { isPreview, type Audience } from "@/config/wedding.config";
import { DEMO } from "@/lib/api-client";
import { ClipDefs } from "@/components/ui/ArchPhoto";
import { ToastHost } from "@/components/ui/bits";
import { Nav } from "@/components/ui/Nav";
import { Cursor } from "@/components/ui/Cursor";
import { ButterflyFlight } from "@/components/motion/ButterflyFlight";
import { Sky } from "@/components/motion/Sky";
import { Reveals } from "@/components/motion/Reveals";
import { Entrance } from "@/components/sections/Entrance";
import { Invitation } from "@/components/sections/Invitation";
import { Celebrations } from "@/components/sections/Celebrations";
import { Destination } from "@/components/sections/Destination";
import { FunCorner } from "@/components/sections/FunCorner";
import { Blessings } from "@/components/sections/Blessings";
import { Rsvp } from "@/components/sections/Rsvp";
import { Farewell } from "@/components/sections/Farewell";

function Ribbon({ audience, onSwitch }: { audience: Audience; onSwitch?: (a: Audience) => void }) {
  const [show, setShow] = useState(isPreview());
  /* On a phone it waits until the guest has left the first page, so it never covers the button. */
  const [away, setAway] = useState(false);
  useEffect(() => {
    const f = () => setAway(window.innerWidth >= 1024 || window.scrollY > window.innerHeight * .55);
    f(); addEventListener("scroll", f, { passive: true }); addEventListener("resize", f);
    return () => { removeEventListener("scroll", f); removeEventListener("resize", f); };
  }, []);
  if (!show) return null;
  return (
    <aside className="ribbon" data-ribbon data-away={away}>
      <div>
        <span>Preview. Dotted text and paintings are samples to replace.</span>
        {onSwitch && <span className="ribbon-switch" role="group" aria-label="View the invitation as">{(["friends", "family"] as Audience[]).map((a) => <button key={a} type="button" aria-pressed={audience === a} onClick={() => onSwitch(a)} data-view={a}>{a === "friends" ? "Friends" : "Family"}</button>)}</span>}
      </div>
      <button type="button" className="ribbon-x" aria-label="Dismiss this note" onClick={() => setShow(false)}>×</button>
    </aside>
  );
}

/** The whole invitation. Story and Moments arrive only from the friends page. */
export function Experience({ audience, story, moments, onSwitch }: { audience: Audience; story?: ReactNode; moments?: ReactNode; onSwitch?: (a: Audience) => void }) {
  return (
    <AudienceProvider value={audience}>
      <GuestProvider>
        <ToastHost>
          <ClipDefs />
          <Sky />
          <Nav />
          <Cursor />
          <Reveals />
          <div className="page" data-audience={audience}>
            <ButterflyFlight />
            <Entrance />
            <main>
              <Invitation />
              {story}
              <Celebrations />
              <Destination />
              {moments}
              <FunCorner />
              <Blessings />
              <Rsvp />
            </main>
            <Farewell />
          </div>
          <Ribbon audience={audience} onSwitch={DEMO ? onSwitch : undefined} />
        </ToastHost>
      </GuestProvider>
    </AudienceProvider>
  );
}
