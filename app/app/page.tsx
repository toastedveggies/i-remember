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

function appendEvent(state: DemoState, event: DemoEvent): DemoState {
  return { ...state, events: [event, ...state.events].slice(0, 20) };
}

export default function TodayWindowPage() {
  const [helperOpen, setHelperOpen] = useState(false);
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
    const withStart = appendEvent(
      state,
      createEvent("reorientation_started", "app", activeScenario.id, { uncertainty: activeScenario.uncertainty }, state.profile.userId)
    );
    const withViewed = appendEvent(
      withStart,
      createEvent("reorientation_card_viewed", "app", activeScenario.id, undefined, state.profile.userId)
    );
    const withFallback = appendEvent(
      withViewed,
      createEvent("fallback_shown", "app", activeScenario.id, { level: activeScenario.uncertainty }, state.profile.userId)
    );
    persist(withFallback);
    setLastGuidanceUpdate(new Date().toLocaleTimeString());
  };

  const submitCheckIn = () => {
    if (!selectedQuestion) {
      return;
    }

    const status = `Check-in saved: ${selectedQuestion}`;
    const next = appendEvent(
      { ...state, checkInStatus: status },
      createEvent("checkin_submitted", "app", activeScenario.id, { question: selectedQuestion }, state.profile.userId)
    );
    persist(next);
  };

  const fallbackMessage = fallbackCopy(activeScenario.uncertainty);

  const eventItems = state.events;

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
                {lastGuidanceUpdate ? `Guidance refreshed at ${lastGuidanceUpdate}.` : "Tap once to refresh guidance and log this support moment."}
              </p>

              <>
                <TodayCard title="Where am I?" body={activeScenario.where} iconName="mapPin" variant="row" />
                <TodayCard title="What is happening?" body={activeScenario.happening} iconName="clock" variant="row" />
                <ResponseCard title="What should I do next?" message={activeScenario.nextStep} variant="row" />
                <ResponseCard title="Fallback guidance" message={fallbackMessage} variant="row" />
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
              href="tel:+15551234567"
            />

            <SupportActionCard
              iconName="shield"
              title="Show helper card"
              description="A simple screen you can show to a nearby person."
              buttonLabel="Show helper card"
              onClick={() => setHelperOpen(true)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Recent demo events</h2>
          <EventLogList items={eventItems} defaultCollapsed />
        </section>
      </div>

      <HelperModal open={helperOpen} onClose={() => setHelperOpen(false)} profile={state.profile} />
    </main>
  );
}
