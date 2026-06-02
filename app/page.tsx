import Link from "next/link";
import MemoryIcon from "@/components/MemoryIcon";

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
      <div className="space-y-6">
        {/* Hero section */}
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/claira-logo.webp" alt="Claira" className="h-20 w-auto mx-auto" />
          <div className="space-y-1">
            <p className="font-serif text-lg font-semibold italic text-[#5A4A3A]">A Caregiver-Mediated Cognitive Support System</p>
            <p className="font-serif text-sm italic text-[#8B7D6B]">&ldquo;Where am I?&nbsp; What&apos;s happening?&nbsp; What do I do next?&rdquo;</p>
          </div>
          <p className="text-xs text-[#8B7D6B] tracking-wide">Robert Morrison · Levon Nazaretyan · Katya Rodova · Dasha Bolotina · Parth Gupta</p>
        </div>

        {/* START DEMO button */}
        <Link
          href="/app"
          className="flex items-center justify-center gap-3 w-full rounded-2xl border-[3px] border-[#7C9B78]/60 bg-[#C8E2C4]/40 px-6 py-4 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-95 focus:outline-none"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#7C9B78] flex items-center justify-center">
            <MemoryIcon name="checkCircle" className="h-5 w-5 text-white" />
          </div>
          <span className="font-serif text-lg font-bold text-[#5A4A3A] tracking-wide">START DEMO</span>
        </Link>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C8E2C4] to-transparent" />

        <section className="space-y-3">
          <Link
            href="/app"
            className="flex min-h-16 items-center justify-between rounded-3xl border border-brand-border bg-brand-surface px-5 text-base font-semibold text-brand-text"
          >
            <span>User Dashboard</span>
            <span aria-hidden="true" className="text-brand-compass">
              →
            </span>
          </Link>
          <Link
            href="/caregiver"
            className="flex min-h-16 items-center justify-between rounded-3xl border border-brand-border bg-brand-surface px-5 text-base font-semibold text-brand-text"
          >
            <span>Caregiver Dashboard</span>
            <span aria-hidden="true" className="text-brand-compass">
              →
            </span>
          </Link>
          <Link
            href="/demo"
            className="flex min-h-16 items-center justify-between rounded-3xl border border-brand-border bg-brand-surface px-5 text-base font-semibold text-brand-text"
          >
            <span>Demo Settings</span>
            <span aria-hidden="true" className="text-brand-compass">
              →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
