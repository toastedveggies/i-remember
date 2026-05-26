import type { DemoEvent } from "@/data/demoState";
import { supabase } from "./supabaseClient";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function logActivityEvent(event: DemoEvent): Promise<void> {
  try {
    await supabase.from("activity_events").insert({
      id: event.id,
      user_id: event.userId,
      event_type: event.eventType,
      created_at: event.timestamp,
      source: event.source,
      scenario_id: event.scenarioId ?? null,
      place_id: event.placeId && isValidUuid(event.placeId) ? event.placeId : null,
      latitude: event.latitude ?? null,
      longitude: event.longitude ?? null,
      metadata: event.metadata ?? null,
    });
  } catch {
    // Non-fatal in demo mode.
  }
}

export async function logSystemEvent(event: DemoEvent): Promise<void> {
  try {
    await supabase.from("system_events").insert({
      id: event.id,
      user_id: event.userId,
      event_type: event.eventType,
      created_at: event.timestamp,
      source: event.source,
      scenario_id: event.scenarioId ?? null,
      metadata: event.metadata ?? null,
    });
  } catch {
    // Non-fatal in demo mode.
  }
}
