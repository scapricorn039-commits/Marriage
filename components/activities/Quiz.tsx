"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/config/wedding.config";
import { S } from "@/components/ui/bits";
import { P } from "@/components/art/paint";

function Burst() {
  const dots = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  return <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%" }}>{dots.map((a) => (
    <motion.i key={a} style={{ position: "absolute", width: 6, height: 9, borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%", background: P.goldPale }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: Math.cos(a) * 60, y: Math.sin(a) * 34, opacity: 0, rotate: 180 }} transition={{ duration: 0.8, ease: "easeOut" }} />
  ))}</span>;
}

export function Quiz() {
  const qs = wedding.quiz;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"bride" | "groom" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const q = qs[i];
  const choose = (who: "bride" | "groom") => { if (picked) return; setPicked(who); if (who === q.answer) setScore((s) => s + 1); };
  const next = () => { if (i + 1 === qs.length) setDone(true); else { setI(i + 1); setPicked(null); } };
  const reset = () => { setI(0); setPicked(null); setScore(0); setDone(false); };
  const state = (who: "bride" | "groom") => (!picked ? undefined : who === q.answer ? "right" : who === picked ? "wrong" : "idle");

  return (
    <div className="play-sheet fun-quiz">
      <header className="game-head">
        <h3 className="game-title" data-perch="tl">How well do you know us?</h3>
        <p className="game-intro">Five quick questions about the two of us. Guess who, then read the story behind it.</p>
      </header>
      <div className="game-body">
      <div className="quiz-progress" aria-hidden="true">{qs.map((_, x) => <i key={x} className={x < i + (picked || done ? 1 : 0) ? "on" : ""} />)}</div>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "grid", gap: ".8rem", justifyItems: "start" }}>
            <p className="quiz-q" style={{ color: P.maroon }}>You scored {score} of {qs.length}.</p>
            <p className="t-body">{score === qs.length ? "You know us better than we know ourselves." : score >= 3 ? "Close family, clearly." : "Come to the Sangeet. We will tell you everything."}</p>
            <button type="button" className="btn btn-line" onClick={reset}>Play again</button>
          </motion.div>
        ) : (
          <motion.div key={i} initial={{ opacity: 0, x: reduced ? 0 : 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -22 }} transition={{ duration: 0.32 }} style={{ display: "grid", gap: "1rem" }}>
            <p className="t-note">Question {i + 1} of {qs.length}</p>
            <p className="quiz-q">{q.question}</p>
            <div className="quiz-choices">
              {(["bride", "groom"] as const).map((who) => (
                <button type="button" key={who} className="choice" data-state={state(who)} disabled={!!picked} onClick={() => choose(who)}>
                  <S>{wedding.couple[who].name}</S>
                  {picked && who === q.answer && !reduced && <Burst />}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {picked && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gap: ".7rem", justifyItems: "start" }} aria-live="polite">
                  <p style={{ fontWeight: 500 }}>{picked === q.answer ? "Correct." : `It's ${wedding.couple[q.answer].name}.`}</p>
                  <p><S>{q.reveal}</S></p>
                  <button type="button" className="btn" onClick={next}>{i + 1 === qs.length ? "See my score" : "Next question"}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
