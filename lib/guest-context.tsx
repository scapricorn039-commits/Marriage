"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchGuest, type GuestInfo } from "./api-client";

type Ctx = { token: string | null; guest: GuestInfo | null };
const GuestContext = createContext<Ctx>({ token: null, guest: null });
export const useGuest = () => useContext(GuestContext);

/** Reads ?g=<private token> from a personal invitation link. Guest data never appears in the page source. */
export function GuestProvider({ children }: { children: ReactNode }) {
  const [state, set] = useState<Ctx>({ token: null, guest: null });
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("g");
    if (!token) return;
    fetchGuest(token).then((guest) => { if (guest) set({ token, guest }); });
  }, []);
  return <GuestContext.Provider value={state}>{children}</GuestContext.Provider>;
}
