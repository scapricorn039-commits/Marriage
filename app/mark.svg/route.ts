
/** Favicon drawn from the couple's initials. */
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#F4ECDF"/><path d="M50 50C36 18 8 18 10 40C12 54 34 54 50 50C66 54 88 54 90 40C92 18 64 18 50 50ZM50 52C38 56 24 62 30 76C35 86 46 72 50 54C54 72 65 86 70 76C76 62 62 56 50 52Z" fill="#713441"/></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
}
