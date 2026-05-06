import Link from "next/link";
import MemoryIcon from "@/components/MemoryIcon";

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
      <div className="space-y-6">
        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-brand-compass" aria-hidden="true">
              <MemoryIcon name="compass" className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-brand-text">Memory Assistant</h1>
              <p className="mt-2 text-base leading-7 text-brand-muted">
                Calm, non-clinical support for moments of confusion. It helps you orient to the present.
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <Link
            href="/app"
            className="flex min-h-16 items-center justify-between rounded-3xl border border-brand-border bg-brand-surface px-5 text-base font-semibold text-brand-text"
          >
            <span>Help with today</span>
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
            <span>Scenario Demo Simulator</span>
            <span aria-hidden="true" className="text-brand-compass">
              →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
