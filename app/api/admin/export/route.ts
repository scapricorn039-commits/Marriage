import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/server/http";

/** Spreadsheet download. A leading apostrophe stops a guest's text being run as a spreadsheet formula. */
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
export async function GET() {
  return adminRoute(async (repo) => {
    const rows = await repo.listRsvps();
    const head = ["Name", "Attending", "Guests", "Functions", "Dietary", "Message", "Updated"];
    const body = rows.map((r) => [r.guest_name, r.attending ? "Yes" : "No", r.attendees, r.functions.join("; "), r.dietary, r.message, r.updated_at].map(cell).join(","));
    return new NextResponse([head.map(cell).join(","), ...body].join("\r\n"), {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="rsvps.csv"' },
    });
  });
}
