"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EventLogList from "@/components/EventLogList";
import HelperModal from "@/components/HelperModal";
import MemoryIcon from "@/components/MemoryIcon";
import {
  appendActivityEvent,
  createEvent,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type DemoState,
} from "@/data/demoState";
import { buildActiveLocationSummary, buildContextPacket } from "@/data/demoData";
import { resolveActiveLocationContext } from "@/lib/places";

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
    return "Take three slow breaths, then look at the next step card again.";
  }

  if (question.includes("plan")) {
    return "Review the next event and gather only the items you need right now.";
  }

  if (question.includes("calling your caregiver")) {
    return `Call ${caregiverName} for reassurance now.`;
  }

  return "Pause, read the next step slowly, and ask for support if you want it.";
}

function timeGreeting(name: string): string {
  const hour = new Date().getHours();
  const preferredName = name || "Alex";
  if (hour >= 5 && hour < 12) return `Good morning, ${preferredName}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${preferredName}.`;
  if (hour >= 17 && hour < 21) return `Good evening, ${preferredName}.`;
  return `Good night, ${preferredName}.`;
}

export default function TodayWindowPage() {
  const [helperOpen, setHelperOpen] = useState(false);
  const [callingCaregiver, setCallingCaregiver] = useState(false);
  const [callingEmergency, setCallingEmergency] = useState(false);
  const [lastGuidanceUpdate, setLastGuidanceUpdate] = useState<string | null>(null);
  const [state, setState] = useState<DemoState>(initialDemoState);

  const [emergencyExpanded, setEmergencyExpanded] = useState(false);

  useEffect(() => {
    if (!emergencyExpanded) return;
    const timeout = setTimeout(() => setEmergencyExpanded(false), 4000);
    return () => clearTimeout(timeout);
  }, [emergencyExpanded]);

  const [helpMeNowOpen, setHelpMeNowOpen] = useState(false);
  const [streamingQuestion, setStreamingQuestion] = useState<QuestionKey | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [streamPanelOpen, setStreamPanelOpen] = useState(false);
  const [recentGuidanceOpen, setRecentGuidanceOpen] = useState(false);
  const [recentGuidance, setRecentGuidance] = useState<GuidanceEntry[]>([]);

  const [checkInDoneThisSession, setCheckInDoneThisSession] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInQuestionsLoading, setCheckInQuestionsLoading] = useState(false);
  const [aiCheckInQuestions, setAiCheckInQuestions] = useState<string[]>([]);
  const [checkInSelectedQuestion, setCheckInSelectedQuestion] = useState("");
  const [checkInResponseOpen, setCheckInResponseOpen] = useState(false);
  const [checkInResponseText, setCheckInResponseText] = useState("");
  const [checkInResponseLoading, setCheckInResponseLoading] = useState(false);
  const [checkInActiveQuestion, setCheckInActiveQuestion] = useState("");

  useEffect(() => {
    setState(loadState());
    setRecentGuidance(loadRecentGuidance());
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
    [state.activeScenarioId, state.activeLocationSource, state.browserLocation, state.profile, state.trustedLocations]
  );

  const contextPacket = useMemo(
    () => buildContextPacket({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeScenarioId, state.activeLocationSource, state.browserLocation, state.profile, state.trustedLocations]
  );

  const persist = (nextState: DemoState) => {
    setState(nextState);
    saveState(nextState);
  };

  const eventLocationDetails = useMemo(
    () => ({
      placeId: resolvedLocation.matchedPlaceId,
      latitude: resolvedLocation.coordinates.latitude,
      longitude: resolvedLocation.coordinates.longitude,
      accuracyMeters: resolvedLocation.accuracyMeters,
      locationSource: resolvedLocation.source,
    }),
    [resolvedLocation]
  );

  const createLocationEvent = (eventType: string, metadata?: Record<string, unknown>) =>
    createEvent(
      eventType,
      "app",
      activeScenario.id,
      metadata,
      state.profile.userId,
      eventLocationDetails
    );

  const handleHelpMeNow = () => {
    let nextState = appendActivityEvent(
      state,
      createLocationEvent("reorientation_started", {
        uncertainty: activeScenario.uncertainty,
        locationMode: resolvedLocation.locationMode,
        trustedPlace: activeLocationSummary.trustedPlaceName,
      })
    );

    if (resolvedLocation.locationMode === "other") {
      nextState = appendActivityEvent(
        nextState,
        createLocationEvent("fallback_shown", {
          level: "high",
          reason: "unrecognized_location",
          message: "I do not recognize this as one of your saved trusted places.",
        })
      );
    }

    persist(nextState);
    setHelpMeNowOpen(true);
    setLastGuidanceUpdate(new Date().toLocaleTimeString());
  };

  const askQuestion = async (key: QuestionKey) => {
    setStreamingQuestion(key);
    setStreamedText("");
    setStreamingLoading(true);
    setStreamPanelOpen(true);

    try {
      const response = await fetch("/api/reorient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: key,
          context: contextPacket,
          userName: state.profile.preferredName,
        }),
      });

      if (!response.ok || !response.body) {
        setStreamedText("I am here with you. Please take a breath. If you need help, contact your caregiver.");
        setStreamingLoading(false);
        return;
      }

      const reader = response.body.getReader();
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

      persist(
        appendActivityEvent(
          state,
          createLocationEvent("reorientation_card_viewed", {
            question: key,
            locationMode: resolvedLocation.locationMode,
            trustedPlace: activeLocationSummary.trustedPlaceName,
          })
        )
      );
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

  const handleOpenCheckIn = () => {
    setCheckInOpen(true);
    setCheckInQuestionsLoading(true);
    setAiCheckInQuestions([]);
    setCheckInSelectedQuestion("");

    const recentQuestion = loadRecentGuidance()[0]?.question ?? null;

    fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "questions",
        context: {
          ...contextPacket,
          scenario: activeScenario.id,
          ...(recentQuestion ? { recentHelpMeNowQuestion: recentQuestion } : {}),
        },
        userName: state.profile.preferredName,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json() as Promise<string[]>;
      })
      .then((questions) => {
        if (Array.isArray(questions) && questions.length > 0) {
          setAiCheckInQuestions(questions);
          return;
        }
        throw new Error("Invalid");
      })
      .catch(() => {
        setAiCheckInQuestions([
          "How are you feeling right now?",
          "Would you like a moment to sit and breathe?",
          "Is there anything you need help with?",
        ]);
      })
      .finally(() => setCheckInQuestionsLoading(false));
  };

  const handleCheckInTap = (question: string) => {
    if (question !== checkInSelectedQuestion) {
      setCheckInSelectedQuestion(question);
      return;
    }

    void commitCheckIn(question);
  };

  const commitCheckIn = async (question: string) => {
    const nextAction = recommendedNextAction(question, state.profile.caregiverName);
    const nextState = appendActivityEvent(
      { ...state, checkInStatus: `Check-in saved: ${question} Recommended next action: ${nextAction}` },
      createLocationEvent("checkin_submitted", {
        question,
        locationMode: resolvedLocation.locationMode,
        trustedPlace: activeLocationSummary.trustedPlaceName,
      })
    );
    persist(nextState);

    setCheckInDoneThisSession(true);
    setCheckInActiveQuestion(question);
    setCheckInResponseText("");
    setCheckInResponseLoading(true);
    setCheckInResponseOpen(true);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "response",
          context: contextPacket,
          selectedQuestion: question,
          userName: state.profile.preferredName,
        }),
      });

      if (!response.ok || !response.body) {
        setCheckInResponseText("I hear you. Take a gentle breath. You are doing well.");
        setCheckInResponseLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setCheckInResponseText(fullText);
      }

      setCheckInResponseLoading(false);
    } catch {
      setCheckInResponseText("I hear you. Take a gentle breath. You are doing well.");
      setCheckInResponseLoading(false);
    }
  };

  const callCaregiver = () => {
    persist(appendActivityEvent(state, createLocationEvent("caregiver_called")));
    setCallingCaregiver(true);
  };

  const callEmergency = () => {
    persist(appendActivityEvent(state, createLocationEvent("emergency_called")));
    setCallingEmergency(true);
  };

  const eventItems = [...state.activityEvents, ...state.systemEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const showUnknownLocationPrompt = resolvedLocation.locationMode === "other";

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-4xl font-semibold text-brand-text">Today</h1>
          <p className="text-lg text-brand-muted">{timeGreeting(state.profile.preferredName)}</p>
        </header>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MemoryIcon name="clock" className="h-6 w-6 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-text">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
          </div>
          <p className="text-sm text-brand-muted">
            <span className="font-medium text-brand-text">Where:</span> {activeLocationSummary.label}
          </p>
          {activeLocationSummary.trustedPlaceAddress ? (
            <p className="text-xs text-brand-muted">
              Saved place: {activeLocationSummary.trustedPlaceAddress}
            </p>
          ) : null}
          {activeLocationSummary.fallbackMessage ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {activeLocationSummary.fallbackMessage}
            </p>
          ) : null}
          <p className="text-sm text-brand-muted">
            <span className="font-medium text-brand-text">Next:</span> {contextPacket.next_event}
          </p>
        </section>

        <section className="space-y-3">
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOpenCheckIn}
                disabled={checkInOpen}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-4 text-base font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  checkInOpen ? "bg-green-800 opacity-75" : "bg-green-700"
                }`}
              >
                <MemoryIcon name="checkCircle" className="h-6 w-6 shrink-0 text-white" />
                {checkInDoneThisSession ? "Do another check-in" : "Do a quick check-in"}
              </button>

              {checkInOpen && checkInQuestionsLoading ? (
                <p className="text-xs text-brand-muted">Preparing your check-in...</p>
              ) : null}

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  checkInOpen && !checkInQuestionsLoading && aiCheckInQuestions.length > 0
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-2 pt-1">
                  {aiCheckInQuestions.map((question, index) => {
                    const isSelected = question === checkInSelectedQuestion;
                    const isDeselected = checkInSelectedQuestion !== "" && !isSelected;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleCheckInTap(question)}
                        className={`w-full cursor-pointer rounded-xl border p-4 text-left text-sm font-medium transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                          isSelected
                            ? "border-lime-500 bg-lime-100 text-brand-text"
                            : isDeselected
                              ? "border-brand-border bg-white text-brand-text opacity-60"
                              : "border-brand-border bg-white text-brand-text hover:bg-lime-50"
                        }`}
                      >
                        {question}
                      </button>
                    );
                  })}
                  <p className="text-xs text-brand-muted">
                    {checkInSelectedQuestion
                      ? "Tap the highlighted option again to confirm."
                      : "Tap once to select, tap again to confirm."}
                  </p>
                </div>
              </div>

              {checkInDoneThisSession && !checkInOpen ? (
                <div className="rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3">
                  <p className="text-sm font-medium text-lime-800">Check-in saved.</p>
                  <p className="mt-1 text-xs text-brand-muted">{state.checkInStatus}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleHelpMeNow}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                <MemoryIcon name="home" className="h-6 w-6 shrink-0 text-white" />
                Help Me Now
              </button>
              {lastGuidanceUpdate ? (
                <p className="text-sm text-brand-muted">Last used at {lastGuidanceUpdate}.</p>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setRecentGuidanceOpen(true)}
                  className="text-sm text-brand-muted underline underline-offset-2"
                >
                  Recent guidance
                </button>
              </div>
            </div>
          </div>
        </section>

        {showUnknownLocationPrompt ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-amber-900">Unrecognized location</h2>
            <p className="text-sm text-amber-900">
              I do not recognize this as one of your saved trusted places. Are you somewhere safe?
            </p>
            <p className="text-sm text-amber-800">
              Stay where you are if it feels safe. You can call {state.profile.caregiverName}, show your helper card, or call emergency services if this feels urgent.
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="space-y-3">
            <button
              type="button"
              onClick={callCaregiver}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
            >
              <MemoryIcon name="phone" className="h-6 w-6 shrink-0 text-white" />
              {`Call ${state.profile.caregiverName}`}
            </button>
            <p className="text-sm text-brand-muted">{`Call ${state.profile.caregiverName} for reassurance.`}</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                persist(appendActivityEvent(state, createLocationEvent("helper_card_shown")));
                setHelperOpen(true);
              }}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
            >
              <MemoryIcon name="compass" className="h-6 w-6 shrink-0 text-white" />
              Show helper card
            </button>
            <p className="text-sm text-brand-muted">A simple screen you can show to a nearby person.</p>
          </div>

          <Link
            href="/app/insights"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-blue-900 px-4 py-3 text-base font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            My Insights
          </Link>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-brand-border bg-brand-surface px-4 py-3">
            <p className="text-sm font-medium text-brand-text">Current demo context</p>
            <p className="mt-1 text-sm text-brand-muted">{activeScenario.label}</p>
          </div>
          <h2 className="text-lg font-semibold text-brand-text">Recent demo events</h2>
          <EventLogList items={eventItems} defaultCollapsed />
        </section>
      </div>

      <p className="mt-3 text-center text-xs text-brand-muted">
        Prototype note: data is stored in this browser session for demo purposes.
      </p>

      {emergencyExpanded ? (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setEmergencyExpanded(false)}
          aria-hidden="true"
        />
      ) : null}
      <div className="fixed bottom-8 left-0 z-40 flex h-20 items-stretch overflow-hidden rounded-r-2xl shadow-lg">
        <button
          type="button"
          aria-label={emergencyExpanded ? "Collapse emergency" : "Emergency"}
          onClick={() => setEmergencyExpanded((value) => !value)}
          className="flex w-12 shrink-0 items-center justify-center bg-red-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400"
        >
          <MemoryIcon name="shield" className="h-5 w-5 text-white" />
        </button>
        <button
          type="button"
          tabIndex={emergencyExpanded ? 0 : -1}
          onClick={() => { callEmergency(); setEmergencyExpanded(false); }}
          className={`flex items-center justify-center overflow-hidden bg-red-600 transition-all duration-200 focus:outline-none ${
            emergencyExpanded ? "w-[320px] px-4" : "w-0"
          }`}
        >
          <span className="whitespace-nowrap text-sm font-bold text-white">
            Urgent: Call Emergency Services
          </span>
        </button>
      </div>

      <HelperModal
        open={helperOpen}
        onClose={() => setHelperOpen(false)}
        profile={state.profile}
        activeLocationSummary={activeLocationSummary}
        contextPacket={contextPacket}
        onCallCaregiver={callCaregiver}
        onCallEmergency={callEmergency}
      />

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

      {checkInResponseOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {checkInActiveQuestion}
            </p>
            <div className="min-h-24 text-base leading-relaxed text-brand-text">
              {checkInResponseLoading && !checkInResponseText ? (
                <span className="text-brand-muted">One moment...</span>
              ) : (
                checkInResponseText
              )}
              {checkInResponseLoading ? (
                <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-brand-primary" />
              ) : null}
            </div>
            {!checkInResponseLoading ? (
              <button
                type="button"
                onClick={() => {
                  setCheckInResponseOpen(false);
                  setCheckInResponseText("");
                  setCheckInOpen(false);
                  setCheckInSelectedQuestion("");
                }}
                className="mt-5 min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                Got it
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {streamPanelOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {streamingQuestion ? questionLabels[streamingQuestion] : ""}
            </p>
            <div className="min-h-24 text-base leading-relaxed text-brand-text">
              {streamingLoading && !streamedText ? (
                <span className="text-brand-muted">One moment...</span>
              ) : (
                streamedText
              )}
              {streamingLoading ? <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-brand-primary" /> : null}
            </div>
            {!streamingLoading ? (
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    persist(appendActivityEvent(state, createLocationEvent("okay_confirmed", { question: streamingQuestion })));
                    dismissStreamPanel();
                  }}
                  className="min-h-12 w-full rounded-2xl bg-green-700 px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  I&apos;m okay
                </button>
                <button
                  type="button"
                  onClick={() => { callCaregiver(); dismissStreamPanel(); }}
                  className="min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
                >
                  {`Call ${state.profile.caregiverName}`}
                </button>
                <button
                  type="button"
                  onClick={() => { setHelperOpen(true); setHelpMeNowOpen(false); dismissStreamPanel(); }}
                  className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                >
                  Show this screen
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {recentGuidanceOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <h2 className="mb-4 text-lg font-semibold text-brand-text">Recent guidance</h2>
            {recentGuidance.length === 0 ? (
              <p className="text-sm text-brand-muted">No guidance yet. Tap Help Me Now to get started.</p>
            ) : (
              <ul className="space-y-4">
                {recentGuidance.slice(0, 5).map((entry, index) => (
                  <li key={index} className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-1">
                    <p className="text-xs font-semibold text-brand-muted">
                      {entry.question} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm leading-relaxed text-brand-text">{entry.response}</p>
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
            <p className="text-xl font-semibold text-brand-text">Calling 911...</p>
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
            <p className="text-xl font-semibold text-brand-text">Calling {state.profile.caregiverName}...</p>
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
