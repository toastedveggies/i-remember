import { supabase } from "./supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const YEAR = 2026;

// ── Types ────────────────────────────────────────────────────────────────────

type ActivityRow = {
  id: string;
  user_id: string;
  event_type: string;
  source: string;
  confidence_level?: string | null;
  scenario_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

type BiometricRow = {
  id: string;
  user_id: string;
  event_type: string;
  value: number;
  unit: string;
  threshold_exceeded: boolean;
  source: string;
  recorded_at: string;
  created_at: string;
};

type Phase = 1 | 2 | 3 | 4;

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoTs(year: number, month: number, day: number, hour: number, minute: number): string {
  const d = new Date();
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ── Static config ─────────────────────────────────────────────────────────────

const DAYS_IN_MONTH: Record<number, number> = {
  1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
};

// Specific days-of-month that have an emergency event, per the narrative
const EMERGENCY_DAYS: Record<number, number[]> = {
  7:  [8, 22],
  8:  [5, 14, 25],
  9:  [10, 21],
  10: [3, 15, 27],
  11: [7, 12, 19, 28],
  12: [4, 16, 23],
};

const CHECK_IN_QUESTIONS = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for tonight?",
  "Would calling your caregiver help right now?",
];

function getPhase(month: number): Phase {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

// Time-of-day weights per phase
function randomHour(phase: Phase): number {
  const r = Math.random();
  if (phase === 1) {
    return r < 0.82 ? randInt(6, 11) : randInt(12, 17);
  }
  if (phase === 2) {
    if (r < 0.50) return randInt(6, 11);
    if (r < 0.88) return randInt(12, 17);
    return randInt(18, 21);
  }
  if (phase === 3) {
    if (r < 0.38) return randInt(6, 11);
    if (r < 0.72) return randInt(12, 17);
    return randInt(18, 21);
  }
  // Phase 4: spread across all hours
  if (r < 0.28) return randInt(6, 11);
  if (r < 0.52) return randInt(12, 17);
  if (r < 0.78) return randInt(18, 21);
  return r < 0.90 ? randInt(22, 23) : randInt(0, 5);
}

function randomConfidence(phase: Phase): string {
  const r = Math.random();
  if (phase === 1) return r < 0.72 ? "high" : r < 0.95 ? "medium" : "low";
  if (phase === 2) return r < 0.35 ? "high" : r < 0.85 ? "medium" : "low";
  if (phase === 3) return r < 0.15 ? "high" : r < 0.58 ? "medium" : "low";
  return r < 0.08 ? "high" : r < 0.38 ? "medium" : "low";
}

function scenarioForHour(hour: number): string {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

// ── Per-day event generation ─────────────────────────────────────────────────

function generateDay(
  month: number,
  day: number,
  phase: Phase,
  isEmergencyDay: boolean
): { activity: ActivityRow[]; biometric: BiometricRow[] } {
  const activity: ActivityRow[] = [];
  const biometric: BiometricRow[] = [];

  // Reorientation event count
  let reorientCount: number;
  switch (phase) {
    case 1:  reorientCount = randInt(1, 2); break;
    case 2:  reorientCount = randInt(2, 3); break;
    case 3:  reorientCount = randInt(3, 5); break;
    default: reorientCount = randInt(4, 6); break;
  }
  // Emergency days always qualify as hard days
  if (isEmergencyDay && reorientCount < 4) reorientCount = 4;
  const isHardDay = reorientCount >= 4;

  // 1. Reorientation events
  for (let i = 0; i < reorientCount; i++) {
    const h = randomHour(phase);
    const confidence = randomConfidence(phase);
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "reorientation_started",
      source: "app",
      confidence_level: confidence,
      scenario_id: scenarioForHour(h),
      metadata: { uncertainty: confidence },
      created_at: isoTs(YEAR, month, day, h, randInt(0, 59)),
    });
  }

  // 2. Check-in (~60% of days)
  if (Math.random() < 0.60) {
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "checkin_submitted",
      source: "app",
      metadata: { question: pick(CHECK_IN_QUESTIONS) },
      created_at: isoTs(YEAR, month, day, randomHour(phase), randInt(0, 59)),
    });
  }

  // 3. Helper card events
  let helperCount: number;
  const hr = Math.random();
  switch (phase) {
    case 1:  helperCount = hr < 0.20 ? 1 : 0; break;
    case 2:  helperCount = hr < 0.50 ? 1 : 0; break;
    case 3:  helperCount = isHardDay ? randInt(1, 2) : (hr < 0.80 ? 1 : 0); break;
    default: helperCount = isHardDay ? randInt(2, 4) : randInt(1, 2); break;
  }
  for (let i = 0; i < helperCount; i++) {
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "helper_card_shown",
      source: "app",
      created_at: isoTs(YEAR, month, day, randomHour(phase), randInt(0, 59)),
    });
  }

  // 4. Caregiver calls (clustered on hard/emergency days)
  let caregiverCount: number;
  if (isEmergencyDay) {
    caregiverCount = phase <= 3 ? randInt(3, 4) : randInt(4, 5);
  } else {
    const cr = Math.random();
    switch (phase) {
      case 1:  caregiverCount = cr < 0.15 ? 1 : 0; break;
      case 2:  caregiverCount = cr < 0.60 ? 0 : cr < 0.90 ? 1 : 2; break;
      case 3:  caregiverCount = isHardDay ? randInt(2, 3) : (cr < 0.40 ? 1 : 0); break;
      default: caregiverCount = isHardDay ? randInt(4, 5) : randInt(1, 2); break;
    }
  }

  if (caregiverCount > 0) {
    const shouldCluster = (phase >= 3 && isHardDay) || isEmergencyDay;
    if (shouldCluster) {
      // All calls within a 90-minute panic window
      const panicHour = randomHour(phase);
      for (let i = 0; i < caregiverCount; i++) {
        const offsetMin = randInt(0, 89);
        const totalMin = panicHour * 60 + offsetMin;
        activity.push({
          id: generateId(),
          user_id: DEMO_USER_ID,
          event_type: "caregiver_called",
          source: "app",
          created_at: isoTs(YEAR, month, day, Math.min(Math.floor(totalMin / 60), 23), totalMin % 60),
        });
      }
    } else {
      for (let i = 0; i < caregiverCount; i++) {
        activity.push({
          id: generateId(),
          user_id: DEMO_USER_ID,
          event_type: "caregiver_called",
          source: "app",
          created_at: isoTs(YEAR, month, day, randomHour(phase), randInt(0, 59)),
        });
      }
    }
  }

  // 5. Emergency event
  if (isEmergencyDay) {
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "emergency_called",
      source: "app",
      created_at: isoTs(YEAR, month, day, randInt(18, 21), randInt(0, 59)),
    });
  }

  // 6. Biometric events — elevated heart rate on hard days (4+ reorientation events)
  if (isHardDay) {
    const sampleCount = randInt(2, 3);
    const baseHour = randomHour(phase);
    for (let i = 0; i < sampleCount; i++) {
      const h = Math.min(baseHour + i, 23);
      const bpm = isEmergencyDay ? randInt(128, 152) : randInt(103, 128);
      const ts = isoTs(YEAR, month, day, h, randInt(0, 59));
      biometric.push({
        id: generateId(),
        user_id: DEMO_USER_ID,
        event_type: "heart_rate",
        value: bpm,
        unit: "bpm",
        threshold_exceeded: true,
        source: "synthetic",
        recorded_at: ts,
        created_at: ts,
      });
    }
  }

  return { activity, biometric };
}

// ── Batch insert ──────────────────────────────────────────────────────────────

async function insertActivityBatch(rows: ActivityRow[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 50) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("activity_events") as any).insert(rows.slice(i, i + 50));
    if (error) throw new Error(`activity_events: ${(error as { message: string }).message}`);
  }
}

async function insertBiometricBatch(rows: BiometricRow[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 50) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("biometric_events") as any).insert(rows.slice(i, i + 50));
    if (error) throw new Error(`biometric_events: ${(error as { message: string }).message}`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function seedDemoData(): Promise<{ success: boolean; message: string }> {
  try {
    const allActivity: ActivityRow[] = [];
    const allBiometric: BiometricRow[] = [];

    for (let month = 1; month <= 12; month++) {
      const days = DAYS_IN_MONTH[month];
      const phase = getPhase(month);
      const emergencyDays = EMERGENCY_DAYS[month] ?? [];

      for (let day = 1; day <= days; day++) {
        const { activity, biometric } = generateDay(month, day, phase, emergencyDays.includes(day));
        allActivity.push(...activity);
        allBiometric.push(...biometric);
      }
    }

    await insertActivityBatch(allActivity);
    await insertBiometricBatch(allBiometric);

    return {
      success: true,
      message: `Seeded ${allActivity.length} activity events and ${allBiometric.length} biometric events.`,
    };
  } catch (err) {
    return { success: false, message: `Seed failed: ${String(err)}` };
  }
}

export async function clearSeedData(): Promise<{ success: boolean; message: string }> {
  try {
    for (const table of ["activity_events", "system_events", "biometric_events"] as const) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(table) as any).delete().eq("user_id", DEMO_USER_ID);
      if (error) throw new Error(`${table}: ${(error as { message: string }).message}`);
    }
    return { success: true, message: "All seeded data cleared." };
  } catch (err) {
    return { success: false, message: `Clear failed: ${String(err)}` };
  }
}
