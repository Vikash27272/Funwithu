"use client";

import type { ReactNode } from "react";

interface BoardWrapperProps {
  children: ReactNode;
}

export default function BoardWrapper({ children }: BoardWrapperProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom,rgba(98,22,38,0.08),transparent_54%)]" />
      <div className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
}
