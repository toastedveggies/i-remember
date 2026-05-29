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
      <body>
        <DemoAccessGate>
          <SiteHeader />
          <div className="pb-10">{children}</div>
        </DemoAccessGate>
      </body>
    </html>
  );
}
