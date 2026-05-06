import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Assistant",
  description: "Mobile-first prototype for present-moment reorientation support."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
