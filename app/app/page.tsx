"use client";

import { useEffect, useMemo, useState } from "react";
import CheckInCard from "@/components/CheckInCard";
import EventLogList from "@/components/EventLogList";
import HelperModal from "@/components/HelperModal";
import ResponseCard from "@/components/ResponseCard";
import SupportActionCard from "@/components/SupportActionCard";
import TodayCard from "@/components/TodayCard";
import MemoryIcon from "@/components/MemoryIcon";
import {
  checkInQuestions,
  createEvent,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type DemoEvent,
  type DemoState,
  type UncertaintyLevel
} from "@/data/demoState";

function fallbackCopy(level: UncertaintyLevel): string {
  if (level === "low") {
    return "I can confirm your current routine context. A few details are missing, so we will focus on the next simple step.";
  }

  if (level === "medium") {
    return "I am not fully sure about every detail right now. Please check your next activity card, and contact your caregiver if this still feels unclear.";
  }

  return "I do not have enough context to guide this safely. Please pause and contact your caregiver now. If this feels urgent or unsafe, call emergency services immediately.";
}

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

function saveState(nextState: DemoState): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
  }
}

function appendActivityEvent(state: DemoState, event: DemoEvent): DemoState {
  return { ...state, activityEvents: [event, ...state.activityEvents].slice(0, 50) };
}

function appendSystemEvent(state: DemoState, event: DemoEvent): DemoState {
  return { ...state, systemEvents: [event, ...state.systemEvents].slice(0, 20) };
}

function recommendedNextAction(question: string, caregiverName: string): string {
  if (question.includes("slow breath")) {
    return "Take three slow breaths, then re-read the 'What should I do next?' card.";
  }

  if (question.includes("plan for tonight")) {
    return "Review your next routine step, then refresh guidance if anything still feels unclear.";
  }

  if (question.includes("calling your caregiver")) {
    return `Call ${caregiverName} for reassurance now.`;
  }

  return "Take a short pause and review your next step card.";
}

export default function TodayWindowPage() {
  const [helperOpen, setHelperOpen] = useState(false);
  const [callingCaregiver, setCallingCaregiver] = useState(false);
  const [showEmergencyNote, setShowEmergencyNote] = useState(false);
  const [lastGuidanceUpdate, setLastGuidanceUpdate] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [state, setState] = useState<DemoState>(initialDemoState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);

  const persist = (nextState: DemoState) => {
    setState(nextState);
    saveState(nextState);
  };

  const refreshGuidance = () => {
    const withStart = appendActivityEvent(
      state,
      createEvent("reorientation_started", "app", activeScenario.id, { uncertainty: activeScenario.uncertainty }, state.profile.userId)
    );
    const withViewed = appendSystemEvent(
      withStart,
      createEvent("reorientation_card_viewed", "app", activeScenario.id, undefined, state.profile.userId)
    );
    if (activeScenario.uncertainty === "high") {
      const withFallback = appendActivityEvent(
        withViewed,
        createEvent("fallback_shown", "app", activeScenario.id, { level: activeScenario.uncertainty }, state.profile.userId)
      );
      persist(withFallback);
    } else {
      persist(withViewed);
    }
    setLastGuidanceUpdate(new Date().toLocaleTimeString());
  };

  const submitCheckIn = () => {
    if (!selectedQuestion) {
      return;
    }

    const status = `Check-in saved: ${selectedQuestion}`;
    const nextAction = recommendedNextAction(selectedQuestion, state.profile.caregiverName);
    const next = appendActivityEvent(
      { ...state, checkInStatus: `${status} Recommended next action: ${nextAction}` },
      createEvent("checkin_submitted", "app", activeScenario.id, { question: selectedQuestion }, state.profile.userId)
    );
    persist(next);
  };

  const callCaregiver = () => {
    persist(appendActivityEvent(state, createEvent("caregiver_called", "app", activeScenario.id, undefined, state.profile.userId)));
    setCallingCaregiver(true);
  };

  const fallbackMessage = fallbackCopy(activeScenario.uncertainty);

  const eventItems = [...state.activityEvents, ...state.systemEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Today Window</h1>
          <p className="text-base font-medium text-brand-text">Hello, {state.profile.preferredName}.</p>
          <p className="text-base text-brand-muted">Calm, human support for moments of confusion.</p>
          <p className="text-sm text-brand-muted">Active scenario: {activeScenario.label}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Main actions</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryIcon name="home" className="h-7 w-7 text-brand-primary" />
                <h3 className="text-xl font-semibold text-brand-text">Help me understand what is happening</h3>
              </div>

              <button
                type="button"
                onClick={refreshGuidance}
                className="min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                Help me now
              </button>
              <p className="text-sm text-brand-muted">
                {lastGuidanceUpdate
                  ? `Guidance refreshed at ${lastGuidanceUpdate}.`
                  : "This refreshes your guidance cards and logs a support moment."}
              </p>

              <>
                <TodayCard title="Where am I?" body={activeScenario.where} iconName="mapPin" variant="row" />
                <TodayCard title="What is happening?" body={activeScenario.happening} iconName="clock" variant="row" />
                <ResponseCard title="What should I do next?" message={activeScenario.nextStep} variant="row" />
                {activeScenario.uncertainty === "high" ? (
                  <ResponseCard title="Fallback guidance" message={fallbackMessage} variant="row" />
                ) : null}
              </>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryIcon name="checkCircle" className="h-7 w-7 text-brand-primary" />
                <h3 className="text-xl font-semibold text-brand-text">Do a quick check-in</h3>
              </div>
              <CheckInCard
                questions={checkInQuestions}
                selectedQuestion={selectedQuestion}
                submittedState={state.checkInStatus}
                onSelectQuestion={setSelectedQuestion}
                onSubmit={submitCheckIn}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Support actions</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <SupportActionCard
              iconName="phone"
              title="Call caregiver"
              description={`Call ${state.profile.caregiverName} for reassurance.`}
              buttonLabel={`Call ${state.profile.caregiverName}`}
              onClick={callCaregiver}
            />

            <SupportActionCard
              iconName="shield"
              title="Show helper card"
              description="A simple screen you can show to a nearby person."
              buttonLabel="Show helper card"
              onClick={() => {
                persist(appendActivityEvent(state, createEvent("helper_card_shown", "app", activeScenario.id, undefined, state.profile.userId)));
                setHelperOpen(true);
              }}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Recent demo events</h2>
          <EventLogList items={eventItems} defaultCollapsed />
        </section>
      </div>

      <section className="sticky bottom-3 mt-6 rounded-3xl border border-brand-border bg-brand-surface p-4 shadow-sm">
        <h2 className="text-base font-semibold text-brand-text">Need urgent support?</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Contact {state.profile.caregiverName} now. If there is immediate danger, call emergency services.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={callCaregiver}
            className="flex min-h-12 items-center justify-center rounded-2xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
          >
            {`Call ${state.profile.caregiverName}`}
          </button>
          <button
            type="button"
            onClick={() => setShowEmergencyNote((prev) => !prev)}
            className="flex min-h-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Urgent: call emergency services
          </button>
        </div>
        {showEmergencyNote ? (
          <p className="mt-3 rounded-2xl border border-brand-border bg-brand-bg p-3 text-sm text-brand-muted">
            If this feels urgent or unsafe, call emergency services now.
          </p>
        ) : null}
      </section>

      <p className="mt-3 text-center text-xs text-brand-muted">
        Prototype note: data is stored in this browser session for demo purposes.
      </p>

      <HelperModal open={helperOpen} onClose={() => setHelperOpen(false)} profile={state.profile} />

      {callingCaregiver ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg">
            <p className="text-xl font-semibold text-brand-text">Calling {state.profile.caregiverName}…</p>
            <p className="mt-2 text-sm text-brand-muted">This is a demo. No real call is placed.</p>
            <button
              type="button"
              onClick={() => setCallingCaregiver(false)}
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
