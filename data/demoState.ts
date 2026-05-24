import { logActivityEvent, logSystemEvent } from "@/lib/logEvent";

export type EventSource = "app" | "caregiver" | "demo";
export type UncertaintyLevel = "low" | "medium" | "high";
export type LocationSource = "scenario_seed" | "browser_geolocation";
export type LocationMode = "trusted_place" | "other";
export type ResponsePosture = "calm_grounding" | "public_place_support" | "transition_support" | "safety_fallback";

export type BrowserLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: string;
};

export type DemoEvent = {
  id: string;
  eventType: string;
  timestamp: string;
  userId: string;
  scenarioId?: string;
  source: EventSource;
  metadata?: Record<string, unknown>;
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  locationSource?: LocationSource;
};

export type ScheduledEventSummary = {
  id: string;
  title: string;
  timeLabel: string;
  placeId?: string | null;
  bringItems?: string[];
};

export type DemoScenario = {
  id: string;
  label: string;
  guidance: string;
  where: string;
  happening: string;
  nextStep: string;
  uncertainty: UncertaintyLevel;
  responsePosture: ResponsePosture;
  seededCoordinates: {
    latitude: number;
    longitude: number;
  };
  expectedLocationMode: LocationMode;
  scenarioPlaceId?: string | null;
  currentActivity?: string;
  scheduledEvent?: ScheduledEventSummary;
};

export type DemoState = {
  activeScenarioId: string;
  checkInStatus: string;
  activityEvents: DemoEvent[];
  systemEvents: DemoEvent[];
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: BrowserLocation | null;
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
  displayAddress?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  placeType?: "home" | "pharmacy" | "clinic" | "trusted";
};

export const defaultDemoProfile: DemoProfile = {
  userId: "00000000-0000-0000-0000-000000000001",
  preferredName: "Alex",
  pronouns: "he/him",
  caregiverName: "Maria",
  caregiverRelationshipLabel: "daughter",
  independentMode: false,
  activeCaregiverId: "00000000-0000-0000-0000-000000000002"
};

export const defaultTrustedLocations: TrustedLocation[] = [
  {
    id: "place_home",
    trustedSlot: 1,
    name: "Home",
    address: "215 Cedar Street",
    displayAddress: "215 Cedar Street",
    instructions: "Take a slow breath, check the Today card, and continue your usual home routine.",
    latitude: 34.13672,
    longitude: -118.29434,
    radiusMeters: 80,
    placeType: "home"
  },
  {
    id: "place_pharmacy",
    trustedSlot: 2,
    name: "Pharmacy",
    address: "98 Maple Avenue",
    displayAddress: "Sunrise Pharmacy, 98 Maple Avenue",
    instructions: "Go to the counter and say you are here to pick up a prescription. Show your helper card if you want support.",
    latitude: 34.13758,
    longitude: -118.30084,
    radiusMeters: 65,
    placeType: "pharmacy"
  },
  {
    id: "place_doctor_office",
    trustedSlot: 3,
    name: "Doctor's Office",
    address: "410 Wellness Plaza",
    displayAddress: "Northside Clinic, 410 Wellness Plaza",
    instructions: "Check in at the front desk with your ID and insurance card.",
    latitude: 34.13158,
    longitude: -118.28942,
    radiusMeters: 90,
    placeType: "clinic"
  }
];

export const demoScenarios: DemoScenario[] = [
  {
    id: "home_reorientation",
    label: "Home reorientation",
    guidance: "Alex is at Home and needs calm grounding.",
    where: "You are at Home.",
    happening: "This looks like a normal time at home. The app should keep the explanation calm and simple.",
    nextStep: "Take a slow breath, check the Today card, continue your home routine, or call Maria if you want support.",
    uncertainty: "low",
    responsePosture: "calm_grounding",
    seededCoordinates: {
      latitude: 34.13675,
      longitude: -118.2943
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: "place_home"
  },
  {
    id: "pharmacy_confusion",
    label: "Pharmacy confusion",
    guidance: "Alex is at the Pharmacy and needs help remembering that he came to pick up a prescription.",
    where: "You are at the Pharmacy.",
    happening: "You planned to stop by the pharmacy to pick up a prescription.",
    nextStep: "Go to the pharmacy counter, ask about prescription pickup, show the helper card if needed, or call Maria if you are still unsure.",
    uncertainty: "medium",
    responsePosture: "public_place_support",
    seededCoordinates: {
      latitude: 34.13755,
      longitude: -118.30088
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: "place_pharmacy",
    currentActivity: "Picking up a prescription"
  },
  {
    id: "doctor_appointment_prep",
    label: "Doctor appointment preparation",
    guidance: "Alex is at Home and needs help getting ready to leave for a doctor's appointment.",
    where: "You are at Home.",
    happening: "A doctor's appointment is coming up soon.",
    nextStep: "Bring your ID, insurance card, phone, keys, and medication list, then leave at the planned time.",
    uncertainty: "low",
    responsePosture: "transition_support",
    seededCoordinates: {
      latitude: 34.1367,
      longitude: -118.29438
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: "place_home",
    scheduledEvent: {
      id: "event_doctor_appointment",
      title: "Doctor appointment",
      timeLabel: "Leave at 1:40 PM for a 2:00 PM appointment",
      placeId: "place_doctor_office",
      bringItems: ["ID", "Insurance card", "Phone", "Keys", "Medication list"]
    }
  },
  {
    id: "lost_unknown_location",
    label: "Lost / unknown location",
    guidance: "Alex is not at a recognized trusted place and needs safe fallback guidance without overclaiming.",
    where: "I do not recognize this as one of your saved trusted places.",
    happening: "The app does not have enough information to know why you are here.",
    nextStep: "Stay where you are if it feels safe, call Maria, show the helper card if needed, and call emergency services if this feels unsafe or urgent.",
    uncertainty: "high",
    responsePosture: "safety_fallback",
    seededCoordinates: {
      latitude: 34.14188,
      longitude: -118.31215
    },
    expectedLocationMode: "other",
    scenarioPlaceId: null
  }
];

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for today?",
  "Would calling your caregiver help right now?"
];

export const storageKey = "memory-assistant-mvp-state";

export const initialDemoState: DemoState = {
  activeScenarioId: demoScenarios[0].id,
  checkInStatus: "Not submitted yet",
  activityEvents: [],
  systemEvents: [],
  profile: defaultDemoProfile,
  trustedLocations: defaultTrustedLocations,
  activeLocationSource: "scenario_seed",
  browserLocation: null
};

const activityEventTypes = new Set([
  "reorientation_started",
  "checkin_submitted",
  "fallback_shown",
  "helper_card_shown",
  "caregiver_called",
  "emergency_called"
]);

function normalizeTrustedLocation(location: TrustedLocation): TrustedLocation {
  const fallback = defaultTrustedLocations.find((entry) => entry.trustedSlot === location.trustedSlot);

  return {
    id: location.id ?? fallback?.id,
    trustedSlot: location.trustedSlot,
    name: typeof location.name === "string" && location.name.trim() ? location.name : fallback?.name ?? "",
    address: location.address ?? fallback?.address,
    displayAddress: location.displayAddress ?? location.address ?? fallback?.displayAddress ?? fallback?.address,
    instructions: location.instructions ?? fallback?.instructions,
    latitude: typeof location.latitude === "number" ? location.latitude : fallback?.latitude,
    longitude: typeof location.longitude === "number" ? location.longitude : fallback?.longitude,
    radiusMeters: typeof location.radiusMeters === "number" ? location.radiusMeters : fallback?.radiusMeters ?? 75,
    placeType: location.placeType ?? fallback?.placeType ?? "trusted"
  };
}

export function normalizeDemoState(raw: unknown): DemoState {
  if (!raw || typeof raw !== "object") {
    return initialDemoState;
  }

  const value = raw as Partial<DemoState> & {
    profile?: Partial<DemoProfile>;
    trustedLocations?: TrustedLocation[];
    browserLocation?: Partial<BrowserLocation> | null;
    events?: DemoEvent[];
  };
  const validScenario = demoScenarios.some((scenario) => scenario.id === value.activeScenarioId);

  let activityEvents: DemoEvent[] = [];
  let systemEvents: DemoEvent[] = [];

  if (Array.isArray(value.activityEvents)) {
    activityEvents = value.activityEvents;
  } else if (Array.isArray(value.events)) {
    activityEvents = value.events.filter((event) => activityEventTypes.has(event.eventType));
  }

  if (Array.isArray(value.systemEvents)) {
    systemEvents = value.systemEvents;
  } else if (Array.isArray(value.events)) {
    systemEvents = value.events.filter((event) => !activityEventTypes.has(event.eventType));
  }

  const browserLocation = value.browserLocation
    && typeof value.browserLocation.latitude === "number"
    && typeof value.browserLocation.longitude === "number"
    && typeof value.browserLocation.accuracyMeters === "number"
    && typeof value.browserLocation.timestamp === "string"
      ? {
          latitude: value.browserLocation.latitude,
          longitude: value.browserLocation.longitude,
          accuracyMeters: value.browserLocation.accuracyMeters,
          timestamp: value.browserLocation.timestamp
        }
      : null;

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
        : defaultDemoProfile.activeCaregiverId
    },
    trustedLocations: Array.isArray(value.trustedLocations) && value.trustedLocations.length > 0
      ? value.trustedLocations
          .filter((location): location is TrustedLocation =>
            (location.trustedSlot === 1 || location.trustedSlot === 2 || location.trustedSlot === 3) &&
            typeof location.name === "string"
          )
          .map(normalizeTrustedLocation)
          .sort((a, b) => a.trustedSlot - b.trustedSlot)
      : defaultTrustedLocations,
    activeLocationSource: value.activeLocationSource === "browser_geolocation"
      ? "browser_geolocation"
      : "scenario_seed",
    browserLocation
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
  userId = defaultDemoProfile.userId,
  locationDetails?: Pick<DemoEvent, "placeId" | "latitude" | "longitude" | "accuracyMeters" | "locationSource">
): DemoEvent {
  return {
    id: generateId(),
    eventType,
    timestamp: new Date().toISOString(),
    userId,
    source,
    scenarioId,
    metadata,
    placeId: locationDetails?.placeId ?? null,
    latitude: locationDetails?.latitude ?? null,
    longitude: locationDetails?.longitude ?? null,
    accuracyMeters: locationDetails?.accuracyMeters ?? null,
    locationSource: locationDetails?.locationSource
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

export function findTrustedLocationById(locations: TrustedLocation[], placeId?: string | null): TrustedLocation | null {
  if (!placeId) return null;
  return locations.find((location) => location.id === placeId) ?? null;
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
