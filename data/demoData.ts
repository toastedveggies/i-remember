import {
  findScenario,
  findTrustedLocationById,
  type DemoProfile,
  type DemoScenario,
  type LocationSource,
  type TrustedLocation
} from "@/data/demoState";
import { resolveActiveLocationContext } from "@/lib/places";

export type EventLogItem = {
  id: string;
  time: string;
  message: string;
};

export const todaySummary = {
  greeting: "You are safe and supported.",
  where: "Your current location is matched against your saved trusted places or shown as Other.",
  happening: "The active scenario and location context shape the grounding response.",
  nextStep: "Review the location summary, then take the next calm step."
};

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for today?",
  "Would calling your caregiver help right now?"
];

export type ContextPacket = {
  location: string;
  location_mode: string;
  location_source: string;
  trusted_place: string;
  trusted_place_address: string;
  location_coordinates: string;
  time_of_day: string;
  next_event: string;
  current_activity: string;
  who_is_expected: string;
  caregiver_name: string;
  notes: string;
  safety_fallback: string;
};

export type ActiveLocationSummary = {
  label: string;
  detail: string;
  trustedPlaceName: string | null;
  trustedPlaceAddress: string | null;
  sourceLabel: string;
  locationModeLabel: string;
  fallbackMessage?: string;
  placeId: string | null;
};

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

function buildBringItemsText(items?: string[]): string {
  if (!items || items.length === 0) {
    return "No extra items listed.";
  }

  return items.join(", ");
}

function scenarioTimeOfDay(scenario: DemoScenario): string {
  const now = new Date();
  const hour = scenario.scenarioHour != null ? scenario.scenarioHour : now.getHours();
  const minutes = now.getMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const date = now.getDate();
  return `${dayName}, ${monthName} ${date} at ${displayHour}:${displayMinutes} ${period}`;
}

function scenarioNextEvent(scenario: DemoScenario, trustedLocations: TrustedLocation[]): string {
  if (scenario.scheduledEvent) {
    const scheduledPlace = findTrustedLocationById(trustedLocations, scenario.scheduledEvent.placeId);
    const placeLabel = scheduledPlace?.name ? ` at ${scheduledPlace.name}` : "";
    return `${scenario.scheduledEvent.title}${placeLabel}. ${scenario.scheduledEvent.timeLabel}. Bring ${buildBringItemsText(scenario.scheduledEvent.bringItems)}.`;
  }

  if (scenario.id === "home_reorientation") {
    return "A quiet morning — take your time, have some tea, and ease in gently.";
  }

  if (scenario.id === "pharmacy_confusion") {
    return "Pick up the prescription, then head back home.";
  }

  if (scenario.id === "evening_routine") {
    return "Time to wind down — maybe some TV or a book before bed.";
  }

  if (scenario.id === "lost_unknown_location") {
    return "Unfamiliar place — contact Maria if needed.";
  }

  return "Continue the current home routine at an easy pace.";
}

function scenarioExpectedVisitor(scenario: DemoScenario, profile: DemoProfile): string {
  if (scenario.id === "doctor_appointment_prep") {
    return `${profile.caregiverName} can help if leaving feels confusing.`;
  }

  if (scenario.id === "lost_unknown_location") {
    return "No other people are required right now.";
  }

  return "No other people are required right now.";
}

export function describeScenarioLocation(
  scenario: DemoScenario,
  trustedLocations: TrustedLocation[]
): { label: string; notes: string; trustedLocation: TrustedLocation | null } {
  const trustedLocation = findTrustedLocationById(trustedLocations, scenario.scenarioPlaceId);

  if (scenario.expectedLocationMode === "trusted_place" && trustedLocation) {
    const suffix = scenario.scheduledEvent ? " + Doctor Appointment" : "";
    return {
      label: `${trustedLocation.name}${suffix}`,
      notes: trustedLocation.displayAddress ?? trustedLocation.address ?? trustedLocation.name,
      trustedLocation
    };
  }

  return {
    label: "Other",
    notes: "This scenario should fall back to unrecognized-location guidance.",
    trustedLocation: null
  };
}

export function buildActiveLocationSummary(params: {
  scenarioId: string;
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    timestamp: string;
  } | null;
}): ActiveLocationSummary {
  const scenario = findScenario(params.scenarioId);
  const resolved = resolveActiveLocationContext({
    scenario,
    trustedLocations: params.trustedLocations,
    activeLocationSource: params.activeLocationSource,
    browserLocation: params.browserLocation
  });

  const sourceLabel = resolved.source === "browser_geolocation"
    ? "Browser geolocation"
    : "Seeded scenario coordinates";

  const fallbackMessage = resolved.fallbackReason === "browser_unavailable"
    ? "Live device location was not available, so the demo is using the scenario's seeded coordinates."
    : resolved.fallbackReason === "browser_inaccurate"
      ? "Live device location was too inaccurate for a safe demo match, so the demo is using the scenario's seeded coordinates."
      : undefined;

  if (resolved.matchedTrustedPlace) {
    return {
      label: resolved.matchedTrustedPlace.name,
      detail: resolved.matchedTrustedPlace.displayAddress ?? resolved.matchedTrustedPlace.address ?? "Saved trusted place",
      trustedPlaceName: resolved.matchedTrustedPlace.name,
      trustedPlaceAddress: resolved.matchedTrustedPlace.displayAddress ?? resolved.matchedTrustedPlace.address ?? null,
      sourceLabel,
      locationModeLabel: "Trusted place",
      fallbackMessage,
      placeId: resolved.matchedTrustedPlace.id ?? null
    };
  }

  return {
    label: "Other",
    detail: "I do not recognize this as one of your saved trusted places.",
    trustedPlaceName: null,
    trustedPlaceAddress: null,
    sourceLabel,
    locationModeLabel: "Other",
    fallbackMessage,
    placeId: null
  };
}

export function buildContextPacket(params: {
  scenarioId: string;
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    timestamp: string;
  } | null;
}): ContextPacket {
  const scenario = findScenario(params.scenarioId);
  const resolved = resolveActiveLocationContext({
    scenario,
    trustedLocations: params.trustedLocations,
    activeLocationSource: params.activeLocationSource,
    browserLocation: params.browserLocation
  });

  const trustedPlace = resolved.matchedTrustedPlace;
  const location = trustedPlace
    ? trustedPlace.name
    : "I do not recognize this as one of your saved trusted places.";
  const trustedPlaceAddress = trustedPlace?.displayAddress ?? trustedPlace?.address ?? "No saved trusted-place address available.";

  const notes = trustedPlace
    ? [
        scenario.guidance,
        trustedPlace.instructions ?? "",
        scenario.currentActivity ? `Current activity: ${scenario.currentActivity}.` : "",
        scenario.scheduledEvent ? `Bring items: ${buildBringItemsText(scenario.scheduledEvent.bringItems)}.` : "",
        resolved.source === "browser_geolocation"
          ? "The current coordinates came from browser geolocation."
          : "The current coordinates came from seeded demo data."
      ].filter(Boolean).join(" ")
    : [
        "Do not guess a place name, address, reason for being here, or who is nearby.",
        "Say clearly that this is not a recognized trusted place.",
        "Offer calm support: stay where you are if safe, call the caregiver, show the helper card, or call emergency services if unsafe or urgent."
      ].join(" ");

  return {
    location,
    location_mode: resolved.locationMode,
    location_source: resolved.source,
    trusted_place: trustedPlace?.name ?? "Other",
    trusted_place_address: trustedPlaceAddress,
    location_coordinates: `${formatCoordinate(resolved.coordinates.latitude)}, ${formatCoordinate(resolved.coordinates.longitude)}`,
    time_of_day: scenarioTimeOfDay(scenario),
    next_event: scenarioNextEvent(scenario, params.trustedLocations),
    current_activity: scenario.currentActivity ?? "No specific current activity is confirmed.",
    who_is_expected: scenarioExpectedVisitor(scenario, params.profile),
    caregiver_name: params.profile.caregiverName,
    notes,
    safety_fallback: "If the user feels unsafe or urgently needs help, tell them to call their caregiver or emergency services right away."
  };
}

export const caregiverSummary = {
  personName: "Alex",
  lastCheckIn: "10 minutes ago",
  status: "Calm and oriented after reminder",
  todaysEvents: 4
};

export const eventLog: EventLogItem[] = [
  { id: "1", time: "6:05 PM", message: "Opened Today Window and reviewed trusted-place context." },
  { id: "2", time: "6:07 PM", message: "Completed quick check-in question set." },
  { id: "3", time: "6:10 PM", message: "Ran demo scenario with trusted-place matching." },
  { id: "4", time: "6:12 PM", message: "Caregiver dashboard reviewed current location summary." }
];
