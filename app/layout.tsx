import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Memory Assistant",
  description: "Mobile-first prototype for present-moment reorientation support."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div className="pb-10">{children}</div>
      </body>
    </html>
  );
}
