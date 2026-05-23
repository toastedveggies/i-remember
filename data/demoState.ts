import { logActivityEvent, logSystemEvent } from "@/lib/logEvent";

export type EventSource = "app" | "caregiver" | "demo";
export type UncertaintyLevel = "low" | "medium" | "high";

export type DemoEvent = {
  id: string;
  eventType: string;
  timestamp: string;
  userId: string;
  scenarioId?: string;
  source: EventSource;
  metadata?: Record<string, unknown>;
};

export type DemoScenario = {
  id: string;
  label: string;
  guidance: string;
  where: string;
  happening: string;
  nextStep: string;
  uncertainty: UncertaintyLevel;
  locationMode: "trusted" | "other";
  trustedSlot?: 1 | 2 | 3;
  otherLocationLabel?: string;
  locationDetail?: string;
};

export type DemoState = {
  activeScenarioId: string;
  checkInStatus: string;
  activityEvents: DemoEvent[];
  systemEvents: DemoEvent[];
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
};

export type PronounSet = "he/him" | "she/her" | "they/them" | "custom";

export type DemoProfile = {
  userId: string;
  preferredName: string;
  pronouns: PronounSet;
  customPronouns?: string;
  caregiverName: string;
  caregiverRelationshipLabel?: string;
  independentMode?: boolean;
  activeCaregiverId?: string | null;
};

export type TrustedLocation = {
  id?: string;
  trustedSlot: 1 | 2 | 3;
  name: string;
  address?: string;
  instructions?: string;
};

export const defaultDemoProfile: DemoProfile = {
  userId: "demo-user",
  preferredName: "Alex",
  pronouns: "he/him",
  caregiverName: "Maria",
  caregiverRelationshipLabel: "daughter",
  independentMode: false,
  activeCaregiverId: "00000000-0000-0000-0000-000000000002"
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "morning",
    label: "Morning confusion",
    guidance: "You just woke up. Open curtains and check today's date.",
    where: "You are at your trusted home location, in your bedroom.",
    happening: "It is Tuesday morning. Breakfast is planned at 8:00 AM.",
    nextStep: "Open the curtains, drink water, and check your morning checklist.",
    uncertainty: "low",
    locationMode: "trusted",
    trustedSlot: 1,
    locationDetail: "bedroom"
  },
  {
    id: "afternoon",
    label: "Afternoon routine",
    guidance: "It is after lunch. Next: short walk, then rest.",
    where: "You are at your trusted home location, in the living room.",
    happening: "It is Tuesday afternoon and your routine block is light activity.",
    nextStep: "Take a short walk in the hallway, then return to rest.",
    uncertainty: "medium",
    locationMode: "trusted",
    trustedSlot: 1,
    locationDetail: "living room"
  },
  {
    id: "evening",
    label: "Evening uncertainty",
    guidance: "It is evening. Review dinner plan and medication checklist.",
    where: "You may be somewhere outside your saved trusted locations.",
    happening: "It appears to be evening, but the next activity is not confirmed.",
    nextStep: "Pause, take a slow breath, and review the next activity card.",
    uncertainty: "high",
    locationMode: "other",
    otherLocationLabel: "somewhere unfamiliar",
    locationDetail: "near the entrance"
  }
];

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for tonight?",
  "Would calling your caregiver help right now?"
];

export const storageKey = "memory-assistant-mvp-state";

export const initialDemoState: DemoState = {
  activeScenarioId: demoScenarios[0].id,
  checkInStatus: "Not submitted yet",
  activityEvents: [],
  systemEvents: [],
  profile: defaultDemoProfile,
  trustedLocations: [
    {
      id: "trusted-place-1",
      trustedSlot: 1,
      name: "Home",
      address: "215 Cedar Street",
      instructions: "Bedroom upstairs. Living room near the front windows."
    },
    {
      id: "trusted-place-2",
      trustedSlot: 2,
      name: "Community Center",
      address: "18 Oak Avenue",
      instructions: "Front desk can help call Maria if reassurance is needed."
    },
    {
      id: "trusted-place-3",
      trustedSlot: 3,
      name: "Maria's House",
      address: "44 Pine Lane",
      instructions: "Blue door with a porch light. Maria usually answers quickly."
    }
  ]
};

// Event types that belong in activityEvents (user-facing actions)
const activityEventTypes = new Set([
  "reorientation_started",
  "checkin_submitted",
  "fallback_shown",
  "helper_card_shown",
  "caregiver_called",
  "emergency_called"
]);

export function normalizeDemoState(raw: unknown): DemoState {
  if (!raw || typeof raw !== "object") {
    return initialDemoState;
  }

  const value = raw as Partial<DemoState> & {
    profile?: Partial<DemoProfile>;
    trustedLocations?: TrustedLocation[];
    events?: DemoEvent[]; // legacy single-array field
  };
  const validScenario = demoScenarios.some((scenario) => scenario.id === value.activeScenarioId);

  // Migrate legacy state that used a single `events` array by splitting on event type
  let activityEvents: DemoEvent[] = [];
  let systemEvents: DemoEvent[] = [];

  if (Array.isArray(value.activityEvents)) {
    activityEvents = value.activityEvents;
  } else if (Array.isArray(value.events)) {
    activityEvents = value.events.filter((e) => activityEventTypes.has(e.eventType));
  }

  if (Array.isArray(value.systemEvents)) {
    systemEvents = value.systemEvents;
  } else if (Array.isArray(value.events)) {
    systemEvents = value.events.filter((e) => !activityEventTypes.has(e.eventType));
  }

  return {
    activeScenarioId: validScenario ? (value.activeScenarioId as string) : initialDemoState.activeScenarioId,
    checkInStatus: typeof value.checkInStatus === "string" ? value.checkInStatus : initialDemoState.checkInStatus,
    activityEvents,
    systemEvents,
    profile: {
      userId: value.profile?.userId ?? defaultDemoProfile.userId,
      preferredName: value.profile?.preferredName ?? defaultDemoProfile.preferredName,
      pronouns: (value.profile?.pronouns as PronounSet | undefined) ?? defaultDemoProfile.pronouns,
      customPronouns: value.profile?.customPronouns ?? defaultDemoProfile.customPronouns,
      caregiverName: value.profile?.caregiverName ?? defaultDemoProfile.caregiverName,
      caregiverRelationshipLabel: value.profile?.caregiverRelationshipLabel ?? defaultDemoProfile.caregiverRelationshipLabel,
      independentMode: value.profile?.independentMode ?? false,
      activeCaregiverId: value.profile?.activeCaregiverId !== undefined
        ? value.profile.activeCaregiverId
        : "00000000-0000-0000-0000-000000000002"
    },
    trustedLocations: Array.isArray(value.trustedLocations) && value.trustedLocations.length > 0
      ? value.trustedLocations
          .filter((location): location is TrustedLocation =>
            (location.trustedSlot === 1 || location.trustedSlot === 2 || location.trustedSlot === 3) &&
            typeof location.name === "string"
          )
          .map((location) => ({
            id: location.id,
            trustedSlot: location.trustedSlot,
            name: location.name,
            address: location.address,
            instructions: location.instructions
          }))
          .sort((a, b) => a.trustedSlot - b.trustedSlot)
      : initialDemoState.trustedLocations
  };
}

export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createEvent(
  eventType: string,
  source: EventSource,
  scenarioId?: string,
  metadata?: Record<string, unknown>,
  userId = defaultDemoProfile.userId
): DemoEvent {
  return {
    id: generateId(),
    eventType,
    timestamp: new Date().toISOString(),
    userId,
    source,
    scenarioId,
    metadata
  };
}

export function setActiveCaregiverId(id: string | null): DemoState {
  if (typeof window === "undefined") return initialDemoState;
  const raw = window.localStorage.getItem(storageKey);
  let current = initialDemoState;
  if (raw) {
    try { current = normalizeDemoState(JSON.parse(raw)); } catch { /* use initialDemoState */ }
  }
  const updated: DemoState = { ...current, profile: { ...current.profile, activeCaregiverId: id } };
  window.localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
}

export function setIndependentMode(value: boolean): DemoState {
  if (typeof window === "undefined") return initialDemoState;
  const raw = window.localStorage.getItem(storageKey);
  let current = initialDemoState;
  if (raw) {
    try { current = normalizeDemoState(JSON.parse(raw)); } catch { /* use initialDemoState */ }
  }
  const updated: DemoState = { ...current, profile: { ...current.profile, independentMode: value } };
  window.localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
}

export function appendActivityEvent(state: DemoState, event: DemoEvent): DemoState {
  logActivityEvent(event);
  return { ...state, activityEvents: [event, ...state.activityEvents].slice(0, 50) };
}

export function appendSystemEvent(state: DemoState, event: DemoEvent): DemoState {
  logSystemEvent(event);
  return { ...state, systemEvents: [event, ...state.systemEvents].slice(0, 20) };
}

export function findScenario(scenarioId: string): DemoScenario {
  return demoScenarios.find((scenario) => scenario.id === scenarioId) ?? demoScenarios[0];
}

export function findTrustedLocation(locations: TrustedLocation[], slot?: 1 | 2 | 3): TrustedLocation | null {
  if (!slot) return null;
  return locations.find((location) => location.trustedSlot === slot) ?? null;
}

export function pronounWords(pronouns: PronounSet, customPronouns?: string): { subject: string; object: string; possessive: string } {
  if (pronouns === "he/him") {
    return { subject: "he", object: "him", possessive: "his" };
  }

  if (pronouns === "she/her") {
    return { subject: "she", object: "her", possessive: "her" };
  }

  if (pronouns === "custom" && customPronouns) {
    return { subject: customPronouns, object: customPronouns, possessive: customPronouns };
  }

  return { subject: "they", object: "them", possessive: "their" };
}
