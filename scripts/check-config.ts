import { wedding } from "../config/wedding.config";
import { friendsOnly } from "../config/friends-only";

const hits: string[] = [];
const walk = (v: unknown, p: string) => {
  if (typeof v === "string") { if (/\[[^\]]+\]|Bride's Name|Groom's Name|00000 00000|\.example/.test(v)) hits.push(`${p}: ${v}`); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
  else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, p ? `${p}.${k}` : k));
};
walk(wedding, ""); walk(friendsOnly, "");
wedding.events.filter((e) => !e.confirmed).forEach((e) => hits.push(`events: "${e.name}" is not confirmed, so it stays hidden in live mode`));
const missing = [...friendsOnly.story.map((s) => s.photo), wedding.destination.photo, ...friendsOnly.gallery].filter((p) => !p.src).length;
if (missing) hits.push(`photos: ${missing} still show a painting instead of your photograph`);

console.log(`Mode: ${wedding.mode}`);
if (hits.length) { console.log(`\n${hits.length} items still need your details:\n`); hits.forEach((h) => console.log(" - " + h)); process.exitCode = wedding.mode === "live" ? 1 : 0; }
else console.log("Everything looks filled in.");
