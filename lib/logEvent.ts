import { supabase } from "./supabaseClient";
import type { DemoEvent } from "@/data/demoState";

export async function logActivityEvent(event: DemoEvent): Promise<void> {
  try {
    const { error } = await supabase.from("activity_events").insert({
      id: event.id,
      event_type: event.eventType,
      created_at: event.timestamp,
      source: event.source,
      scenario_id: event.scenarioId ?? null,
      metadata: event.metadata ?? null,
    });
    // error is intentionally ignored — Supabase write failure is non-fatal
  } catch {
    // thrown exceptions are also non-fatal; app continues with local state
  }
}

export async function logSystemEvent(event: DemoEvent): Promise<void> {
  try {
    const { error } = await supabase.from("system_events").insert({
      id: event.id,
      event_type: event.eventType,
      created_at: event.timestamp,
      source: event.source,
      scenario_id: event.scenarioId ?? null,
      metadata: event.metadata ?? null,
    });
    // error is intentionally ignored — Supabase write failure is non-fatal
  } catch {
    // thrown exceptions are also non-fatal; app continues with local state
  }
}
