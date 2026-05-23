import { findScenario, findTrustedLocation, type DemoProfile, type DemoScenario, type TrustedLocation } from "@/data/demoState";

export type EventLogItem = {
  id: string;
  time: string;
  message: string;
};

export const todaySummary = {
  greeting: "You are safe and supported.",
  where: "Your current location can come from one of your trusted places or from Other.",
  happening: "The current scenario and saved locations shape the grounding context.",
  nextStep: "Review the current location, then confirm the next routine step."
};

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for tonight?",
  "Would calling your caregiver help right now?"
];

export type ContextPacket = {
  location: string;
  time_of_day: string;
  next_event: string;
  who_is_expected: string;
  caregiver_name: string;
  notes: string;
};

function fallbackTrustedLocation(slot: 1 | 2 | 3): TrustedLocation {
  const defaults: Record<1 | 2 | 3, TrustedLocation> = {
    1: {
      trustedSlot: 1,
      name: "Home",
      address: "215 Cedar Street",
      instructions: "Bedroom upstairs. Living room near the front windows."
    },
    2: {
      trustedSlot: 2,
      name: "Community Center",
      address: "18 Oak Avenue",
      instructions: "Front desk can help contact Maria."
    },
    3: {
      trustedSlot: 3,
      name: "Maria's House",
      address: "44 Pine Lane",
      instructions: "Blue door with a porch light."
    }
  };

  return defaults[slot];
}

export function describeScenarioLocation(
  scenario: DemoScenario,
  trustedLocations: TrustedLocation[]
): { label: string; notes: string; trustedLocation: TrustedLocation | null } {
  if (scenario.locationMode === "trusted" && scenario.trustedSlot) {
    const trustedLocation = findTrustedLocation(trustedLocations, scenario.trustedSlot) ?? fallbackTrustedLocation(scenario.trustedSlot);
    const label = scenario.locationDetail
      ? `${trustedLocation.name}, ${scenario.locationDetail}`
      : trustedLocation.name;
    const notes = trustedLocation.instructions
      ? `${scenario.guidance} Trusted place note: ${trustedLocation.instructions}`
      : scenario.guidance;
    return { label, notes, trustedLocation };
  }

  const otherLabel = scenario.otherLocationLabel ?? "other";
  const detail = scenario.locationDetail ? `, ${scenario.locationDetail}` : "";
  return {
    label: `Other: ${otherLabel}${detail}`,
    notes: `${scenario.guidance} This location is outside the saved trusted places.`,
    trustedLocation: null
  };
}

export function buildContextPacket(
  scenarioId: string,
  profile: DemoProfile,
  trustedLocations: TrustedLocation[]
): ContextPacket {
  const scenario = findScenario(scenarioId);
  const location = describeScenarioLocation(scenario, trustedLocations);

  if (scenario.id === "morning") {
    return {
      location: location.label,
      time_of_day: "Tuesday morning",
      next_event: "Breakfast at 8:00 AM",
      who_is_expected: `${profile.caregiverName} visiting at noon`,
      caregiver_name: profile.caregiverName,
      notes: `${location.notes} ${profile.preferredName} just woke up.`
    };
  }

  if (scenario.id === "afternoon") {
    return {
      location: location.label,
      time_of_day: "Tuesday afternoon",
      next_event: "Short walk at 2:00 PM, then rest",
      who_is_expected: "No visitors expected",
      caregiver_name: profile.caregiverName,
      notes: `${location.notes} This is part of the after-lunch routine.`
    };
  }

  if (scenario.id === "evening") {
    return {
      location: location.label,
      time_of_day: "Tuesday evening",
      next_event: "Dinner at 6:30 PM, medication checklist after",
      who_is_expected: `${profile.caregiverName} calling at 7:00 PM`,
      caregiver_name: profile.caregiverName,
      notes: `${location.notes} Evening context is less certain and may require reassurance.`
    };
  }

  return {
    location: "unknown",
    time_of_day: "unknown",
    next_event: "Check with caregiver",
    who_is_expected: "unknown",
    caregiver_name: profile.caregiverName,
    notes: "Context unavailable"
  };
}

export const caregiverSummary = {
  personName: "Alex",
  lastCheckIn: "10 minutes ago",
  status: "Calm and oriented after reminder",
  todaysEvents: 4
};

export const eventLog: EventLogItem[] = [
  { id: "1", time: "6:05 PM", message: "Opened Today Window and viewed next step." },
  { id: "2", time: "6:07 PM", message: "Completed quick check-in question set." },
  { id: "3", time: "6:10 PM", message: "Ran demo scenario with location-aware context." },
  { id: "4", time: "6:12 PM", message: "Caregiver dashboard reviewed status summary." }
];
