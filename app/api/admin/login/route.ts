import type { NextRequest } from "next/server";
import { endAdminSession, fail, json, passwordMatches, readBody, startAdminSession } from "@/lib/server/http";

export async function POST(req: NextRequest) {
  const b = await readBody(req);
  if (!process.env.ADMIN_PASSWORD) return fail("Set ADMIN_PASSWORD in the site settings first.", 503);
  if (typeof b?.password !== "string" || !passwordMatches(b.password)) {
    await new Promise((r) => setTimeout(r, 600));
    return fail("That password is not right.", 401);
  }
  await startAdminSession();
  return json({});
}
export async function DELETE() { await endAdminSession(); return json({}); }
