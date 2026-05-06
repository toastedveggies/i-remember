import type { EventLogItem } from "@/data/demoData";
import MemoryIcon from "@/components/MemoryIcon";

type EventLogListProps = {
  items: EventLogItem[];
};

export default function EventLogList({ items }: EventLogListProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-text">
        <MemoryIcon name="clock" className="h-7 w-7 text-brand-primary" />
        Event Log
      </h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">{item.time}</p>
            <p className="mt-1 text-base leading-6 text-brand-text">{item.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
