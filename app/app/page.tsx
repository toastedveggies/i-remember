"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CheckInCard from "@/components/CheckInCard";
import EventLogList from "@/components/EventLogList";
import HelperModal from "@/components/HelperModal";
import ResponseCard from "@/components/ResponseCard";
import SupportActionCard from "@/components/SupportActionCard";
import TodayCard from "@/components/TodayCard";
import MemoryIcon from "@/components/MemoryIcon";
import {
  appendActivityEvent,
  appendSystemEvent,
  checkInQuestions,
  createEvent,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type DemoState,
  type UncertaintyLevel
} from "@/data/demoState";
import { contextPackets } from "@/data/demoData";

const RECENT_GUIDANCE_KEY = "recentGuidance";

type QuestionKey = "where_am_i" | "what_is_happening" | "what_should_i_do_next";
type GuidanceEntry = { question: string; response: string; timestamp: string };

const questionLabels: Record<QuestionKey, string> = {
  where_am_i: "Where am I?",
  what_is_happening: "What is happening?",
  what_should_i_do_next: "What should I do next?",
};

function loadRecentGuidance(): GuidanceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_GUIDANCE_KEY) ?? "[]") as GuidanceEntry[];
  } catch {
    return [];
  }
}

function saveRecentGuidance(entry: GuidanceEntry): void {
  if (typeof window === "undefined") return;
  const existing = loadRecentGuidance();
  const updated = [entry, ...existing].slice(0, 10);
  window.localStorage.setItem(RECENT_GUIDANCE_KEY, JSON.stringify(updated));
}

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
  const [callingEmergency, setCallingEmergency] = useState(false);
  const [lastGuidanceUpdate, setLastGuidanceUpdate] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [state, setState] = useState<DemoState>(initialDemoState);

  // Floating emergency button
  const [emergencyExpanded, setEmergencyExpanded] = useState(false);

  useEffect(() => {
    if (!emergencyExpanded) return;
    const t = setTimeout(() => setEmergencyExpanded(false), 4000);
    return () => clearTimeout(t);
  }, [emergencyExpanded]);

  // Help Me Now flow
  const [helpMeNowOpen, setHelpMeNowOpen] = useState(false);
  const [streamingQuestion, setStreamingQuestion] = useState<QuestionKey | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [streamPanelOpen, setStreamPanelOpen] = useState(false);
  const [recentGuidanceOpen, setRecentGuidanceOpen] = useState(false);
  const [recentGuidance, setRecentGuidance] = useState<GuidanceEntry[]>([]);

  useEffect(() => {
    setState(loadState());
    setRecentGuidance(loadRecentGuidance());
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const contextPacket = contextPackets[state.activeScenarioId] ?? contextPackets.unknown;

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

  const handleHelpMeNow = () => {
    const withStart = appendActivityEvent(
      state,
      createEvent("reorientation_started", "app", activeScenario.id, { uncertainty: activeScenario.uncertainty }, state.profile.userId)
    );
    persist(withStart);
    setHelpMeNowOpen(true);
    setLastGuidanceUpdate(new Date().toLocaleTimeString());
  };

  const askQuestion = async (key: QuestionKey) => {
    const packet = contextPackets[activeScenario.id] ?? contextPackets.unknown;
    setStreamingQuestion(key);
    setStreamedText("");
    setStreamingLoading(true);
    setStreamPanelOpen(true);

    try {
      const res = await fetch("/api/reorient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: key,
          context: packet,
          userName: state.profile.preferredName,
        }),
      });

      if (!res.ok || !res.body) {
        setStreamedText("I am here with you. Please take a breath. If you need help, contact your caregiver.");
        setStreamingLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamedText(fullText);
      }

      setStreamingLoading(false);

      const entry: GuidanceEntry = {
        question: questionLabels[key],
        response: fullText,
        timestamp: new Date().toISOString(),
      };
      saveRecentGuidance(entry);
      setRecentGuidance(loadRecentGuidance());

      const withViewed = appendActivityEvent(
        state,
        createEvent("reorientation_card_viewed", "app", activeScenario.id, { question: key }, state.profile.userId)
      );
      persist(withViewed);
    } catch {
      setStreamedText("I am here with you. Please take a breath. If you need help, contact your caregiver.");
      setStreamingLoading(false);
    }
  };

  const dismissStreamPanel = () => {
    setStreamPanelOpen(false);
    setStreamingQuestion(null);
    setStreamedText("");
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
    setSelectedQuestion("");
  };

  const callCaregiver = () => {
    persist(appendActivityEvent(state, createEvent("caregiver_called", "app", activeScenario.id, undefined, state.profile.userId)));
    setCallingCaregiver(true);
  };

  const callEmergency = () => {
    persist(appendActivityEvent(state, createEvent("emergency_called", "app", activeScenario.id, undefined, state.profile.userId)));
    setCallingEmergency(true);
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

        {/* Passive today card */}
        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <MemoryIcon name="clock" className="h-6 w-6 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-text">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h2>
          </div>
          <p className="text-sm text-brand-muted"><span className="font-medium text-brand-text">Where:</span> {contextPacket.location}</p>
          <p className="text-sm text-brand-muted"><span className="font-medium text-brand-text">Next:</span> {contextPacket.next_event}</p>
        </section>

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
                onClick={handleHelpMeNow}
                className="min-h-14 w-full rounded-2xl bg-brand-primary px-4 py-4 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                Help Me Now
              </button>
              <p className="text-sm text-brand-muted">
                {lastGuidanceUpdate
                  ? `Last used at ${lastGuidanceUpdate}.`
                  : "Tap for step-by-step guidance about where you are and what to do."}
              </p>

              <button
                type="button"
                onClick={() => setRecentGuidanceOpen(true)}
                className="text-sm text-brand-muted underline underline-offset-2 text-left"
              >
                Recent guidance
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryIcon name="checkCircle" className="h-7 w-7 text-green-500" />
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
          <Link
            href="/app/insights"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            My Insights
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Recent demo events</h2>
          <EventLogList items={eventItems} defaultCollapsed />
        </section>
      </div>

      <p className="mt-3 text-center text-xs text-brand-muted">
        Prototype note: data is stored in this browser session for demo purposes.
      </p>

      {/* Floating emergency button */}
      {emergencyExpanded ? (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setEmergencyExpanded(false)}
          aria-hidden="true"
        />
      ) : null}
      <button
        type="button"
        aria-label="Emergency"
        onClick={() => {
          if (emergencyExpanded) {
            callEmergency();
            setEmergencyExpanded(false);
          } else {
            setEmergencyExpanded(true);
          }
        }}
        className={`fixed bottom-4 left-4 z-40 flex h-12 items-center overflow-hidden rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 ${
          emergencyExpanded
            ? "w-[272px] gap-2.5 bg-red-600 px-5"
            : "w-12 justify-center bg-red-900"
        }`}
      >
        <MemoryIcon name="shield" className="h-5 w-5 shrink-0 text-white" />
        {emergencyExpanded ? (
          <span className="whitespace-nowrap text-sm font-semibold text-white">
            Urgent: Call Emergency Services
          </span>
        ) : null}
      </button>

      <HelperModal open={helperOpen} onClose={() => setHelperOpen(false)} profile={state.profile} onCallCaregiver={callCaregiver} onCallEmergency={callEmergency} />

      {/* Question selection modal */}
      {helpMeNowOpen && !streamPanelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold text-brand-text">What would you like to know?</h2>
            <div className="space-y-3">
              {(["where_am_i", "what_is_happening", "what_should_i_do_next"] as QuestionKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => askQuestion(key)}
                  disabled={streamingLoading}
                  className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-left text-base font-medium text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
                >
                  {questionLabels[key]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setHelpMeNowOpen(false)}
              className="text-sm text-brand-muted underline underline-offset-2"
            >
              Back
            </button>
          </div>
        </div>
      ) : null}

      {/* Streaming response panel */}
      {streamPanelOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-3">
              {streamingQuestion ? questionLabels[streamingQuestion] : ""}
            </p>
            <div className="min-h-24 text-base leading-relaxed text-brand-text">
              {streamingLoading && !streamedText ? (
                <span className="text-brand-muted">One moment…</span>
              ) : (
                streamedText
              )}
              {streamingLoading ? <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-brand-primary" /> : null}
            </div>
            {!streamingLoading ? (
              <button
                type="button"
                onClick={dismissStreamPanel}
                className="mt-5 min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                Got it
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Recent guidance panel */}
      {recentGuidanceOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-brand-text mb-4">Recent guidance</h2>
            {recentGuidance.length === 0 ? (
              <p className="text-sm text-brand-muted">No guidance yet. Tap Help Me Now to get started.</p>
            ) : (
              <ul className="space-y-4">
                {recentGuidance.slice(0, 5).map((entry, i) => (
                  <li key={i} className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-1">
                    <p className="text-xs font-semibold text-brand-muted">{entry.question} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-sm text-brand-text leading-relaxed">{entry.response}</p>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setRecentGuidanceOpen(false)}
              className="mt-5 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {callingEmergency ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg">
            <p className="text-xl font-semibold text-brand-text">Calling 911…</p>
            <p className="mt-2 text-sm text-brand-muted">This is a demo. No real call is placed.</p>
            <button
              type="button"
              onClick={() => setCallingEmergency(false)}
              className="mt-4 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

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
