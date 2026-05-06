import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-8">
      <header className="rounded-2xl border border-calm-border bg-calm-card p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-calm-text">Memory Assistant</h1>
        <p className="mt-2 text-sm leading-6 text-calm-text">
          A simple support prototype to help with orientation in the present moment.
        </p>
      </header>

      <section className="mt-6 space-y-3">
        <Link
          href="/app"
          className="flex min-h-12 items-center rounded-xl border border-calm-border bg-white px-4 text-sm font-medium"
        >
          Open Today Window
        </Link>
        <Link
          href="/caregiver"
          className="flex min-h-12 items-center rounded-xl border border-calm-border bg-white px-4 text-sm font-medium"
        >
          Open Caregiver Dashboard
        </Link>
        <Link
          href="/demo"
          className="flex min-h-12 items-center rounded-xl border border-calm-border bg-white px-4 text-sm font-medium"
        >
          Open Scenario Demo Simulator
        </Link>
      </section>
    </main>
  );
}
