"use client";
import { friendsOnly } from "@/config/friends-only";
import { MaskHeading } from "@/components/motion/MaskHeading";
import { ArchPhoto } from "@/components/ui/ArchPhoto";
import { S } from "@/components/ui/bits";

export function Story() {
  return (
    <section id="story" className="room">
      <div className="room-inner">
        <MaskHeading lines={["Every love story has", "its own beautiful chapters.", "Here's ours."]} />
        <div className="chapters">
          {friendsOnly.story.map((c, i) => (
            <article className="chapter" key={c.title}>
              <div className="chapter-photo" data-perch={i % 2 ? "tr" : "tl"}><ArchPhoto photo={c.photo} shape="multifoil" ratio="4 / 5" sizes="(min-width: 900px) 420px, 90vw" /></div>
              <div className="chapter-text">
                <p className="t-note"><S>{c.when}</S></p>
                <h3 className="t-chapter">{c.title}</h3>
                <p className="t-body"><S>{c.caption}</S></p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
