"use client";

import AppProviders from "@/components/providers/AppProviders";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
