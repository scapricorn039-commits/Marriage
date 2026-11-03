import type { NextRequest } from "next/server";
import { clean, cleanLong, fail, HOUR_AGO, ipHash, json, readBody, withRepo } from "@/lib/server/http";

/** Only approved blessings leave the server, and only the fields shown on the page. */
export async function GET() {
  return withRepo(async (repo) => {
    const rows = await repo.approvedBlessings();
    return json({ blessings: rows.map((r) => ({ id: r.id, name: r.name, family: r.family, message: r.message, createdAt: r.created_at })) });
  });
}

export async function POST(req: NextRequest) {
  const b = await readBody(req);
  if (!b) return fail("We could not read that note. Please try again.");
  if (b.website) return json({});
  const name = clean(b.name, 80), message = cleanLong(b.message, 800);
  if (!name) return fail("Please add your name.");
  if (message.length < 2) return fail("Please write a few words for the couple.");

  return withRepo(async (repo) => {
    const ip = ipHash(req);
    if ((await repo.recentCount("blessings", ip, HOUR_AGO())) >= 6) return fail("You have left several blessings already. Please try again in an hour.", 429);
    await repo.addBlessing({ name, family: clean(b.family, 80) || null, message, ip_hash: ip });
    return json({});
  });
}
