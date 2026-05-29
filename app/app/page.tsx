"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function greetingPrefix(scenarioHour: number | null = null): string {
  const hour = scenarioHour !== null ? scenarioHour : new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  if (hour >= 17 && hour < 21) return "Good evening,";
  return "Good night,";
}

export default function TodayWindowPage() {
  const [helperOpen, setHelperOpen] = useState(false);
  const [callingCaregiver, setCallingCaregiver] = useState(false);
  const [callingEmergency, setCallingEmergency] = useState(false);
  const [lostAlertDismissed, setLostAlertDismissed] = useState(false);
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
  const [askedQuestions, setAskedQuestions] = useState<QuestionKey[]>([]);
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

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    if (resolvedLocation.source !== "browser_geolocation") {
      setState((prev) => ({ ...prev, resolvedAddress: null }));
      return;
    }

    const { latitude, longitude } = resolvedLocation.coordinates;
    let cancelled = false;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      { headers: { "User-Agent": "memory-assistant-prototype/1.0" } }
    )
      .then((r) => r.json() as Promise<{ display_name?: string; address?: { road?: string; city?: string } }>)
      .then((data) => {
        if (cancelled) return;
        const road = data.address?.road;
        const city = data.address?.city;
        const addr = road && city ? `${road}, ${city}` : (data.display_name ?? "").slice(0, 60);
        persist({ ...stateRef.current, resolvedAddress: addr });
      })
      .catch(() => {
        if (!cancelled) persist({ ...stateRef.current, resolvedAddress: null });
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedLocation.source, resolvedLocation.coordinates.latitude, resolvedLocation.coordinates.longitude]);

  useEffect(() => {
    // renders the lost alert when the condition is met; no async work needed
  }, [activeScenario.id, resolvedLocation.source, lostAlertDismissed]);

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
        trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
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
    setAskedQuestions([]);
  };

  const askQuestion = async (key: QuestionKey) => {
    setStreamingQuestion(key);
    setAskedQuestions((prev) => [...prev, key]);
    setStreamedText("");
    setStreamingLoading(true);
    setStreamPanelOpen(true);

    try {
      const response = await fetch("/api/reorient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: key,
          context: {
            ...contextPacket,
            ...(state.resolvedAddress !== null && state.demoClassroomMode ? { current_address: state.resolvedAddress } : {}),
          },
          userName: state.profile.preferredName,
          ...(state.demoClassroomMode && activeScenario.demoNote ? { demoNote: activeScenario.demoNote } : {}),
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
            trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
            ai_response: fullText,
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
        trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
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

  const showUnknownLocationPrompt = resolvedLocation.locationMode === "other";
  const showLostAlert =
    activeScenario.id === "lost_unknown_location" &&
    resolvedLocation.source === "browser_geolocation" &&
    !lostAlertDismissed;

  const dateString = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-brand-bg">
      <div className="space-y-4 px-4 pb-8 pt-4">
        {/* Section 1: Greeting */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-medium text-brand-muted">{greetingPrefix(activeScenario.scenarioHour ?? null)}</p>
            <p className="font-serif text-4xl font-bold text-brand-text">{state.profile.preferredName}</p>
            <p className="text-sm text-brand-muted">{dateString}</p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={callCaregiver}
              aria-label={`Call ${state.profile.caregiverName}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sageDark text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-sageDark/40"
            >
              <MemoryIcon name="phone" className="h-5 w-5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => { persist(appendActivityEvent(state, createLocationEvent("helper_card_shown"))); setHelperOpen(true); }}
              aria-label="Show Helper Card"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <MemoryIcon name="idCard" className="h-5 w-5 text-brand-primary" />
            </button>
          </div>
        </div>

        {/* Section 2: Orientation card */}
        <div className="overflow-hidden rounded-2xl bg-brand-surface shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E3DAC9] bg-[#C8E2C4]/30 px-4 py-3">
            <MemoryIcon name="mapPin" className="h-4 w-4 text-brand-sageDark" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-sageDark">WHERE YOU ARE NOW</span>
          </div>

          {/* Row 1: Date */}
          <div className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-sage/30">
              <MemoryIcon name="calendar" className="h-5 w-5 text-brand-sageDark" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-muted">TODAY</p>
              <p className="font-serif text-sm font-semibold text-brand-text">{dateString}</p>
            </div>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-sage/30">
              <MemoryIcon name="home" className="h-5 w-5 text-brand-sageDark" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-muted">YOU ARE AT</p>
              <p className="font-serif text-sm font-semibold text-brand-text">
                {activeScenario.id === "lost_unknown_location" && state.resolvedAddress !== null
                  ? state.resolvedAddress
                  : activeLocationSummary.label}
              </p>
              {activeLocationSummary.trustedPlaceAddress ? (
                <p className="text-xs text-brand-muted">{activeLocationSummary.trustedPlaceAddress}</p>
              ) : null}
              {showUnknownLocationPrompt ? (
                <p className="text-xs font-medium text-amber-700">Unfamiliar location — stay where you are if safe.</p>
              ) : null}
            </div>
          </div>

          {/* Row 3: Next event */}
          <div className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-warm">
              <MemoryIcon name="utensils" className="h-5 w-5 text-brand-warmDark" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-muted">COMING UP NEXT</p>
              <p className="font-serif text-sm font-semibold text-brand-text">{contextPacket.next_event}</p>
            </div>
          </div>

          {/* Row 4: With you (conditional, no border) */}
          {contextPacket.who_is_expected !== "No other people are required right now." ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-sageDark text-sm font-bold text-white">
                {contextPacket.who_is_expected.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-brand-muted">WITH YOU</p>
                <p className="font-serif text-sm font-semibold text-brand-text">{contextPacket.who_is_expected}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Section 3: Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleOpenCheckIn}
            disabled={checkInOpen}
            className={checkInOpen
              ? "flex min-h-[100px] flex-1 flex-col items-center justify-center gap-2 rounded-3xl border border-brand-sage/50 bg-brand-sage/30 p-4 opacity-75 focus:outline-none focus:ring-2 focus:ring-brand-sageDark/30"
              : "flex min-h-[100px] flex-1 flex-col items-center justify-center gap-2 rounded-3xl border border-brand-sage/50 bg-brand-sage/30 p-4 focus:outline-none focus:ring-2 focus:ring-brand-sageDark/30"
            }
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sageDark shadow-sm">
              <MemoryIcon name="checkCircle" className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif text-base font-semibold text-brand-text">Check-In</span>
            <span className="text-xs text-brand-muted">I&apos;m doing okay</span>
          </button>
          <button
            type="button"
            onClick={handleHelpMeNow}
            className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-2 rounded-3xl border border-brand-warmDark/20 bg-brand-warm/50 p-4 focus:outline-none focus:ring-2 focus:ring-brand-warmDark/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-warmDark shadow-sm">
              <MemoryIcon name="home" className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif text-base font-semibold text-brand-text">Get Help</span>
            <span className="text-xs text-brand-muted">I need assistance</span>
          </button>
        </div>

        {/* Section 4: Check-in questions expansion (preserved exactly) */}
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
                  className={`w-full cursor-pointer rounded-xl border p-4 text-left text-sm font-medium transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-[#7C9B78]/40 ${
                    isSelected
                      ? "border-[#7C9B78] bg-[#C8E2C4]/40 text-brand-text"
                      : isDeselected
                        ? "border-brand-border bg-white text-brand-text opacity-60"
                        : "border-brand-border bg-white text-brand-text hover:bg-[#C8E2C4]/20"
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
          <div className="rounded-2xl border border-[#7C9B78]/30 bg-[#C8E2C4]/20 px-4 py-3">
            <p className="text-sm font-medium text-[#4B8B62]">Check-in saved.</p>
            <p className="mt-1 text-xs text-brand-muted">{state.checkInStatus}</p>
          </div>
        ) : null}

      </div>

      <HelperModal
        open={helperOpen}
        onClose={() => setHelperOpen(false)}
        profile={state.profile}
        activeLocationSummary={activeLocationSummary}
        contextPacket={contextPacket}
        onCallCaregiver={callCaregiver}
        onCallEmergency={callEmergency}
        resolvedAddress={state.resolvedAddress}
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setHelpMeNowOpen(false); setRecentGuidanceOpen(true); }}
                className="text-xs text-brand-muted underline underline-offset-2"
              >
                Recent guidance
              </button>
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
                    setHelpMeNowOpen(false);
                    dismissStreamPanel();
                  }}
                  className="min-h-12 w-full rounded-2xl bg-green-700 px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  I&apos;m okay
                </button>
                <button
                  type="button"
                  onClick={() => { callCaregiver(); setHelpMeNowOpen(false); dismissStreamPanel(); }}
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
                {(() => {
                  const remainingQuestions = (["where_am_i", "what_is_happening", "what_should_i_do_next"] as QuestionKey[]).filter(
                    (key) => !askedQuestions.includes(key)
                  );
                  if (remainingQuestions.length === 0) return null;
                  return (
                    <>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-muted">Ask another question</p>
                      {remainingQuestions.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => askQuestion(key)}
                          className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-left text-base font-medium text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
                        >
                          {questionLabels[key]}
                        </button>
                      ))}
                    </>
                  );
                })()}
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

      {showLostAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-brand-text">You are in an unfamiliar location</h2>
            <p className="text-sm text-brand-muted">This does not look like one of your saved places. Would you like some help?</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setLostAlertDismissed(true); handleHelpMeNow(); }}
                className="min-h-12 w-full rounded-2xl bg-brand-compass px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass/60"
              >
                Help me
              </button>
              <button
                type="button"
                onClick={() => setLostAlertDismissed(true)}
                className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
              >
                I&apos;m OK
              </button>
            </div>
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
