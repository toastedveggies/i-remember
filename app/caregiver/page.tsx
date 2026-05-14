"use client";

import { useEffect, useMemo, useState } from "react";
import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import { createEvent, findScenario, initialDemoState, normalizeDemoState, storageKey, type DemoState } from "@/data/demoState";

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
    const next = {
      ...loaded,
      events: [
        createEvent("caregiver_view_opened", "caregiver", loaded.activeScenarioId, undefined, loaded.profile.userId),
        ...loaded.events
      ].slice(0, 20)
    };
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const activityEventTypes = new Set(["reorientation_started", "checkin_submitted", "fallback_shown", "demo_scenario_selected", "helper_card_shown"]);
  const appEvents = useMemo(() => state.events.filter((e) => activityEventTypes.has(e.eventType)), [state.events]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Caregiver Dashboard</h1>
          <p className="text-base text-brand-muted">A calm overview of recent activity and current status.</p>
          <p className="text-sm text-brand-muted">Simulation route only. No production auth in MVP.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
          <CaregiverSummary
            personName={state.profile.preferredName}
            lastCheckIn={state.checkInStatus === "Not submitted yet" ? "No check-in yet" : "In current session"}
            status={`Active scenario: ${activeScenario.label}`}
            todaysEvents={state.events.length}
          />
          <EventLogList
            title={`${state.profile.preferredName}'s Activity`}
            items={appEvents}
            defaultCollapsed={false}
            emptyText="No activity from the app yet."
          />
        </div>

        <section className="space-y-3">
          <EventLogList items={state.events} defaultCollapsed title="Event Log" />
        </section>
      </div>
    </main>
  );
}
