import type { MemoryIconName } from "@/components/MemoryIcon";
import MemoryIcon from "@/components/MemoryIcon";

type TodayCardProps = {
  title: string;
  body: string;
  iconName?: MemoryIconName;
  variant?: "card" | "row";
};

export default function TodayCard({ title, body, iconName, variant = "card" }: TodayCardProps) {
  const wrapper =
    variant === "row"
      ? "rounded-2xl border border-brand-border bg-brand-bg p-4"
      : "rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm";

  return (
    <section className={wrapper}>
      <div className="flex items-start gap-3">
        {iconName ? (
          <div className="mt-0.5 text-brand-compass" aria-hidden="true">
            <MemoryIcon name={iconName} className="h-7 w-7" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
          <p className="mt-2 text-base leading-7 text-brand-muted">{body}</p>
        </div>
      </div>
    </section>
  );
}
