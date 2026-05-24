"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildActiveLocationSummary, buildContextPacket } from "@/data/demoData";
import { findScenario, initialDemoState, normalizeDemoState, storageKey, type DemoState } from "@/data/demoState";
import { resolveActiveLocationContext } from "@/lib/places";

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

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function DebugPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const resolvedLocation = useMemo(
    () => resolveActiveLocationContext({
      scenario: activeScenario,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [activeScenario, state.activeLocationSource, state.browserLocation, state.trustedLocations]
  );

  const activeLocationSummary = useMemo(
    () => buildActiveLocationSummary({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeLocationSource, state.activeScenarioId, state.browserLocation, state.profile, state.trustedLocations]
  );

  const contextPacket = useMemo(
    () => buildContextPacket({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeLocationSource, state.activeScenarioId, state.browserLocation, state.profile, state.trustedLocations]
  );

  const recentEvents = useMemo(
    () => [...state.activityEvents, ...state.systemEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8),
    [state.activityEvents, state.systemEvents]
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-brand-text">Debug Screen</h1>
          <p className="text-sm text-brand-muted">
            Quick internal view of the active demo state, trusted-place resolution, and API context packet.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/app" className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-brand-text">
              Open /app
            </Link>
            <Link href="/demo" className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-brand-text">
              Open /demo
            </Link>
            <Link href="/caregiver" className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-brand-text">
              Open /caregiver
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Scenario</h2>
            <div className="mt-3 space-y-2 text-sm text-brand-muted">
              <p><span className="font-medium text-brand-text">ID:</span> {activeScenario.id}</p>
              <p><span className="font-medium text-brand-text">Label:</span> {activeScenario.label}</p>
              <p><span className="font-medium text-brand-text">Expected mode:</span> {activeScenario.expectedLocationMode}</p>
              <p><span className="font-medium text-brand-text">Scenario place:</span> {activeScenario.scenarioPlaceId ?? "null"}</p>
              <p><span className="font-medium text-brand-text">Response posture:</span> {activeScenario.responsePosture}</p>
              <p><span className="font-medium text-brand-text">Uncertainty:</span> {activeScenario.uncertainty}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Resolved Location</h2>
            <div className="mt-3 space-y-2 text-sm text-brand-muted">
              <p><span className="font-medium text-brand-text">Source:</span> {activeLocationSummary.sourceLabel}</p>
              <p><span className="font-medium text-brand-text">Match:</span> {activeLocationSummary.label}</p>
              <p><span className="font-medium text-brand-text">Mode:</span> {activeLocationSummary.locationModeLabel}</p>
              <p><span className="font-medium text-brand-text">Place ID:</span> {activeLocationSummary.placeId ?? "null"}</p>
              <p><span className="font-medium text-brand-text">Coordinates:</span> {resolvedLocation.coordinates.latitude.toFixed(5)}, {resolvedLocation.coordinates.longitude.toFixed(5)}</p>
              <p><span className="font-medium text-brand-text">Accuracy:</span> {resolvedLocation.accuracyMeters ?? "n/a"}</p>
              <p><span className="font-medium text-brand-text">Fallback:</span> {resolvedLocation.fallbackReason ?? "none"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">Trusted Places</h2>
          <JsonBlock value={state.trustedLocations} />
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">Current Context Packet</h2>
          <JsonBlock value={contextPacket} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Browser Location</h2>
            <JsonBlock value={state.browserLocation} />
          </div>
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Recent Events</h2>
            <JsonBlock value={recentEvents} />
          </div>
        </section>
      </div>
    </main>
  );
}
