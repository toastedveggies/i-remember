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
  demoProfile,
  demoUser,
  findScenario,
  initialDemoState,
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
    return JSON.parse(raw) as DemoState;
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
  const [hasStartedReorientation, setHasStartedReorientation] = useState(false);
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

  const startReorientation = () => {
    const withStart = appendEvent(
      state,
      createEvent("reorientation_started", "app", activeScenario.id, { uncertainty: activeScenario.uncertainty })
    );
    const withViewed = appendEvent(withStart, createEvent("reorientation_card_viewed", "app", activeScenario.id));
    const withFallback = appendEvent(
      withViewed,
      createEvent("fallback_shown", "app", activeScenario.id, { level: activeScenario.uncertainty })
    );
    persist(withFallback);
    setHasStartedReorientation(true);
  };

  const submitCheckIn = () => {
    if (!selectedQuestion) {
      return;
    }

    const status = `Check-in saved: ${selectedQuestion}`;
    const next = appendEvent(
      { ...state, checkInStatus: status },
      createEvent("checkin_submitted", "app", activeScenario.id, { question: selectedQuestion })
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
          <p className="text-base font-medium text-brand-text">Hello, {demoUser.name}.</p>
          <p className="text-base text-brand-muted">Calm, human support for moments of confusion.</p>
          <p className="text-sm text-brand-muted">Active scenario: {activeScenario.label}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Main actions</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryIcon name="home" className="h-7 w-7 text-brand-primary" />
                <h3 className="text-xl font-semibold text-brand-text">Help me understand what's happening</h3>
              </div>

              <button
                type="button"
                onClick={startReorientation}
                className="min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                Start reorientation
              </button>

              {hasStartedReorientation ? (
                <>
                  <TodayCard title="Where am I?" body={activeScenario.where} iconName="mapPin" variant="row" />
                  <TodayCard title="What is happening?" body={activeScenario.happening} iconName="clock" variant="row" />
                  <ResponseCard title="What should I do next?" message={activeScenario.nextStep} variant="row" />
                  <ResponseCard title="Fallback guidance" message={fallbackMessage} variant="row" />
                </>
              ) : (
                <p className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-sm text-brand-muted">
                  Start the flow to view grounding guidance.
                </p>
              )}
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
              description={`Call ${demoProfile.caregiverName} for reassurance.`}
              buttonLabel={`Call ${demoProfile.caregiverName}`}
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

      <HelperModal open={helperOpen} onClose={() => setHelperOpen(false)} />
    </main>
  );
}
