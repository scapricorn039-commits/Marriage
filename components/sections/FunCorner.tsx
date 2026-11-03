"use client";
import { MaskHeading } from "@/components/motion/MaskHeading";
import { Quiz } from "@/components/activities/Quiz";
import { Hearts } from "@/components/activities/Hearts";
import { SongBox } from "@/components/activities/SongBox";

export function FunCorner() {
  return (
    <section id="fun" className="room">
      <div className="room-inner">
        <MaskHeading lines={["The wedding", "fun corner."]} />
        <p className="t-body" style={{ marginTop: "1rem" }}>Three small games for anyone with a minute to spare. Play any, or none.</p>
        <div className="fun"><Quiz /><Hearts /><SongBox /></div>
      </div>
    </section>
  );
}
