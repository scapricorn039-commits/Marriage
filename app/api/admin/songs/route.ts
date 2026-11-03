import type { NextRequest } from "next/server";
import { adminRoute, fail, json, readBody } from "@/lib/server/http";

export async function DELETE(req: NextRequest) {
  const b = await readBody(req);
  if (typeof b?.id !== "string") return fail("Missing song.");
  const id = b.id;
  return adminRoute(async (repo) => { await repo.deleteSong(id); return json({}); });
}
