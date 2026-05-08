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
};

export type DemoState = {
  activeScenarioId: string;
  checkInStatus: string;
  events: DemoEvent[];
};

export type PronounSet = "he/him" | "she/her" | "they/them" | "custom";

export type DemoProfile = {
  userId: string;
  preferredName: string;
  pronouns: PronounSet;
  customPronouns?: string;
  caregiverName: string;
  caregiverRelationshipLabel?: string;
};

export const demoProfile: DemoProfile = {
  userId: "demo-user",
  preferredName: "Alex",
  pronouns: "he/him",
  caregiverName: "Maria",
  caregiverRelationshipLabel: "daughter"
};

export const demoUser = {
  id: demoProfile.userId,
  name: demoProfile.preferredName
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "morning",
    label: "Morning confusion",
    guidance: "You just woke up. Open curtains and check today's date.",
    where: "You are at home in your bedroom.",
    happening: "It is Tuesday morning. Breakfast is planned at 8:00 AM.",
    nextStep: "Open the curtains, drink water, and check your morning checklist.",
    uncertainty: "low"
  },
  {
    id: "afternoon",
    label: "Afternoon routine",
    guidance: "It is after lunch. Next: short walk, then rest.",
    where: "You are in your living room at home.",
    happening: "It is Tuesday afternoon and your routine block is light activity.",
    nextStep: "Take a short walk in the hallway, then return to rest.",
    uncertainty: "medium"
  },
  {
    id: "evening",
    label: "Evening uncertainty",
    guidance: "It is evening. Review dinner plan and medication checklist.",
    where: "Location details are limited right now.",
    happening: "It appears to be evening, but the next activity is not confirmed.",
    nextStep: "Pause, take a slow breath, and review the next activity card.",
    uncertainty: "high"
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
  events: []
};

export function createEvent(
  eventType: string,
  source: EventSource,
  scenarioId?: string,
  metadata?: Record<string, unknown>
): DemoEvent {
  return {
    id: crypto.randomUUID(),
    eventType,
    timestamp: new Date().toISOString(),
    userId: demoUser.id,
    source,
    scenarioId,
    metadata
  };
}

export function findScenario(scenarioId: string): DemoScenario {
  return demoScenarios.find((scenario) => scenario.id === scenarioId) ?? demoScenarios[0];
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
