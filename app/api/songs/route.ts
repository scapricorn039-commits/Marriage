import type { NextRequest } from "next/server";
import { clean, fail, HOUR_AGO, ipHash, json, readBody, withRepo } from "@/lib/server/http";

export async function POST(req: NextRequest) {
  const b = await readBody(req);
  if (!b) return fail("We could not read that song. Please try again.");
  if (b.website) return json({ duplicate: false });
  const title = clean(b.title, 120), artist = clean(b.artist, 120);
  if (!title) return fail("Please add the song name.");
  const dedupe_key = `${title}|${artist}`.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}|]+/gu, "");

  return withRepo(async (repo) => {
    const ip = ipHash(req);
    if ((await repo.recentCount("songs", ip, HOUR_AGO())) >= 5) return fail("Five songs in an hour is the house limit. Please come back later.", 429);
    const r = await repo.addSong({ title, artist: artist || null, suggested_by: clean(b.suggestedBy, 80) || null, dedupe_key, ip_hash: ip });
    return json(r);
  });
}
