"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import { buildActiveLocationSummary } from "@/data/demoData";
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
  const [activeIsPrimaryContact, setActiveIsPrimaryContact] = useState<boolean>(true);
  const [primaryContactName, setPrimaryContactName] = useState<string | null>(null);

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
      void (async () => {
        try {
          const { data: relationship } = await (supabase as any)
            .from("caregiver_user_relationships")
            .select("role, is_primary_contact")
            .eq("user_id", DEMO_USER_ID)
            .eq("caregiver_id", caregiverId)
            .maybeSingle();

          if (!relationship) {
            setCaregiverRole(null);
            return;
          }

          const relationshipRecord = relationship as Record<string, unknown>;
          setCaregiverRole(relationshipRecord.role as "primary" | "family" | "read_only");
          const isPrimaryContact = relationshipRecord.is_primary_contact as boolean;
          setActiveIsPrimaryContact(isPrimaryContact);

          if (!isPrimaryContact) {
            const { data: primaryRelationship } = await (supabase as any)
              .from("caregiver_user_relationships")
              .select("caregiver_id")
              .eq("user_id", DEMO_USER_ID)
              .eq("is_primary_contact", true)
              .maybeSingle();

            if (primaryRelationship) {
              const { data: primaryCaregiver } = await (supabase as any)
                .from("caregivers")
                .select("name")
                .eq("id", (primaryRelationship as Record<string, unknown>).caregiver_id)
                .is("deleted_at", null)
                .maybeSingle();

              if (primaryCaregiver) {
                setPrimaryContactName((primaryCaregiver as Record<string, unknown>).name as string);
              }
            }
          }

          const { data: caregiver } = await (supabase as any)
            .from("caregivers")
            .select("name, relationship_label")
            .eq("id", caregiverId)
            .is("deleted_at", null)
            .maybeSingle();

          if (caregiver) {
            const caregiverRecord = caregiver as Record<string, unknown>;
            setCaregiverDisplayName(caregiverRecord.name as string);
            setCaregiverDisplayLabel((caregiverRecord.relationship_label as string | null) ?? null);
          }
        } catch {
          setCaregiverRole(null);
        }
      })();
    } else {
      setCaregiverRole(null);
    }

    void getMonthlyData().then((data) => {
      if (data) {
        setStabilityScore(data.stabilityScore);
      }
    });
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
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

  const missedCalls = state.activityEvents.filter((event) => event.eventType === "caregiver_called").length;
  const emergencyCalls = state.activityEvents.filter((event) => event.eventType === "emergency_called").length;
  const okayConfirmations = state.activityEvents.filter((event) => event.eventType === "okay_confirmed").length;
  const hasDistressEvent = state.activityEvents.some((event) => event.eventType === "reorientation_started");

  const activityPanelItems = [
    ...state.activityEvents.filter((event) => event.eventType !== "reorientation_started"),
    ...state.systemEvents.filter((event) => event.eventType === "reorientation_card_viewed"),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const caregiverViewLabel = caregiverDisplayName
    ? caregiverDisplayLabel
      ? `${caregiverDisplayName} (${caregiverDisplayLabel})`
      : caregiverDisplayName
    : null;

  const missedCallsLabel = activeIsPrimaryContact
    ? "Missed calls"
    : primaryContactName
      ? `Calls to ${primaryContactName}`
      : "Caregiver calls";

  const locationStatusText = activeLocationSummary.placeId
    ? `${state.profile.preferredName} is currently matched to the trusted place "${activeLocationSummary.label}".`
    : `${state.profile.preferredName} is at an unrecognized location and may need direct support.`;

  const caregiverSituationText = activeLocationSummary.placeId
    ? `${activeScenario.happening} Next support should stay grounded in ${activeLocationSummary.label}.`
    : "The app did not recognize this location, so the safest caregiver response is calm clarification and direct support.";

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
            <ul className="list-disc list-inside space-y-2 text-sm text-brand-muted">
              <li>Activity summary and recent check-in status</li>
              <li>Trusted-place context and unrecognized-location support moments</li>
              <li>Support events, caregiver calls, and emergency actions</li>
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
              className="min-h-12 cursor-not-allowed rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text opacity-60 focus:outline-none"
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

  if (caregiverRole === undefined) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <p className="text-sm text-brand-muted">Loading caregiver view...</p>
      </main>
    );
  }

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
            <ul className="list-disc list-inside space-y-2 text-sm text-brand-muted">
              <li>Activity summary and recent check-in status</li>
              <li>Trusted-place context and unrecognized-location support moments</li>
              <li>Support events, caregiver calls, and emergency actions</li>
            </ul>
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

          <section className={`rounded-2xl border px-4 py-3 ${activeLocationSummary.placeId ? "border-brand-border bg-brand-surface" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-sm font-semibold text-brand-text">Location context</p>
            <p className="mt-1 text-sm text-brand-muted">{locationStatusText}</p>
            <p className="mt-1 text-sm text-brand-muted">{caregiverSituationText}</p>
            <p className="mt-1 text-xs text-brand-muted">Source: {activeLocationSummary.sourceLabel}</p>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{missedCalls}</p>
              <p className="mt-1 text-xs text-brand-muted">{missedCallsLabel}</p>
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
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{okayConfirmations}</p>
              <p className="mt-1 text-xs text-brand-muted">Felt okay</p>
            </div>
          </div>

          <p className="text-xs text-brand-muted">
            Full activity log is visible to primary caregivers only.
          </p>

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

        <div className="space-y-3">
          <section className={`rounded-2xl border px-4 py-3 ${activeLocationSummary.placeId ? "border-brand-border bg-brand-surface" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-sm font-semibold text-brand-text">Current location context</p>
            <p className="mt-1 text-sm text-brand-muted">{locationStatusText}</p>
            <p className="mt-1 text-sm text-brand-muted">Scenario: {activeScenario.label}</p>
            <p className="mt-1 text-sm text-brand-muted">{caregiverSituationText}</p>
            <p className="mt-1 text-xs text-brand-muted">Source: {activeLocationSummary.sourceLabel}</p>
            {activeLocationSummary.placeId ? (
              <p className="mt-1 text-xs text-brand-muted">Trusted place: {activeLocationSummary.detail}</p>
            ) : (
              <p className="mt-1 text-xs text-amber-900">The app did not recognize this location, so support guidance should stay transparent and safety-focused.</p>
            )}
          </section>

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
            status={locationStatusText}
            todaysEvents={state.activityEvents.length}
            missedCalls={missedCalls}
            emergencyCalls={emergencyCalls}
            missedCallsLabel={missedCallsLabel}
            locationLabel={activeLocationSummary.label}
            locationModeLabel={activeLocationSummary.locationModeLabel}
          />
          <EventLogList
            title={`${state.profile.preferredName}'s Activity`}
            items={activityPanelItems}
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
