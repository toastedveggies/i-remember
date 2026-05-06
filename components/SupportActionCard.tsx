import type { MemoryIconName } from "@/components/MemoryIcon";
import MemoryIcon from "@/components/MemoryIcon";

type SupportActionCardProps = {
  iconName: MemoryIconName;
  title: string;
  description?: string;
  buttonLabel: string;
  href?: string;
  onClick?: () => void;
};

export default function SupportActionCard({
  iconName,
  title,
  description,
  buttonLabel,
  href,
  onClick
}: SupportActionCardProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-brand-compass" aria-hidden="true">
          <MemoryIcon name={iconName} className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-brand-text">{title}</h2>
          {description ? <p className="mt-1 text-base text-brand-muted">{description}</p> : null}
        </div>
      </div>

      <div className="mt-4">
        {href ? (
          <a
            href={href}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
          >
            {buttonLabel}
          </a>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </section>
  );
}

