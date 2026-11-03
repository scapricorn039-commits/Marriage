import type { NextRequest } from "next/server";
import { fail, json, withRepo } from "@/lib/server/http";

/** Holding the private token is what proves this is the guest's own link. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (token.length < 10 || token.length > 64) return fail("Invitation link not found.", 404);
  return withRepo(async (repo) => {
    const g = await repo.guestByToken(token);
    if (!g) return fail("Invitation link not found.", 404);
    const r = await repo.rsvpForGuest(g.id);
    return json({
      displayName: g.display_name, maxAttendees: g.max_attendees,
      rsvp: r && { attending: r.attending, attendees: r.attendees, functions: r.functions, dietary: r.dietary, message: r.message },
    });
  });
}
