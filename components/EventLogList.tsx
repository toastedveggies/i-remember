"use client";

import { useState } from "react";
import MemoryIcon from "@/components/MemoryIcon";
import type { DemoEvent } from "@/data/demoState";

type EventLogListProps = {
  items: DemoEvent[];
  defaultCollapsed?: boolean;
  title?: string;
  emptyText?: string;
};

function eventLabel(eventType: string): string {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function EventLogList({
  items,
  defaultCollapsed = false,
  title = "Event Log",
  emptyText = "No events yet. Interact with /app, /caregiver, or /demo."
}: EventLogListProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-text">
          <MemoryIcon name="clock" className="h-7 w-7 text-brand-primary" />
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed ? (
        <ul className="mt-3 space-y-3">
          {items.length === 0 ? (
            <li className="rounded-2xl border border-brand-border bg-brand-bg p-4 text-base text-brand-muted">
              {emptyText}
            </li>
          ) : (
            items.map((item) => {
              const isDistress = item.eventType === "reorientation_started";
              return (
              <li
                key={item.id}
                className={`rounded-2xl border bg-brand-bg p-4 ${isDistress ? "border-l-4 border-brand-border border-l-brand-compass" : "border-brand-border"}`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
                <p className={`mt-1 text-base leading-6 ${isDistress ? "font-semibold text-brand-compass" : "text-brand-text"}`}>{eventLabel(item.eventType)}</p>
                {item.eventType === "checkin_submitted" && typeof item.metadata?.question === "string" ? (
                  <p className="mt-1 text-sm text-brand-text italic">&ldquo;{item.metadata.question}&rdquo;</p>
                ) : null}
                <p className="text-sm text-brand-muted">
                  Source: {item.source}
                  {item.scenarioId ? ` | Scenario: ${item.scenarioId}` : ""}
                </p>
              </li>
              );
            })
          )}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-brand-muted">Event log is collapsed.</p>
      )}
    </section>
  );
}
