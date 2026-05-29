import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-brand-border bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Claira home">
          <BrandLogo size={42} />
          <div className="text-lg font-semibold text-brand-text">Claira</div>
        </Link>

        <nav className="ml-auto hidden items-center gap-2 md:flex" aria-label="Primary">
          <Link
            href="/app"
            className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-primary"
          >
            Today
          </Link>
          <Link
            href="/caregiver"
            className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-primary"
          >
            Caregiver
          </Link>
          <Link
            href="/demo"
            className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-primary"
          >
            Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}

