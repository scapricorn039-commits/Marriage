/* The preview build replaces next/image with a plain lazy image. */
export default function Image({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }} />;
}
