import type { NextRequest } from "next/server";
import { adminRoute, clean, fail, json, readBody } from "@/lib/server/http";

export async function POST(req: NextRequest) {
  const b = await readBody(req);
  const name = clean(b?.displayName, 120);
  if (!name) return fail("Please add the guest or family name.");
  const raw = Number(b?.maxAttendees);
  const audience = b?.audience === "friends" ? "friends" : "family";
  const max = Number.isInteger(raw) && raw >= 1 && raw <= 50 ? raw : null;
  return adminRoute(async (repo) => json({ guest: await repo.addGuest(name, max, audience) }));
}
export async function DELETE(req: NextRequest) {
  const b = await readBody(req);
  if (typeof b?.id !== "string") return fail("Missing guest.");
  const id = b.id;
  return adminRoute(async (repo) => { await repo.deleteGuest(id); return json({}); });
}
