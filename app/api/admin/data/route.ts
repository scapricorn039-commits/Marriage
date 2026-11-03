import { adminRoute, json } from "@/lib/server/http";

export async function GET() {
  return adminRoute(async (repo) => {
    const [guests, rsvps, blessings, songs] = await Promise.all([repo.listGuests(), repo.listRsvps(), repo.listBlessings(), repo.listSongs()]);
    const strip = <T extends { ip_hash: string | null }>(rows: T[]) => rows.map(({ ip_hash: _omit, ...rest }) => rest);
    return json({ guests, rsvps: strip(rsvps), blessings: strip(blessings), songs: strip(songs) });
  });
}
