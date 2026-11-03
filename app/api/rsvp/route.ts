import type { NextRequest } from "next/server";
import { clean, cleanLong, fail, HOUR_AGO, ipHash, json, readBody, withRepo } from "@/lib/server/http";
import { visibleEvents } from "@/config/wedding.config";

export async function POST(req: NextRequest) {
  const b = await readBody(req);
  if (!b) return fail("We could not read that form. Please try again.");
  if (b.website) return json({}); // Hidden field only bots fill in.

  return withRepo(async (repo) => {
    const ip = ipHash(req);
    if ((await repo.recentCount("rsvps", ip, HOUR_AGO())) >= 15) return fail("Too many responses from this connection. Please try again in an hour.", 429);

    const guest = typeof b.token === "string" && b.token ? await repo.guestByToken(b.token) : null;
    if (b.token && !guest) return fail("This personal invitation link is not valid. Ask the couple for a fresh link.", 403);

    const guest_name = clean(b.guestName, 120) || guest?.display_name || "";
    if (!guest_name) return fail("Please add your name or family name.");
    if (typeof b.attending !== "boolean") return fail("Please tell us whether you can attend.");

    const known = new Set(visibleEvents().map((e) => e.id));
    const functions = Array.isArray(b.functions) ? b.functions.filter((f): f is string => typeof f === "string" && known.has(f)) : [];
    const count = Math.floor(Number(b.attendees));
    let attendees = 0;
    if (b.attending) {
      if (!Number.isFinite(count) || count < 1 || count > 50) return fail("Please enter how many people are coming.");
      if (guest?.max_attendees && count > guest.max_attendees) return fail(`Your invitation includes up to ${guest.max_attendees} ${guest.max_attendees === 1 ? "guest" : "guests"}.`);
      attendees = count;
    }

    await repo.saveRsvp({
      guest_id: guest?.id ?? null, guest_name, attending: b.attending, attendees,
      functions: b.attending ? functions : [],
      dietary: clean(b.dietary, 300) || null, message: cleanLong(b.message, 1000) || null, ip_hash: ip,
    });
    return json({});
  });
}
