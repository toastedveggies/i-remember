export type EventLogItem = {
  id: string;
  time: string;
  message: string;
};

export const todaySummary = {
  greeting: "You are safe at home.",
  where: "You are at 215 Cedar Street, in your living room.",
  happening: "It is Tuesday evening. Dinner is at 6:30 PM.",
  nextStep: "Drink a glass of water, then review your evening checklist."
};

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for tonight?",
  "Would calling your caregiver help right now?"
];

export const scenarios = [
  { id: "morning", label: "Morning confusion", guidance: "You just woke up. Open curtains and check today's date." },
  { id: "afternoon", label: "Afternoon routine", guidance: "It is after lunch. Next: short walk, then rest." },
  { id: "evening", label: "Evening uncertainty", guidance: "It is evening. Review dinner plan and medication checklist." }
];

export const caregiverSummary = {
  personName: "Alex",
  lastCheckIn: "10 minutes ago",
  status: "Calm and oriented after reminder",
  todaysEvents: 4
};

export const eventLog: EventLogItem[] = [
  { id: "1", time: "6:05 PM", message: "Opened Today Window and viewed next step." },
  { id: "2", time: "6:07 PM", message: "Completed quick check-in question set." },
  { id: "3", time: "6:10 PM", message: "Ran demo scenario: Evening uncertainty." },
  { id: "4", time: "6:12 PM", message: "Caregiver dashboard reviewed status summary." }
];
