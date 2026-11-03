import type { VignetteName } from "@/config/wedding.config";
import { Pic } from "./Painted";
/** Original watercolour scenes that stand where photographs will go. */
export function Vignette({ name, className = "" }: { name: VignetteName; className?: string }) {
  return <Pic name={`scene-${name}`} className={`art ${className}`} />;
}
