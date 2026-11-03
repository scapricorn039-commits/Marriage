import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Audience } from "@/config/wedding.config";
import { Experience } from "@/components/Experience";
import { Story } from "@/components/sections/Story";
import { Moments } from "@/components/sections/Moments";

const read = (): Audience => (location.hash === "#family" ? "family" : "friends");
function App() {
  const [a, set] = useState<Audience>(read());
  useEffect(() => { const f = () => set(read()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  const go = (n: Audience) => { location.hash = n; window.scrollTo(0, 0); set(n); };
  return <Experience key={a} audience={a} onSwitch={go} story={a === "friends" ? <Story /> : undefined} moments={a === "friends" ? <Moments /> : undefined} />;
}
createRoot(document.getElementById("root")!).render(<App />);
