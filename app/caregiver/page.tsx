"use client";

import { useEffect, useMemo, useState } from "react";
import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import { createEvent, demoProfile, findScenario, initialDemoState, storageKey, type DemoState } from "@/data/demoState";

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return initialDemoState;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return initialDemoState;
  }

  try {
    return JSON.parse(raw) as DemoState;
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
      events: [createEvent("caregiver_view_opened", "caregiver", loaded.activeScenarioId), ...loaded.events].slice(0, 20)
    };
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);

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
            personName={demoProfile.preferredName}
            lastCheckIn={state.checkInStatus === "Not submitted yet" ? "No check-in yet" : "In current session"}
            status={`Active scenario: ${activeScenario.label}`}
            todaysEvents={state.events.length}
          />
          <EventLogList items={state.events} defaultCollapsed />
        </div>
      </div>
    </main>
  );
}
