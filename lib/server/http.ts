import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getRepo, type Repo } from "./repo";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
export const fail = (error: string, status = 400) => json({ error }, status);

const secret = () => process.env.APP_SECRET || process.env.ADMIN_PASSWORD || "local-development-only";

export function ipHash(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(`${secret()}|${ip}`).digest("hex").slice(0, 32);
}

export const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max) : "");
export const cleanLong = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ").trim().slice(0, max) : "");

export async function readBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  try { const b = await req.json(); return b && typeof b === "object" && !Array.isArray(b) ? b : null; } catch { return null; }
}

/** Runs a public route with the database, and turns unexpected failures into a plain message. */
export async function withRepo(fn: (repo: Repo) => Promise<NextResponse>) {
  const repo = getRepo();
  if (!repo) return fail("This part of the invitation is not connected yet. Please contact the wedding helpline.", 503);
  try { return await fn(repo); } catch (e) {
    console.error(e);
    return fail("We could not save that just now. Please try again in a minute.", 500);
  }
}

export const HOUR_AGO = () => new Date(Date.now() - 3600e3).toISOString();

const COOKIE = "aangan_admin";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
export async function startAdminSession() {
  const exp = String(Date.now() + 7 * 24 * 3600e3);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" && process.env.ALLOW_FILE_STORE !== "1", path: "/", maxAge: 7 * 24 * 3600 });
}
export async function endAdminSession() { (await cookies()).delete(COOKIE); }
export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function adminRoute(fn: (repo: Repo) => Promise<NextResponse>) {
  if (!(await isAdmin())) return fail("Please sign in again.", 401);
  return withRepo(fn);
}
