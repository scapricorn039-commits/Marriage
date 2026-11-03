/** Paintings live in public/art. The single-page preview serves them next to the page. */
export const artUrl = (name: string) => `${process.env.NEXT_PUBLIC_DEMO === "1" ? "art" : "/art"}/${name}.webp`;
