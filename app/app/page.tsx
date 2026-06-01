"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HelperModal from "@/components/HelperModal";
import MemoryIcon, { type MemoryIconName } from "@/components/MemoryIcon";
import {
  appendActivityEvent,
  createEvent,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type CheckInQuestion,
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


function greetingPrefix(scenarioHour: number | null = null): string {
  const hour = scenarioHour !== null ? scenarioHour : new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  if (hour >= 17 && hour < 21) return "Good evening,";
  return "Good night,";
}

function parseNextEvent(raw: string): { shortLabel: string; details: string[] } {
  const sentences = raw.split(/\.\s+/).filter(Boolean).map((s) => s.replace(/\.$/, "").trim());
  if (sentences.length === 0) return { shortLabel: raw, details: [] };
  const shortLabel = sentences[0];
  const rawDetails = sentences.slice(1);
  const details: string[] = [];
  for (const item of rawDetails) {
    if (item.toLowerCase().startsWith("bring ")) {
      item.replace(/^bring /i, "").split(/,\s*/).forEach((t) => details.push(`Bring ${t.trim()}`));
    } else {
      details.push(item);
    }
  }
  return { shortLabel, details };
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
  const [nextEventDetailOpen, setNextEventDetailOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInPacket, setCheckInPacket] = useState<CheckInQuestion[] | null>(null);
  const [checkInPacketLoading, setCheckInPacketLoading] = useState(false);
  const [checkInSelectedId, setCheckInSelectedId] = useState<string | null>(null);
  const [checkInBranchOpen, setCheckInBranchOpen] = useState(false);
  const [checkInBranchType, setCheckInBranchType] = useState<"uncertain" | "confused" | null>(null);
  const [checkInBranchText, setCheckInBranchText] = useState("");
  const [checkInBranchLoading, setCheckInBranchLoading] = useState(false);
  const [checkInHistoryOpen, setCheckInHistoryOpen] = useState(false);

  useEffect(() => {
    setState(loadState());
    setRecentGuidance(loadRecentGuidance());
  }, []);

  useEffect(() => {
    const handler = () => setState(loadState());
    window.addEventListener("claira-state-update", handler);
    return () => window.removeEventListener("claira-state-update", handler);
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

  const parsedNextEvent = parseNextEvent(contextPacket.next_event);

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

  useEffect(() => {
    const packetFallback: CheckInQuestion[] = [
      { id: "q1", text: "How are you feeling right now?", responses: { positive: "Feeling good 😊", uncertain: "A bit unsure 🤔", confused: "Not sure 😳" } },
      { id: "q2", text: "Do you know what is coming up next?", responses: { positive: "Yes I do 😊", uncertain: "Kind of, not sure 🤔", confused: "No idea 😳" } },
      { id: "q3", text: "Is there anything on your mind?", responses: { positive: "All good 😊", uncertain: "A little worried 🤔", confused: "Feeling confused 😳" } },
    ];
    const generateCheckInPacket = async () => {
      setCheckInPacketLoading(true);
      setCheckInPacket(null);
      setCheckInSelectedId(null);
      setCheckInBranchOpen(false);
      setCheckInBranchText("");
      try {
        const response = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "packet",
            context: {
              location: activeLocationSummary.label,
              next_event: contextPacket.next_event,
              who_is_expected: contextPacket.who_is_expected,
              scenario: activeScenario.label,
            },
            userName: state.profile.preferredName,
          }),
        });
        const result = await response.json() as CheckInQuestion[];
        if (Array.isArray(result) && result.length === 3) {
          setCheckInPacket(result);
        } else {
          setCheckInPacket(packetFallback);
        }
      } catch {
        setCheckInPacket(packetFallback);
      } finally {
        setCheckInPacketLoading(false);
      }
    };
    void generateCheckInPacket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenario.id]);

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

  const callCaregiver = () => {
    persist(appendActivityEvent(state, createLocationEvent("caregiver_called")));
    setCallingCaregiver(true);
  };

  const callEmergency = () => {
    persist(appendActivityEvent(state, createLocationEvent("emergency_called")));
    setCallingEmergency(true);
  };

  const handleCheckInBranch = async (questionId: string, branch: "positive" | "uncertain" | "confused"): Promise<void> => {
    const question = checkInPacket?.find((q) => q.id === questionId) ?? null;
    persist(appendActivityEvent(state, createLocationEvent("checkin_submitted", {
      question: question?.text ?? "",
      response: question?.responses[branch] ?? "",
      branch,
      locationMode: resolvedLocation.locationMode,
      trustedPlace: activeLocationSummary.trustedPlaceName,
      trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
    })));
    if (branch === "positive") {
      setCheckInDoneThisSession(true);
      setCheckInModalOpen(false);
      setCheckInSelectedId(null);
      return;
    }
    setCheckInBranchType(branch);
    setCheckInBranchOpen(true);
    setCheckInBranchLoading(true);
    setCheckInBranchText("");
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "branch",
          branch,
          selectedQuestion: question?.text ?? "",
          selectedResponse: question?.responses[branch] ?? "",
          context: {
            location: activeLocationSummary.label,
            next_event: contextPacket.next_event,
            scenario: activeScenario.label,
          },
          userName: state.profile.preferredName,
        }),
      });
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No body");
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const decoded = decoder.decode(value, { stream: true });
        setCheckInBranchText((prev) => prev + decoded);
      }
    } catch {
      setCheckInBranchText("That is okay. Take a breath. Would you like to see the details?");
    } finally {
      setCheckInBranchLoading(false);
    }
  };

  const showUnknownLocationPrompt = resolvedLocation.locationMode === "other";
  const showLostAlert =
    activeScenario.id === "lost_unknown_location" &&
    resolvedLocation.source === "browser_geolocation" &&
    !lostAlertDismissed;

  const dateString = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const scenarioNextEventIcon: Record<string, MemoryIconName> = {
    home_reorientation: "sunrise",
    doctor_appointment_prep: "stethoscope",
    pharmacy_confusion: "rx",
    evening_routine: "moon",
    lost_unknown_location: "alertTriangle",
  };
  const nextEventIconName: MemoryIconName = scenarioNextEventIcon[activeScenario.id] ?? "utensils";

  return (
    <div className="relative flex flex-1 flex-col">
    <main className="mx-auto flex flex-1 w-full max-w-[375px] flex-col overflow-hidden bg-[#F6F3EE] font-sans">

      {/* Top region */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 pt-6">

        {/* Section A: Greeting and action icons */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-xl text-[#8B7D6B]">{greetingPrefix(activeScenario.scenarioHour ?? null)}</p>
            <p className="font-serif text-4xl font-bold tracking-tight text-[#5A4A3A]">{state.profile.preferredName}</p>
          </div>
          <button
            type="button"
            onClick={callCaregiver}
            aria-label="Call caregiver"
            className="flex items-center gap-1 rounded-full border-2 border-[#A5BBA0] bg-[#F4F9F3] pl-2 pr-1.5 py-0.5 shadow-sm shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-95"
          >
            <span className="text-xs font-semibold text-[#71A172] whitespace-nowrap">
              Call {state.profile.caregiverName}
            </span>
            <div className="h-9 w-9 shrink-0 rounded-full bg-[#95C18F] border-2 border-[#E1FFC4] flex items-center justify-center">
              <MemoryIcon name="phone" className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>

        {/* Section B: Orientation card */}
        <section className="overflow-hidden rounded-[20px] border-[3px] border-[#F6FFF5] bg-white shadow-[0px_0px_10px_-2px_rgba(0,0,0,0.35)]">
          <div className="flex h-[37px] items-center gap-2 border-b border-[#E3DAC9] bg-[#E4F6DD] px-5 py-3">
            <MemoryIcon name="mapPin" className="h-4 w-4 text-[#7C9B78]" />
            <span className="text-sm font-medium uppercase tracking-[1px] text-[#719E6B]">Where you are now</span>
          </div>
          <div className="flex flex-col">
            {/* Row 1: Date */}
            <div className="flex items-center gap-4 border-b border-[#E3DAC9] px-5 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C8E2C4]/20 text-[#7C9B78]">
                <MemoryIcon name="calendar" className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">Today</span>
                <span className="font-serif text-xl font-medium text-[#5A4A3A]">{dateString}</span>
              </div>
            </div>
            {/* Row 2: Location */}
            <div className="flex items-center gap-4 border-b border-[#E3DAC9] px-5 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C8E2C4]/20 text-[#7C9B78]">
                <MemoryIcon name="home" className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">You are at</span>
                <span className="font-serif text-xl font-medium text-[#5A4A3A]">
                  {activeScenario.id === "lost_unknown_location" && state.resolvedAddress !== null
                    ? state.resolvedAddress
                    : activeLocationSummary.label}
                </span>
                {activeLocationSummary.trustedPlaceAddress ? (
                  <span className="text-xs font-medium text-[#8B7D6B]">{activeLocationSummary.trustedPlaceAddress}</span>
                ) : null}
                {showUnknownLocationPrompt ? (
                  <span className="text-xs font-medium text-amber-700">Unfamiliar location — stay where you are if safe.</span>
                ) : null}
              </div>
            </div>
            {/* Row 3: Next event */}
            <button
              type="button"
              onClick={() => setNextEventDetailOpen(true)}
              className="flex w-full items-center justify-between border-b border-[#E3DAC9] px-5 py-3 text-left transition-colors active:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBE3D5]/60 text-[#8B7355]">
                  <MemoryIcon name={nextEventIconName} className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-start pr-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">Coming up next</span>
                  <span className="mt-0.5 font-serif text-base font-medium leading-tight text-[#5A4A3A]">{parsedNextEvent.shortLabel}</span>
                </div>
              </div>
              <MemoryIcon name="chevronRight" className="h-4 w-4 shrink-0 text-[#8B7D6B]" />
            </button>
            {/* Row 4: With you (conditional) */}
            {contextPacket.who_is_expected !== "No other people are required right now." ? (
              <div className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7C9B78] text-xl font-serif font-bold text-white opacity-75">
                  {state.profile.caregiverName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">With you</span>
                  <span className="mt-0.5 font-serif text-lg font-medium leading-tight text-[#5A4A3A]">{state.profile.caregiverName}</span>
                  <span className="text-[13px] font-medium text-[#8B7D6B]">{state.profile.caregiverRelationshipLabel ?? ""}</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

      </div>

      {/* Bottom region */}
      <div className="shrink-0 px-5 pb-3 pt-3">
        {/* History / Saved row above buttons */}
        <div className="mb-2 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setCheckInHistoryOpen(true)}
            className="flex items-center gap-1 focus:outline-none"
          >
            <MemoryIcon name="clock" className="h-4 w-4 text-[#8B7D6B]" />
            <span className="text-[#8B7D6B]">History</span>
          </button>
          {checkInDoneThisSession ? (
            <div className="flex items-center gap-1 rounded-full bg-[#C8E2C4]/40 px-2 py-0.5">
              <MemoryIcon name="checkCircle" className="h-3 w-3 text-[#4B8B62]" />
              <span className="text-[#4B8B62]">Saved</span>
            </div>
          ) : null}
        </div>
        {/* Three main action buttons */}
        <div className="flex gap-2">
          {/* Show Card */}
          <button
            type="button"
            onClick={() => { persist(appendActivityEvent(state, createLocationEvent("helper_card_shown"))); setHelperOpen(true); }}
            className="flex aspect-square flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-[3px] border-[#8FB5C1] bg-[#DDE9E8] p-2 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-95 focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#92BDBB]">
              <MemoryIcon name="idCard" className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-sm font-bold whitespace-nowrap text-[#465E6D]">Show Card</span>
          </button>
          {/* Check-In */}
          <button
            type="button"
            onClick={() => setCheckInModalOpen(true)}
            className="flex aspect-square flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-[3px] border-[#7C9B78]/60 bg-[#C8E2C4]/40 p-2 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform focus:outline-none active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C9B78] shadow-sm">
              <MemoryIcon name="checkCircle" className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-sm font-bold whitespace-nowrap text-[#5A4A3A]">Check-In</span>
          </button>
          {/* Get Help */}
          <button
            type="button"
            onClick={handleHelpMeNow}
            className="flex aspect-square flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-[3px] border-[#8B7355]/50 bg-[#EBE3D5]/70 p-2 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform focus:outline-none active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B776F] shadow-sm">
              <MemoryIcon name="home" className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-sm font-bold whitespace-nowrap text-[#5A4A3A]">Get Help</span>
          </button>
        </div>
      </div>

      {checkInModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl space-y-4">
            {!checkInSelectedId ? (
              <>
                <h2 className="font-serif text-xl font-bold text-[#5A4A3A]">How are you doing?</h2>
                <div className="space-y-3">
                  {checkInPacketLoading || !checkInPacket ? (
                    <div className="flex items-center justify-center gap-1 py-8">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[#7C9B78]" />
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[#7C9B78] [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[#7C9B78] [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    checkInPacket.map((q) => (
                      <button key={q.id} type="button" onClick={() => setCheckInSelectedId(q.id)} className="min-h-12 w-full rounded-2xl border border-[#E3DAC9] bg-[#F6F3EE] px-4 py-3 text-left text-base font-medium text-[#5A4A3A] shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] hover:bg-[#C8E2C4]/20 focus:outline-none focus:ring-2 focus:ring-[#7C9B78]/40">
                        {q.text}
                      </button>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => setCheckInHistoryOpen(true)} className="shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] text-xs text-[#8B7D6B] underline underline-offset-2">View past check-ins</button>
                  <button type="button" onClick={() => { setCheckInModalOpen(false); setCheckInSelectedId(null); }} className="shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] text-sm text-[#8B7D6B] underline underline-offset-2">Back</button>
                </div>
              </>
            ) : !checkInBranchOpen ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7D6B]">{checkInPacket?.find((q) => q.id === checkInSelectedId)?.text}</p>
                <div className="space-y-3">
                  {(["positive", "uncertain", "confused"] as const).map((branch) => {
                    const label = checkInPacket?.find((q) => q.id === checkInSelectedId)?.responses[branch] ?? "";
                    return (
                      <button key={branch} type="button" onClick={() => void handleCheckInBranch(checkInSelectedId!, branch)} className="min-h-12 w-full rounded-2xl border border-[#E3DAC9] bg-[#F6F3EE] px-4 py-3 text-left text-base font-medium text-[#5A4A3A] shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] hover:bg-[#C8E2C4]/20 focus:outline-none focus:ring-2 focus:ring-[#7C9B78]/40">
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setCheckInSelectedId(null)} className="shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] text-sm text-[#8B7D6B] underline underline-offset-2">Back</button>
              </>
            ) : (
              <>
                <div className="min-h-20 text-base leading-relaxed text-[#5A4A3A]">
                  {checkInBranchLoading && !checkInBranchText ? (
                    <span className="text-[#8B7D6B]">One moment...</span>
                  ) : checkInBranchText}
                  {checkInBranchLoading ? <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-[#7C9B78]" /> : null}
                </div>
                {!checkInBranchLoading ? (
                  <div className="space-y-3">
                    <button type="button" onClick={() => { setCheckInModalOpen(false); setCheckInSelectedId(null); setCheckInBranchOpen(false); setCheckInBranchType(null); setCheckInBranchText(""); setNextEventDetailOpen(true); }} className="min-h-12 w-full rounded-2xl bg-[#7C9B78] px-4 py-3 text-base font-semibold text-white shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none">
                      Show me the details
                    </button>
                    <button type="button" onClick={() => { setCheckInDoneThisSession(true); setCheckInModalOpen(false); setCheckInSelectedId(null); setCheckInBranchOpen(false); setCheckInBranchType(null); setCheckInBranchText(""); }} className="min-h-12 w-full rounded-2xl border border-[#E3DAC9] bg-[#F6F3EE] px-4 py-3 text-base font-semibold text-[#5A4A3A] shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none">
                      I&apos;m okay, thanks
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      {checkInHistoryOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#E3DAC9] bg-white p-6 shadow-xl sm:rounded-3xl space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#5A4A3A]">Past check-ins</h2>
            {state.activityEvents.filter((e) => e.eventType === "checkin_submitted").length === 0 ? (
              <p className="text-sm text-[#8B7D6B]">No check-ins yet this session.</p>
            ) : (
              <ul className="space-y-3">
                {state.activityEvents
                  .filter((e) => e.eventType === "checkin_submitted")
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 10)
                  .map((event, i) => (
                    <li key={i} className="rounded-2xl border border-[#E3DAC9] bg-[#F6F3EE] p-4 space-y-1">
                      <p className="text-xs font-semibold text-[#8B7D6B]">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {typeof event.metadata?.branch === "string" ? ` · ${event.metadata.branch}` : ""}
                      </p>
                      {typeof event.metadata?.question === "string" ? <p className="text-sm text-[#5A4A3A]">{event.metadata.question as string}</p> : null}
                      {typeof event.metadata?.response === "string" ? <p className="text-sm font-medium text-[#7C9B78]">{event.metadata.response as string}</p> : null}
                    </li>
                  ))}
              </ul>
            )}
            <button type="button" onClick={() => setCheckInHistoryOpen(false)} className="min-h-12 w-full rounded-2xl border border-[#E3DAC9] bg-[#F6F3EE] px-4 py-3 text-base font-semibold text-[#5A4A3A] shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none">
              Close
            </button>
          </div>
        </div>
      ) : null}

      <HelperModal
        open={helperOpen}
        onClose={() => setHelperOpen(false)}
        profile={state.profile}
        activeLocationSummary={activeLocationSummary}
        contextPacket={contextPacket}
        onCallCaregiver={callCaregiver}
        onCallEmergency={callEmergency}
        resolvedAddress={state.resolvedAddress}
        briefContext={activeScenario.guidance}
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
                  className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-left text-base font-medium text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
                >
                  {questionLabels[key]}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setHelpMeNowOpen(false); setRecentGuidanceOpen(true); }}
                className="shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] text-xs text-brand-muted underline underline-offset-2"
              >
                Recent guidance
              </button>
            </div>
            <button
              type="button"
              onClick={() => setHelpMeNowOpen(false)}
              className="shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] text-sm text-brand-muted underline underline-offset-2"
            >
              Back
            </button>
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
                  className="min-h-12 w-full rounded-2xl bg-green-700 px-4 py-3 text-base font-semibold text-white shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  I&apos;m okay
                </button>
                <button
                  type="button"
                  onClick={() => { callCaregiver(); setHelpMeNowOpen(false); dismissStreamPanel(); }}
                  className="min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass"
                >
                  {`Call ${state.profile.caregiverName}`}
                </button>
                <button
                  type="button"
                  onClick={() => { setHelperOpen(true); setHelpMeNowOpen(false); dismissStreamPanel(); }}
                  className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
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
                          className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-left text-base font-medium text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
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
              className="mt-5 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {nextEventDetailOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl space-y-5">
            <div className="flex justify-center">
              <div className="h-1 w-10 rounded-full bg-brand-border" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-brand-text">{parsedNextEvent.shortLabel}</p>
              {parsedNextEvent.details.length > 0 ? (
                <p className="mt-1 text-sm text-brand-muted">To prepare before you leave</p>
              ) : null}
            </div>
            {parsedNextEvent.details.length > 0 ? (
              <ul className="space-y-3">
                {parsedNextEvent.details.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-sageDark" />
                    <span className="text-base text-brand-text">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={() => { setNextEventDetailOpen(false); void askQuestion("what_should_i_do_next"); }}
              className="min-h-12 w-full rounded-2xl bg-brand-sageDark px-4 py-3 text-base font-semibold text-white shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-sageDark/50"
            >
              Get help with this
            </button>
            <button
              type="button"
              onClick={() => setNextEventDetailOpen(false)}
              className="block w-full text-center text-sm text-brand-muted shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] underline underline-offset-2 focus:outline-none"
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
              className="mt-4 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showLostAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-[#FEF1D8] ring-[6px] ring-[#F5C842] p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-brand-text">You are in an unfamiliar location</h2>
            <p className="text-sm text-brand-muted">This does not look like one of your saved places. Would you like some help?</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setLostAlertDismissed(true); handleHelpMeNow(); }}
                className="min-h-12 w-full rounded-2xl bg-brand-compass px-4 py-3 text-base font-semibold text-white shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass/60"
              >
                Help me
              </button>
              <button
                type="button"
                onClick={() => setLostAlertDismissed(true)}
                className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
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
              className="mt-4 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
      <div className="pointer-events-none absolute inset-0 z-[49] border-[8px] border-white" />
    </div>
  );
}
