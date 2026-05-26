"use client";

import { useState } from "react";
import MemoryIcon from "@/components/MemoryIcon";
import type { DemoEvent } from "@/data/demoState";

type EventLogListProps = {
  items: DemoEvent[];
  defaultCollapsed?: boolean;
  title?: string;
  emptyText?: string;
  initialLimit?: number;
  plain?: boolean;
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
  emptyText = "No events yet. Interact with /app, /caregiver, or /demo.",
  initialLimit,
  plain = false
}: EventLogListProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll || !initialLimit ? items : items.slice(0, initialLimit);
  const hasMore = !!initialLimit && items.length > initialLimit;

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
        <>
          <div className={showAll && items.length > 10 ? "mt-3 max-h-[800px] overflow-y-auto" : "mt-3"}>
            <ul className="space-y-3">
              {items.length === 0 ? (
                <li className="rounded-2xl border border-brand-border bg-brand-bg p-4 text-base text-brand-muted">
                  {emptyText}
                </li>
              ) : (
                visibleItems.map((item) => {
                  const isDistress = !plain && item.eventType === "reorientation_started";
                  const isHelperCard = !plain && item.eventType === "helper_card_shown";
                  const isCall = !plain && item.eventType === "caregiver_called";
                  const isEmergency = !plain && item.eventType === "emergency_called";
                  const isOkay = !plain && item.eventType === "okay_confirmed";
                  const cardBg = isEmergency ? "bg-red-600" : isHelperCard ? "bg-yellow-50" : isCall ? "bg-blue-50" : isOkay ? "bg-green-50" : "bg-brand-bg";
                  const borderClass = isDistress ? "border-l-4 border-brand-border border-l-brand-compass" : isOkay ? "border-green-200" : "border-brand-border";
                  const labelClass = isEmergency
                    ? "font-bold text-yellow-300"
                    : isDistress
                      ? "font-semibold text-brand-compass"
                      : isHelperCard
                        ? "font-semibold text-amber-700"
                        : isCall
                          ? "font-semibold text-blue-700"
                          : isOkay
                            ? "font-semibold text-green-700"
                            : "text-brand-text";
                  const label = isEmergency ? "Called Emergency Services" : isOkay ? "Confirmed okay" : eventLabel(item.eventType);
                  return (
                    <li
                      key={item.id}
                      className={`rounded-2xl border p-4 ${cardBg} ${borderClass}`}
                    >
                      <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                      <p className={`mt-1 text-base leading-6 ${labelClass}`}>{label}</p>
                      {item.eventType === "checkin_submitted" && typeof item.metadata?.question === "string" ? (
                        <p className="mt-1 text-sm text-brand-text italic">&ldquo;{item.metadata.question}&rdquo;</p>
                      ) : null}
                      {item.eventType === "reorientation_card_viewed" && typeof item.metadata?.question === "string" ? (
                        <p className="mt-1 text-sm text-brand-text italic">
                          &ldquo;{(item.metadata.question as string).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}&rdquo;
                        </p>
                      ) : null}
                      {item.eventType === "reorientation_card_viewed" && typeof item.metadata?.ai_response === "string" ? (
                        <>
                          <p className="mt-2 text-xs text-brand-muted">AI response:</p>
                          <p className="mt-1 text-sm leading-relaxed text-brand-text">{item.metadata.ai_response as string}</p>
                        </>
                      ) : null}
                      {typeof item.metadata?.trustedPlace === "string" && item.metadata.trustedPlace ? (
                        <p className="mt-1 text-sm text-brand-muted">
                          Location: {item.metadata.trustedPlace as string}
                          {typeof item.metadata.trustedPlaceAddress === "string" && item.metadata.trustedPlaceAddress
                            ? ` — ${item.metadata.trustedPlaceAddress as string}`
                            : ""}
                        </p>
                      ) : null}
                      {typeof item.metadata?.locationMode === "string" ? (
                        <p className="mt-1 text-sm text-brand-muted">
                          Location mode: {item.metadata.locationMode as string}
                        </p>
                      ) : null}
                      {item.placeId === null && item.metadata?.reason === "unrecognized_location" ? (
                        <p className="mt-1 text-sm text-amber-800">
                          Location was not recognized as a saved trusted place.
                        </p>
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
          </div>
          {hasMore ? (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-3 rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-brand-muted">Event log is collapsed.</p>
      )}
    </section>
  );
}
