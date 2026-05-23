import { supabase } from "./supabaseClient";
import { generateId, type TrustedLocation } from "@/data/demoState";

const DEMO_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

type PlaceRow = {
  id: string;
  name: string;
  address: string | null;
  instructions: string | null;
  trusted_slot: number | null;
};

export async function loadTrustedLocations(userId = DEMO_PROFILE_ID): Promise<TrustedLocation[]> {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("id, name, address, instructions, trusted_slot")
      .eq("user_id", userId)
      .eq("is_trusted", true)
      .order("trusted_slot", { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as PlaceRow[])
      .filter((row) => row.trusted_slot === 1 || row.trusted_slot === 2 || row.trusted_slot === 3)
      .map((row) => ({
        id: row.id,
        trustedSlot: row.trusted_slot as 1 | 2 | 3,
        name: row.name,
        address: row.address ?? undefined,
        instructions: row.instructions ?? undefined
      }));
  } catch {
    return [];
  }
}

export async function saveTrustedLocation(location: TrustedLocation, userId = DEMO_PROFILE_ID): Promise<TrustedLocation> {
  const payload = {
    id: location.id ?? generateId(),
    user_id: userId,
    name: location.name.trim(),
    address: location.address?.trim() || null,
    instructions: location.instructions?.trim() || null,
    is_trusted: true,
    trusted_slot: location.trustedSlot,
    place_type: "trusted"
  };

  await supabase.from("places").upsert(payload);

  return {
    id: payload.id,
    trustedSlot: location.trustedSlot,
    name: payload.name,
    address: payload.address ?? undefined,
    instructions: payload.instructions ?? undefined
  };
}

export async function clearTrustedLocation(slot: 1 | 2 | 3, userId = DEMO_PROFILE_ID): Promise<void> {
  try {
    await supabase
      .from("places")
      .delete()
      .eq("user_id", userId)
      .eq("trusted_slot", slot)
      .eq("is_trusted", true);
  } catch {
    // non-fatal for demo mode
  }
}
