import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import DemoAccessGate from "@/components/DemoAccessGate";

export const metadata: Metadata = {
  title: "Claira",
  description: "Present-moment support for people with memory impairment."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <DemoAccessGate>
          <SiteHeader />
          <div className="pb-10">{children}</div>
        </DemoAccessGate>
      </body>
    </html>
  );
}
