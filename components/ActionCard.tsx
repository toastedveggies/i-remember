import type { MemoryIconName } from "@/components/MemoryIcon";
import MemoryIcon from "@/components/MemoryIcon";
import type { ReactNode } from "react";

type ActionCardProps = {
  iconName: MemoryIconName;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: React.ReactNode;
};

export default function ActionCard({ iconName, title, subtitle, children, footer }: ActionCardProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-brand-compass" aria-hidden="true">
          <MemoryIcon name={iconName} className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-brand-text">{title}</h2>
          {subtitle ? <p className="mt-1 text-base text-brand-muted">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}

