import { artUrl } from "@/lib/art-url";
export function Pic({ name, className = "", lazy = true, alt = "" }: { name: string; className?: string; lazy?: boolean; alt?: string }) {
  return <img className={`pic ${className}`} src={artUrl(name)} alt={alt} loading={lazy ? "lazy" : "eager"} decoding="async" draggable={false} />;
}
