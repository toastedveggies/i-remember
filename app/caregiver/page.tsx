"use client";

import { useEffect, useMemo, useState } from "react";
import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import Link from "next/link";
import { appendSystemEvent, createEvent, findScenario, initialDemoState, normalizeDemoState, storageKey, type DemoState } from "@/data/demoState";
import { getMonthlyData } from "@/lib/insightsData";
import { supabase } from "@/lib/supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

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
  const [caregiverRole, setCaregiverRole] = useState<"primary" | "family" | "read_only" | null | undefined>(undefined);
  const [caregiverDisplayName, setCaregiverDisplayName] = useState<string | null>(null);
  const [caregiverDisplayLabel, setCaregiverDisplayLabel] = useState<string | null>(null);
  const [stabilityScore, setStabilityScore] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadState();
    const next = appendSystemEvent(
      loaded,
      createEvent("caregiver_view_opened", "caregiver", loaded.activeScenarioId, undefined, loaded.profile.userId)
    );
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));

    const caregiverId = loaded.profile.activeCaregiverId;
    if (caregiverId) {
      (async () => {
        try {
          const { data: rel } = await (supabase as any)
            .from("caregiver_user_relationships")
            .select("role")
            .eq("user_id", DEMO_USER_ID)
            .eq("caregiver_id", caregiverId)
            .maybeSingle();

          if (!rel) {
            setCaregiverRole(null);
            return;
          }
          setCaregiverRole((rel as Record<string, unknown>).role as "primary" | "family" | "read_only");

          const { data: cg } = await (supabase as any)
            .from("caregivers")
            .select("name, relationship_label")
            .eq("id", caregiverId)
            .is("deleted_at", null)
            .maybeSingle();

          if (cg) {
            const c = cg as Record<string, unknown>;
            setCaregiverDisplayName(c.name as string);
            setCaregiverDisplayLabel((c.relationship_label as string | null) ?? null);
          }
        } catch {
          setCaregiverRole(null);
        }
      })();
    } else {
      setCaregiverRole(null);
    }

    getMonthlyData().then((data) => {
      if (data) setStabilityScore(data.stabilityScore);
    });
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const missedCalls = state.activityEvents.filter((e) => e.eventType === "caregiver_called").length;
  const emergencyCalls = state.activityEvents.filter((e) => e.eventType === "emergency_called").length;
  const hasDistressEvent = state.activityEvents.some((e) => e.eventType === "reorientation_started");

  const caregiverViewLabel = caregiverDisplayName
    ? caregiverDisplayLabel
      ? `${caregiverDisplayName} (${caregiverDisplayLabel})`
      : caregiverDisplayName
    : null;

  if (state.profile.independentMode) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Your care space is ready</h1>
            <p className="text-base text-brand-muted">
              {state.profile.preferredName} is using Memory Assistant independently. No caregiver has been connected yet.
            </p>
          </header>

          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-brand-text">What a connected caregiver can see</h2>
            <p className="text-sm text-brand-muted">When a caregiver is invited and connected, they will be able to view:</p>
            <ul className="space-y-2 text-sm text-brand-muted list-disc list-inside">
              <li>Activity summary and recent check-in status</li>
              <li>Support events, caregiver calls, and emergency actions</li>
              <li>Reorientation patterns and stability trends over time</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-brand-text">Connect a caregiver</h2>
            <p className="text-sm text-brand-muted">
              You can invite a caregiver to view your care space. They will receive a link to set up access.
            </p>
            <button
              type="button"
              disabled
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text opacity-60 cursor-not-allowed focus:outline-none"
            >
              Invite a caregiver
            </button>
            <p className="text-xs text-brand-muted">Caregiver invite is coming in a future update.</p>
          </section>

          <Link
            href="/app"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            ← Back to Today
          </Link>
        </div>
      </main>
    );
  }

  // Still waiting for relationship fetch
  if (caregiverRole === undefined) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <p className="text-sm text-brand-muted">Loading caregiver view…</p>
      </main>
    );
  }

  // No relationship row found — show independent mode view
  if (caregiverRole === null) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Your care space is ready</h1>
            <p className="text-base text-brand-muted">
              {state.profile.preferredName} is using Memory Assistant independently. No caregiver has been connected yet.
            </p>
          </header>
          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-brand-text">What a connected caregiver can see</h2>
            <p className="text-sm text-brand-muted">When a caregiver is invited and connected, they will be able to view:</p>
            <ul className="space-y-2 text-sm text-brand-muted list-disc list-inside">
              <li>Activity summary and recent check-in status</li>
              <li>Support events, caregiver calls, and emergency actions</li>
              <li>Reorientation patterns and stability trends over time</li>
            </ul>
          </section>
          <Link href="/app" className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40">
            ← Back to Today
          </Link>
        </div>
      </main>
    );
  }

  // Summary-only view for family and read_only roles
  if (caregiverRole === "family" || caregiverRole === "read_only") {
    const roleLabel = caregiverRole === "read_only" ? "read only" : "family";
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Care Summary</h1>
            {caregiverViewLabel ? (
              <p className="text-base text-brand-muted">
                Viewing as <span className="font-medium text-brand-text">{caregiverViewLabel}</span> · {roleLabel}
              </p>
            ) : null}
            <p className="text-sm text-brand-muted">Simulation route only. No production auth in MVP.</p>
          </header>

          {hasDistressEvent ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                {state.profile.preferredName} has requested reorientation support this session.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{missedCalls}</p>
              <p className="mt-1 text-xs text-brand-muted">Missed calls</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className={`text-3xl font-bold ${emergencyCalls > 0 ? "text-red-600" : "text-brand-text"}`}>
                {emergencyCalls}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Emergency calls</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">
                {stabilityScore !== null ? `${Math.round(stabilityScore)}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Stability score</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{state.activityEvents.length}</p>
              <p className="mt-1 text-xs text-brand-muted">Events today</p>
            </div>
          </div>

          <p className="text-xs text-brand-muted">
            Full activity log is visible to primary caregivers only.
          </p>

          <Link href="/app" className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40">
            ← Back to Today
          </Link>
        </div>
      </main>
    );
  }

  // Full dashboard for primary role
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Caregiver Dashboard</h1>
          <p className="text-base text-brand-muted">A calm overview of recent activity and current status.</p>
          {caregiverViewLabel ? (
            <p className="text-sm text-brand-muted">
              Viewing as <span className="font-medium text-brand-text">{caregiverViewLabel}</span> · primary · Simulation route only.
            </p>
          ) : (
            <p className="text-sm text-brand-muted">Simulation route only. No production auth in MVP.</p>
          )}
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
