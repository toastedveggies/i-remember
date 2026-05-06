import type { EventLogItem } from "@/data/demoData";

type EventLogListProps = {
  items: EventLogItem[];
};

export default function EventLogList({ items }: EventLogListProps) {
  return (
    <section className="rounded-2xl border border-calm-border bg-calm-card p-4 shadow-sm">
      <h2 className="text-base font-semibold text-calm-text">Event Log</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-calm-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-calm-muted">{item.time}</p>
            <p className="mt-1 text-sm text-calm-text">{item.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
