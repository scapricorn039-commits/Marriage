import type { NextRequest } from "next/server";
import { adminRoute, fail, json, readBody } from "@/lib/server/http";

export async function PATCH(req: NextRequest) {
  const b = await readBody(req);
  const status = b?.status;
  if (typeof b?.id !== "string" || (status !== "approved" && status !== "rejected" && status !== "pending")) return fail("Missing blessing or decision.");
  const id = b.id;
  return adminRoute(async (repo) => { await repo.setBlessingStatus(id, status); return json({}); });
}
