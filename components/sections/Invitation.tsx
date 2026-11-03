"use client";
import { wedding } from "@/config/wedding.config";
import { fmtDate, fmtDay, fmtTime, saveTheDateItem } from "@/lib/calendar";
import { useGuest } from "@/lib/guest-context";
import { CalendarButton, S } from "@/components/ui/bits";
import { Countdown } from "./Countdown";

export function Invitation() {
  const { guest } = useGuest();
  const { invitation: inv, couple, weddingDateTime, city } = wedding;
  return (
    <section id="invitation" className="room">
      <div className="room-inner invite">
        {guest && <p className="t-sub" style={{ fontStyle: "italic" }}>Dear {guest.displayName},</p>}
        <p className="lede">{inv.message}</p>
        <h1 className="names">
          <span className="name"><S>{couple.bride.name}</S></span>
          <span className="amp" data-perch="tc">&amp;</span>
          <span className="name"><S>{couple.groom.name}</S></span>
        </h1>
        <p className="invite-family"><S>{inv.brideFamily}</S> and <S>{inv.groomFamily}</S> {inv.familyWording}.</p>
        <div className="invite-when">
          <p className="t-sub"><S>{fmtDate(weddingDateTime)}</S></p>
          <p><S>{fmtDay(weddingDateTime).split(",")[0]}, {fmtTime(weddingDateTime)} IST</S>, {city}</p>
        </div>
        <CalendarButton item={saveTheDateItem()} label="Save the date" variant="btn btn-line" />
        <Countdown />
      </div>
    </section>
  );
}
