"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import EventLogList from "@/components/EventLogList";
import MemoryIcon from "@/components/MemoryIcon";
import { buildActiveLocationSummary } from "@/data/demoData";
import { appendSystemEvent, createEvent, findScenario, initialDemoState, normalizeDemoState, pronounWords, storageKey, type DemoState } from "@/data/demoState";
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

function activityDotClass(eventType: string): string {
  switch (eventType) {
    case "okay_confirmed": return "bg-brand-careGreen";
    case "reorientation_card_viewed": return "bg-brand-careRust";
    case "caregiver_called": return "bg-brand-careTeal";
    case "emergency_called": return "bg-red-600";
    case "helper_card_shown": return "bg-amber-500";
    default: return "bg-gray-400";
  }
}

function activityLabelClass(eventType: string): string {
  switch (eventType) {
    case "okay_confirmed": return "font-bold text-sm text-brand-careGreen";
    case "reorientation_card_viewed": return "font-bold text-sm text-brand-careRust";
    case "caregiver_called": return "font-bold text-sm text-brand-careTeal";
    case "emergency_called": return "font-bold text-sm text-red-600";
    case "helper_card_shown": return "font-bold text-sm text-amber-600";
    default: return "font-bold text-sm text-brand-careText";
  }
}

function activityDisplayLabel(eventType: string): string {
  switch (eventType) {
    case "okay_confirmed": return "Confirmed okay";
    case "reorientation_card_viewed": return "Viewed guidance";
    case "checkin_submitted": return "Submitted check-in";
    case "caregiver_called": return "Called caregiver";
    case "emergency_called": return "Called Emergency Services";
    case "helper_card_shown": return "Showed helper card";
    default: return eventType.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
}

function formatQuestionKey(key: string): string {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default function CaregiverPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [caregiverRole, setCaregiverRole] = useState<"primary" | "family" | "read_only" | null | undefined>(undefined);
  const [caregiverDisplayName, setCaregiverDisplayName] = useState<string | null>(null);
  const [caregiverDisplayLabel, setCaregiverDisplayLabel] = useState<string | null>(null);
  const [stabilityScore, setStabilityScore] = useState<number | null>(null);
  const [activeIsPrimaryContact, setActiveIsPrimaryContact] = useState<boolean>(true);
  const [primaryContactName, setPrimaryContactName] = useState<string | null>(null);
  const [lostAlertDismissed, setLostAlertDismissed] = useState(false);
  const [callingUser, setCallingUser] = useState(false);
  const [activityFeedCollapsed, setActivityFeedCollapsed] = useState(false);
  const [activityFeedShowAll, setActivityFeedShowAll] = useState(false);

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

  const showLostAlert =
    state.activeScenarioId === "lost_unknown_location" &&
    state.browserLocation !== null &&
    state.activeLocationSource === "browser_geolocation" &&
    !lostAlertDismissed;

  const lastOkayEvent = state.activityEvents.filter((e) => e.eventType === "okay_confirmed").sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] ?? null;
  const lastCheckInEvent = state.activityEvents.filter((e) => e.eventType === "checkin_submitted").sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] ?? null;
  const headerCaregiverName = caregiverDisplayName ?? state.profile.caregiverName;
  const headerCaregiverLabel = caregiverDisplayLabel ?? state.profile.caregiverRelationshipLabel ?? "caregiver";
  const words = pronounWords(state.profile.pronouns, state.profile.customPronouns);
  const ACTIVITY_LIMIT = 5;
  const visibleActivityItems = activityFeedShowAll ? activityPanelItems : activityPanelItems.slice(0, ACTIVITY_LIMIT);
  const activityHasMore = activityPanelItems.length > ACTIVITY_LIMIT;

  if (state.profile.independentMode) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Your care space is ready</h1>
            <p className="text-base text-brand-muted">
              {state.profile.preferredName} is using Claira independently. No caregiver has been connected yet.
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
              {state.profile.preferredName} is using Claira independently. No caregiver has been connected yet.
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

  // Primary caregiver view
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-brand-careBg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-start justify-between bg-brand-careBg px-4 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <BrandLogo size={40} />
          <div>
            <h1 className="text-xl font-bold leading-tight text-brand-careText">Caregiver Dashboard</h1>
            <p className="mt-0.5 text-sm text-brand-careMuted">Viewing as {headerCaregiverName} ({headerCaregiverLabel})</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-base font-semibold text-brand-careText">{state.profile.preferredName}</span>
          <div className="mt-1 flex items-center gap-1.5 rounded-full bg-brand-careGreenLight px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-brand-careGreen" />
            <span className="text-xs font-medium text-brand-careGreen">Active</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="space-y-4 px-4 pb-8">
        {/* Lost alert */}
        {showLostAlert ? (
          <div className="space-y-2 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <p className="font-bold text-brand-careText">
              Alert: {state.profile.preferredName} is outside {words.possessive ?? "their"} usual area
            </p>
            <p className="text-sm font-medium text-brand-careText">{state.resolvedAddress ?? "Location unknown"}</p>
            <p className="text-sm text-brand-careMuted">
              {state.profile.preferredName} has been at this unknown location for 15 minutes. This is not a recognized saved place.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCallingUser(true)}
                className="flex-1 rounded-xl bg-brand-careGreen py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none"
              >
                Call {state.profile.preferredName}
              </button>
              <button
                type="button"
                onClick={() => setLostAlertDismissed(true)}
                className="flex-1 rounded-xl border border-brand-careBorder bg-white py-2.5 text-sm font-semibold text-brand-careText shadow-sm focus:outline-none"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Cell 1: Where */}
          <div className="flex min-h-[110px] flex-col justify-between rounded-2xl border border-brand-careBorder bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-brand-careMuted">Where {state.profile.preferredName} Is</p>
            <MemoryIcon name="home" className="mt-2 h-6 w-6 text-brand-careGreen" />
            <div>
              <p className="font-bold text-sm text-brand-careText">{activeLocationSummary.label}</p>
              {(activeLocationSummary.detail ?? activeLocationSummary.trustedPlaceAddress) ? (
                <p className="truncate text-xs text-brand-careMuted">
                  {activeLocationSummary.detail ?? activeLocationSummary.trustedPlaceAddress}
                </p>
              ) : null}
            </div>
          </div>

          {/* Cell 2: How */}
          <div className="flex min-h-[110px] flex-col justify-between rounded-2xl border border-brand-careBorder bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-brand-careMuted">How {state.profile.preferredName} Is Doing</p>
            <MemoryIcon name="checkCircle" className="mt-2 h-6 w-6 text-brand-careRust" />
            <div>
              {okayConfirmations > 0 && lastOkayEvent ? (
                <>
                  <p className="font-bold text-sm text-brand-careText">Felt okay</p>
                  <p className="text-xs text-brand-careMuted">Confirmed this session</p>
                </>
              ) : emergencyCalls > 0 ? (
                <>
                  <p className="font-bold text-sm text-red-600">Alert</p>
                  <p className="text-xs text-brand-careMuted">Emergency event</p>
                </>
              ) : (
                <p className="text-sm text-brand-careMuted">No recent signal</p>
              )}
            </div>
          </div>

          {/* Cell 3: Last Check-In */}
          <div className="flex min-h-[110px] flex-col justify-between rounded-2xl border border-brand-careBorder bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-brand-careMuted">Last Check-In</p>
            <MemoryIcon name="clock" className="mt-2 h-6 w-6 text-brand-careRust" />
            <div>
              {lastCheckInEvent ? (
                <>
                  <p className="font-bold text-sm text-brand-careText">
                    {new Date(lastCheckInEvent.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-brand-careMuted">In current session</p>
                </>
              ) : (
                <p className="text-sm text-brand-careMuted">No check-in yet</p>
              )}
            </div>
          </div>

          {/* Cell 4: Today's Events */}
          <div className="flex min-h-[110px] flex-col justify-between rounded-2xl border border-brand-careBorder bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-brand-careMuted">Today&apos;s Events</p>
            <MemoryIcon name="calendar" className="mt-2 h-6 w-6 text-brand-careRust" />
            <div>
              <p className="text-3xl font-bold text-brand-careText">{state.activityEvents.length}</p>
              <p className="text-xs text-brand-careMuted">events today</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className={emergencyCalls > 0 ? "rounded-xl border border-red-200 bg-red-50 p-3 text-center" : "rounded-xl border border-brand-careBorder bg-white p-3 text-center shadow-sm"}>
            <p className={`mb-1 text-xs font-medium ${emergencyCalls > 0 ? "text-red-600" : "text-brand-careMuted"}`}>Emergency calls</p>
            <p className={`text-xl font-bold ${emergencyCalls > 0 ? "text-red-600" : "text-brand-careText"}`}>{emergencyCalls}</p>
          </div>
          <div className="rounded-xl border border-brand-careBorder bg-white p-3 text-center shadow-sm">
            <p className="mb-1 text-xs font-medium text-brand-careMuted">{missedCallsLabel}</p>
            <p className="text-xl font-bold text-brand-careText">{missedCalls}</p>
          </div>
          <div className="rounded-xl border border-brand-careBorder bg-white p-3 text-center shadow-sm">
            <p className="mb-1 text-xs font-medium text-brand-careMuted">Felt okay</p>
            <p className="text-xl font-bold text-brand-careText">{okayConfirmations}</p>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-brand-careBorder bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemoryIcon name="bell" className="h-4 w-4 text-brand-careRust" />
              <h3 className="font-bold text-sm text-brand-careText">{`${state.profile.preferredName}'s Activity`}</h3>
            </div>
            <button
              type="button"
              onClick={() => setActivityFeedCollapsed((prev) => !prev)}
              className="text-sm font-medium text-brand-careMuted focus:outline-none"
            >
              {activityFeedCollapsed ? "Show" : "Hide"}
            </button>
          </div>

          {!activityFeedCollapsed ? (
            <>
              {activityPanelItems.length === 0 ? (
                <p className="text-sm text-brand-careMuted">No activity from the app yet.</p>
              ) : (
                <div className="space-y-4">
                  {visibleActivityItems.map((item) => {
                    const quote = typeof item.metadata?.question === "string" && item.metadata.question
                      ? formatQuestionKey(item.metadata.question as string)
                      : typeof item.metadata?.ai_response === "string" && item.metadata.ai_response
                        ? (item.metadata.ai_response as string).length > 80
                          ? (item.metadata.ai_response as string).slice(0, 80) + "…"
                          : (item.metadata.ai_response as string)
                        : null;
                    const hasTrustedPlace = typeof item.metadata?.trustedPlace === "string" && !!item.metadata.trustedPlace;
                    const hasLocation = hasTrustedPlace || !!item.scenarioId;
                    const locationText = hasTrustedPlace
                      ? (item.metadata!.trustedPlace as string)
                      : activeLocationSummary.label;

                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activityDotClass(item.eventType)}`} />
                        <div>
                          <p className="mb-0.5 text-xs text-brand-careMuted">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className={activityLabelClass(item.eventType)}>{activityDisplayLabel(item.eventType)}</p>
                          {quote ? (
                            <p className="text-sm italic text-brand-careText">&ldquo;{quote}&rdquo;</p>
                          ) : null}
                          {hasLocation ? (
                            <p className="text-xs text-brand-careMuted">
                              {locationText}{item.scenarioId ? ` · ${item.scenarioId.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}` : ""}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {activityHasMore ? (
                <button
                  type="button"
                  onClick={() => setActivityFeedShowAll((prev) => !prev)}
                  className="mt-4 block w-full border-t border-brand-careBorder pt-4 text-center text-sm font-medium text-brand-careRust focus:outline-none"
                >
                  {activityFeedShowAll ? "Show less" : "Show more"}
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        {/* Today's Snapshot */}
        <div className="rounded-2xl border border-brand-careBorder bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-bold text-sm text-brand-careText">Today&apos;s Snapshot</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MemoryIcon name="calendar" className="h-4 w-4 text-brand-careMuted" />
                <span className="text-sm text-brand-careText">Events</span>
              </div>
              <span className="text-sm font-medium text-brand-careText">{state.activityEvents.length}</span>
            </div>
            <div className="h-px bg-brand-careBorder" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MemoryIcon name="mapPin" className="h-4 w-4 text-brand-careMuted" />
                <span className="text-sm text-brand-careText">Location Mode</span>
              </div>
              <span className="text-sm font-medium text-brand-careText">{activeLocationSummary.locationModeLabel}</span>
            </div>
            <div className="h-px bg-brand-careBorder" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MemoryIcon name="checkCircle" className="h-4 w-4 text-brand-careMuted" />
                <span className="text-sm text-brand-careText">Routine</span>
              </div>
              <span className="text-sm font-medium text-brand-careText">{activeLocationSummary.placeId ? "Normal" : "Alert"}</span>
            </div>
            <div className="h-px bg-brand-careBorder" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MemoryIcon name="shield" className="h-4 w-4 text-brand-careMuted" />
                <span className="text-sm text-brand-careText">Notes</span>
              </div>
              <span className="text-sm font-medium text-brand-careText">None</span>
            </div>
          </div>
        </div>

        {/* Event log */}
        <EventLogList items={state.systemEvents} defaultCollapsed={true} title="Event Log" plain={true} emptyText="No system events yet." />

        {/* Insights button */}
        <Link
          href="/caregiver/insights"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-careBorder bg-white py-3 text-sm font-medium text-brand-careText shadow-sm focus:outline-none"
        >
          <span>Insights</span>
          <MemoryIcon name="chevronRight" className="h-4 w-4 text-brand-careMuted" />
        </Link>
      </div>

      {callingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg">
            <p className="text-xl font-semibold text-brand-text">Calling Alex...</p>
            <p className="mt-2 text-sm text-brand-muted">This is a demo. No real call is placed.</p>
            <button
              type="button"
              onClick={() => setCallingUser(false)}
              className="mt-4 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
