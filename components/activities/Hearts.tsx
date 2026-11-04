"use client";
import { AnimatePresence, motion } from "framer-motion";
import { wedding } from "@/config/wedding.config";
import { useHearts } from "@/lib/hearts";
import { HEART_IDS, HeartShape } from "@/components/ui/HiddenHeart";
import { S, WaxSeal } from "@/components/ui/bits";
import { P } from "@/components/art/paint";
import { scrollToRoom } from "@/lib/use-motion-ok";

const hints: Record<(typeof HEART_IDS)[number], { room: string; text: string; go: string }> = {
  arch: { room: "entrance", text: "One sits on the first page, near the lamps.", go: "Go to the first page" },
  lake: { room: "destination", text: "One floats on the river in Ujjain.", go: "Go to the river" },
  book: { room: "blessings", text: "One is tucked beside the guest book.", go: "Go to the book" },
};

export function Hearts() {
  const found = useHearts();
  const all = HEART_IDS.every((h) => found.includes(h));
  return (
    <div className="play-sheet fun-hearts">
      <header className="game-head">
        <h3 className="game-title">Find the hidden hearts</h3>
        <p className="game-intro">Three small hearts are hidden on this page. Find them all to open a secret from the couple.</p>
      </header>
      <div className="game-body">
      <div className="heart-slots" role="img" aria-label={`${found.length} of 3 hearts found`}>
        {HEART_IDS.map((h) => (
          <motion.span key={h} animate={found.includes(h) ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.5 }}>
            <HeartShape size={30} fill={found.includes(h) ? P.rose : "transparent"} />
          </motion.span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {all ? (
          <motion.div key="secret" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: ".3rem" }}>
              <motion.div initial={{ scale: 1.6, rotate: -14, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 240, damping: 16 }} style={{ flex: "none" }}><WaxSeal size={58} /></motion.div>
              <div>
                <p style={{ fontWeight: 500 }}>A secret from the couple</p>
                <p className="hand" data-secret><S>{wedding.secretMessage}</S></p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.ul key="hints" exit={{ opacity: 0 }} style={{ display: "grid", gap: ".55rem" }}>
            {HEART_IDS.filter((h) => !found.includes(h)).map((h) => (
              <li key={h}>{hints[h].text} <button type="button" className="link" style={{ background: "none", border: 0, padding: 0, minHeight: 28 }} onClick={() => scrollToRoom(hints[h].room)}>{hints[h].go}</button></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
