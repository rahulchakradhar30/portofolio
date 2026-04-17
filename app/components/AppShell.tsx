"use client";

import CommandPalette from "./CommandPalette";
import PageTransition from "./PageTransition";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTransition>{children}</PageTransition>
      <CommandPalette />
    </>
  );
}