"use client";

import { useEffect, useMemo, useState } from "react";
import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import {
  createEvent,
  demoScenarios,
  findScenario,
  initialDemoState,
  storageKey,
  type DemoState
} from "@/data/demoState";

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

export default function DemoPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);

  const selectScenario = (scenarioId: string) => {
    const next = {
      ...state,
      activeScenarioId: scenarioId,
      events: [createEvent("demo_scenario_selected", "demo", scenarioId), ...state.events].slice(0, 20)
    };

    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Scenario Demo Simulator</h1>
          <p className="text-base text-brand-muted">Practice supportive responses with sample situations.</p>
        </header>

        <ResponseCard
          title="Demo intent"
          message="This simulator shows MVP support behavior only. It does not provide diagnosis or emergency medical instruction."
        />

        <ResponseCard title="Active scenario" message={`${activeScenario.label}: ${activeScenario.guidance}`} />

        <ScenarioSelector scenarios={demoScenarios} activeScenarioId={state.activeScenarioId} onPreview={selectScenario} />
      </div>
    </main>
  );
}
