import { supabase } from "./supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

// ── Types ────────────────────────────────────────────────────────────────────

type TimeOfDay = { morning: number; afternoon: number; evening: number; night: number };

export type WeeklyData = {
  eventsPerDay: { label: string; count: number }[];
  timeOfDay: TimeOfDay;
  glance: { helpRequests: number; checkIns: number; caregiverCalls: number; emergencyEvents: number };
};

export type MonthlyData = {
  eventsPerWeek: { label: string; count: number }[];
  timeOfDay: TimeOfDay;
  stabilityScore: number;
};

export type YearlyData = {
  eventsPerMonth: { label: string; count: number }[];
  sundowningPattern: ({ month: string } & TimeOfDay)[];
  stabilityScore: number;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

type EventRow = { created_at: string; event_type: string; confidence_level?: string | null };

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function timeBucket(utcHour: number): keyof TimeOfDay {
  if (utcHour >= 6  && utcHour < 12) return "morning";
  if (utcHour >= 12 && utcHour < 18) return "afternoon";
  if (utcHour >= 18 && utcHour < 22) return "evening";
  return "night";
}

// UTC day: 0=Sun → Mon-index 6; 1=Mon → 0; …
function mondayIndex(utcDay: number): number {
  return utcDay === 0 ? 6 : utcDay - 1;
}

function weekRange(): { start: string; end: string } {
  const now = new Date();
  const mon = new Date(now);
  mon.setUTCDate(now.getUTCDate() - mondayIndex(now.getUTCDay()));
  mon.setUTCHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 7);
  return { start: mon.toISOString(), end: sun.toISOString() };
}

function monthRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
    end:   new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString(),
  };
}

function rollingYearRange(): {
  start: string;
  end: string;
  months: Array<{ year: number; month: number; label: string }>;
} {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const months: Array<{ year: number; month: number; label: string }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, label: MONTH_LABELS[d.getUTCMonth()] });
  }
  return {
    start: new Date(Date.UTC(months[0].year, months[0].month - 1, 1)).toISOString(),
    end: end.toISOString(),
    months,
  };
}

async function fetchEvents(start: string, end: string): Promise<EventRow[] | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("activity_events")
      .select("created_at, event_type, confidence_level")
      .eq("user_id", DEMO_USER_ID)
      .gte("created_at", start)
      .lt("created_at", end)
      .limit(5000);
    if (error || !data) return null;
    return data as EventRow[];
  } catch {
    return null;
  }
}

function stabilityScore(events: EventRow[]): number {
  const reorient = events.filter((e) => e.event_type === "reorientation_started");
  if (reorient.length === 0) return 0;
  const high = reorient.filter((e) => e.confidence_level === "high").length;
  return Math.round((high / reorient.length) * 100);
}

function emptyTod(): TimeOfDay {
  return { morning: 0, afternoon: 0, evening: 0, night: 0 };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getWeeklyData(): Promise<WeeklyData | null> {
  const { start, end } = weekRange();
  const events = await fetchEvents(start, end);
  if (!events) return null;

  const perDay = [0, 0, 0, 0, 0, 0, 0];
  const tod = emptyTod();
  let checkIns = 0, caregiverCalls = 0, emergencyEvents = 0;

  for (const e of events) {
    const d = new Date(e.created_at);
    const h = d.getUTCHours();
    if (e.event_type === "reorientation_started") {
      perDay[mondayIndex(d.getUTCDay())]++;
      tod[timeBucket(h)]++;
    }
    if (e.event_type === "checkin_submitted")  checkIns++;
    if (e.event_type === "caregiver_called")   caregiverCalls++;
    if (e.event_type === "emergency_called")   emergencyEvents++;
  }

  return {
    eventsPerDay: DAY_LABELS.map((label, i) => ({ label, count: perDay[i] })),
    timeOfDay: tod,
    glance: {
      helpRequests: events.filter((e) => e.event_type === "reorientation_started").length,
      checkIns,
      caregiverCalls,
      emergencyEvents,
    },
  };
}

export async function getMonthlyData(): Promise<MonthlyData | null> {
  const { start, end } = monthRange();
  const events = await fetchEvents(start, end);
  if (!events) return null;

  const perWeek = [0, 0, 0, 0];
  const tod = emptyTod();

  for (const e of events) {
    if (e.event_type !== "reorientation_started") continue;
    const d = new Date(e.created_at);
    perWeek[Math.min(Math.floor((d.getUTCDate() - 1) / 7), 3)]++;
    tod[timeBucket(d.getUTCHours())]++;
  }

  return {
    eventsPerWeek: ["Wk 1","Wk 2","Wk 3","Wk 4"].map((label, i) => ({ label, count: perWeek[i] })),
    timeOfDay: tod,
    stabilityScore: stabilityScore(events),
  };
}

export async function getYearlyData(): Promise<YearlyData | null> {
  const { start, end, months } = rollingYearRange();
  const events = await fetchEvents(start, end);
  if (!events) return null;

  const startDate = new Date(start);
  const startOffset = startDate.getUTCFullYear() * 12 + startDate.getUTCMonth();

  const perMonth = new Array<number>(12).fill(0);
  const sundown: TimeOfDay[] = Array.from({ length: 12 }, emptyTod);

  for (const e of events) {
    if (e.event_type !== "reorientation_started") continue;
    const d = new Date(e.created_at);
    const relativeIndex = (d.getUTCFullYear() * 12 + d.getUTCMonth()) - startOffset;
    if (relativeIndex < 0 || relativeIndex >= 12) continue;
    perMonth[relativeIndex]++;
    sundown[relativeIndex][timeBucket(d.getUTCHours())]++;
  }

  const monthLabels = months.map((m) => m.label);

  return {
    eventsPerMonth: monthLabels.map((label, i) => ({ label, count: perMonth[i] })),
    sundowningPattern: monthLabels.map((month, i) => ({ month, ...sundown[i] })),
    stabilityScore: stabilityScore(events),
  };
}
