"use client";
import { createContext, useContext } from "react";
import type { Audience } from "@/config/wedding.config";
const Ctx = createContext<Audience>("family");
export const AudienceProvider = Ctx.Provider;
export const useAudience = () => useContext(Ctx);
