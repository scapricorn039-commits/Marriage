"use client";
import { wedding } from "@/config/wedding.config";
import { directionsUrl, mapUrl } from "@/lib/calendar";
import { MaskHeading } from "@/components/motion/MaskHeading";
import { S } from "@/components/ui/bits";
import { ArchPhoto } from "@/components/ui/ArchPhoto";
import { Journey } from "./Journey";

export const telHref = (p: string) => `tel:${p.replace(/\s+/g, "")}`;
export const whatsappHref = (p: string, text?: string) => `https://wa.me/${p.replace(/\D+/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export function Destination() {
  const d = wedding.destination, a = wedding.assistance;
  return (
    <section id="destination" className="room">
      <div className="room-inner">
        <MaskHeading lines={["Our celebration", "awaits you in Kota."]} />
        <Journey />
        <div className="dest">
          <div className="dest-venue">
            <div className="dest-photo"><ArchPhoto photo={d.photo} shape="multifoil" ratio="4 / 5" sizes="(min-width: 900px) 300px, 60vw" /></div>
            <h3 className="t-chapter"><S>{d.venueName}</S></h3>
            <p><S>{d.address}</S></p>
            <div className="actions">
              <a className="btn" href={directionsUrl(d.mapsQuery)} target="_blank" rel="noreferrer" data-directions>Get directions</a>
              <a className="btn btn-line" href={mapUrl(d.mapsQuery)} target="_blank" rel="noreferrer">Open in Google Maps</a>
            </div>
          </div>
          <div className="ledger">
            <div><h3>Where to stay</h3>{d.stays.map((s) => <p key={s.name}><S>{s.name}</S>: <S>{s.note}</S></p>)}</div>
            <div><h3>Wedding assistance</h3><p><S>{a.name}</S>, <S>{a.phone}</S></p>
              <p className="ledger-links"><a className="link" href={telHref(a.phone)}>Call</a><a className="link" href={whatsappHref(a.phone)} target="_blank" rel="noreferrer">Message on WhatsApp</a></p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
