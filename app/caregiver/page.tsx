"use client";

import { useEffect, useMemo, useState } from "react";
import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import Link from "next/link";
import { appendSystemEvent, createEvent, findScenario, initialDemoState, normalizeDemoState, storageKey, type DemoState } from "@/data/demoState";

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return initialDemoState;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return initialDemoState;
  }

  try {
    return normalizeDemoState(JSON.parse(raw));
  } catch {
    return initialDemoState;
  }
}

export default function CaregiverPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);

  useEffect(() => {
    const loaded = loadState();
    const next = appendSystemEvent(
      loaded,
      createEvent("caregiver_view_opened", "caregiver", loaded.activeScenarioId, undefined, loaded.profile.userId)
    );
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const missedCalls = state.activityEvents.filter((e) => e.eventType === "caregiver_called").length;
  const emergencyCalls = state.activityEvents.filter((e) => e.eventType === "emergency_called").length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Caregiver Dashboard</h1>
          <p className="text-base text-brand-muted">A calm overview of recent activity and current status.</p>
          <p className="text-sm text-brand-muted">Simulation route only. No production auth in MVP.</p>
        </header>

        <div>
          <Link
            href="/caregiver/insights"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Insights →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
          <CaregiverSummary
            personName={state.profile.preferredName}
            lastCheckIn={state.checkInStatus === "Not submitted yet" ? "No check-in yet" : "In current session"}
            status={`Active scenario: ${activeScenario.label}`}
            todaysEvents={state.activityEvents.length}
            missedCalls={missedCalls}
            emergencyCalls={emergencyCalls}
          />
          <EventLogList
            title={`${state.profile.preferredName}'s Activity`}
            items={state.activityEvents}
            defaultCollapsed={false}
            emptyText="No activity from the app yet."
            initialLimit={5}
          />
        </div>

        <section className="space-y-3">
          <EventLogList items={state.systemEvents} defaultCollapsed title="Event Log" plain emptyText="No system events yet." />
        </section>
      </div>
    </main>
  );
}
