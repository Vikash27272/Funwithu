import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fun With U",
  description: "A fullscreen couple games web app with a smooth no-scroll home screen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-black">{children}</body>
    </html>
  );
}
