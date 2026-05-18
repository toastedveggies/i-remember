"use client";

import { useEffect, useMemo, useState } from "react";
import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import {
  appendSystemEvent,
  createEvent,
  demoScenarios,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type DemoState,
  type PronounSet
} from "@/data/demoState";
import { loadProfile, saveCaregiverName, saveProfile } from "@/lib/profile";
import { clearSeedData, seedDemoData } from "@/lib/seedData";
import { supabase } from "@/lib/supabaseClient";

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
  const [resetMessage, setResetMessage] = useState("");
  const [activityCount, setActivityCount] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const hasLocalData = window.localStorage.getItem(storageKey) !== null;
    setState(loadState());
    if (!hasLocalData) {
      loadProfile().then((supabaseProfile) => {
        if (supabaseProfile) {
          setState((prev) => ({ ...prev, profile: supabaseProfile }));
        }
      });
    }
    supabase
      .from("activity_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .then(({ count }) => setActivityCount(count ?? 0));
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);

  const persist = (next: DemoState) => {
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const selectScenario = (scenarioId: string) => {
    const next = appendSystemEvent(
      { ...state, activeScenarioId: scenarioId },
      createEvent("demo_scenario_selected", "demo", scenarioId, undefined, state.profile.userId)
    );
    persist(next);
  };

  const updateProfile = (field: "preferredName" | "caregiverName" | "caregiverRelationshipLabel" | "customPronouns", value: string) => {
    const newProfile = { ...state.profile, [field]: value };
    persist({ ...state, profile: newProfile });
    if (field === "caregiverName" || field === "caregiverRelationshipLabel") {
      saveCaregiverName(newProfile.caregiverName, newProfile.caregiverRelationshipLabel);
    } else {
      saveProfile(newProfile);
    }
  };

  const updatePronouns = (pronouns: PronounSet) => {
    const newProfile = { ...state.profile, pronouns };
    persist({ ...state, profile: newProfile });
    saveProfile(newProfile);
  };

  const fetchActivityCount = () => {
    supabase
      .from("activity_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .then(({ count }) => setActivityCount(count ?? 0));
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    const result = await seedDemoData();
    setIsSeeding(false);
    setSeedStatus({ type: result.success ? "success" : "error", message: result.message });
    if (result.success) fetchActivityCount();
  };

  const handleClear = async () => {
    setIsClearing(true);
    setSeedStatus(null);
    const result = await clearSeedData();
    setIsClearing(false);
    setSeedStatus({ type: result.success ? "success" : "error", message: result.message });
    if (result.success) setActivityCount(0);
  };

  const resetDemoState = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem("memory-assistant-demo-unlocked");
    setResetMessage("Demo state reset. Refresh to return to locked entry screen.");
    setState(initialDemoState);
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

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-text">Reset demo</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Clears local demo data and re-enables password gate on refresh.
          </p>
          <button
            type="button"
            onClick={resetDemoState}
            className="mt-3 min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Reset demo state
          </button>
          {resetMessage ? <p className="mt-2 text-sm text-brand-muted">{resetMessage}</p> : null}
        </section>

        <ScenarioSelector scenarios={demoScenarios} activeScenarioId={state.activeScenarioId} onPreview={selectScenario} />

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-brand-text">Supabase Demo Data</h2>
          <p className="text-sm text-brand-muted">
            Activity events in Supabase:{" "}
            <span className="font-semibold text-brand-text">
              {activityCount === null ? "loading…" : activityCount}
            </span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isSeeding || isClearing}
              onClick={handleSeed}
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
            >
              {isSeeding ? "Seeding… (30–60 seconds)" : "Seed Year of Data"}
            </button>
            <button
              type="button"
              disabled={isSeeding || isClearing}
              onClick={handleClear}
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
            >
              {isClearing ? "Clearing…" : "Clear Seeded Data"}
            </button>
          </div>
          {isSeeding && (
            <p className="text-xs text-brand-muted">This may take 30–60 seconds. Please wait.</p>
          )}
          {seedStatus && (
            <p className={`text-sm ${seedStatus.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {seedStatus.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
