"use client";

import { useEffect, useMemo, useState } from "react";
import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import {
  createEvent,
  demoScenarios,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type DemoState,
  type PronounSet
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
    return normalizeDemoState(JSON.parse(raw));
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

  const persist = (next: DemoState) => {
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const selectScenario = (scenarioId: string) => {
    const next = {
      ...state,
      activeScenarioId: scenarioId,
      events: [createEvent("demo_scenario_selected", "demo", scenarioId, undefined, state.profile.userId), ...state.events].slice(0, 20)
    };

    persist(next);
  };

  const updateProfile = (field: "preferredName" | "caregiverName" | "caregiverRelationshipLabel" | "customPronouns", value: string) => {
    persist({
      ...state,
      profile: {
        ...state.profile,
        [field]: value
      }
    });
  };

  const updatePronouns = (pronouns: PronounSet) => {
    persist({
      ...state,
      profile: {
        ...state.profile,
        pronouns
      }
    });
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

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-text">Profile personalization (MVP onboarding)</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Preferred name</span>
              <input
                value={state.profile.preferredName}
                onChange={(e) => updateProfile("preferredName", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Caregiver name</span>
              <input
                value={state.profile.caregiverName}
                onChange={(e) => updateProfile("caregiverName", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Caregiver label</span>
              <input
                value={state.profile.caregiverRelationshipLabel ?? ""}
                onChange={(e) => updateProfile("caregiverRelationshipLabel", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Pronouns</span>
              <select
                value={state.profile.pronouns}
                onChange={(e) => updatePronouns(e.target.value as PronounSet)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              >
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="custom">custom</option>
              </select>
            </label>
            {state.profile.pronouns === "custom" ? (
              <label className="space-y-1 text-sm text-brand-muted md:col-span-2">
                <span>Custom pronouns</span>
                <input
                  value={state.profile.customPronouns ?? ""}
                  onChange={(e) => updateProfile("customPronouns", e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
                />
              </label>
            ) : null}
          </div>
        </section>

        <ResponseCard title="Active scenario" message={`${activeScenario.label}: ${activeScenario.guidance}`} />

        <ScenarioSelector scenarios={demoScenarios} activeScenarioId={state.activeScenarioId} onPreview={selectScenario} />
      </div>
    </main>
  );
}
