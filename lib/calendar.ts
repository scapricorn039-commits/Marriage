import { wedding } from "@/config/wedding.config";

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export type CalItem = { title: string; start: string; end: string; location: string; details: string };

export function googleCalendarUrl(c: CalItem) {
  const q = new URLSearchParams({
    action: "TEMPLATE", text: c.title, dates: `${utc(c.start)}/${utc(c.end)}`, location: c.location, details: c.details, ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function icsText(c: CalItem) {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Royal Aangan//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${utc(c.start)}-${c.title.replace(/\W+/g, "")}@royal-aangan`, `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART:${utc(c.start)}`, `DTEND:${utc(c.end)}`, `SUMMARY:${esc(c.title)}`, `LOCATION:${esc(c.location)}`, `DESCRIPTION:${esc(c.details)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(c: CalItem) {
  const url = URL.createObjectURL(new Blob([icsText(c)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.title.replace(/\W+/g, "-").toLowerCase()}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const directionsUrl = (q: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
export const mapUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const IST = "Asia/Kolkata";
export const fmtDate = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
export const fmtDay = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
export const fmtTime = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso)).replace(/\s?(am|pm)/i, (m) => " " + m.trim().toLowerCase());

export function saveTheDateItem(): CalItem {
  const { couple, weddingDateTime, city, project } = wedding;
  const end = new Date(new Date(weddingDateTime).getTime() + 4 * 3600e3).toISOString();
  return { title: `${couple.bride.name} & ${couple.groom.name}: wedding`, start: weddingDateTime, end, location: city, details: `${project.name}. ${project.tagline}` };
}
