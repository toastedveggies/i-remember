import { supabase } from "./supabaseClient";
import type { DemoProfile, PronounSet } from "@/data/demoState";

const DEMO_PROFILE_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_CAREGIVER_ID = "00000000-0000-0000-0000-000000000002";

export async function saveProfile(profile: DemoProfile): Promise<void> {
  try {
    const { error } = await supabase.from("profiles").upsert({
      id: DEMO_PROFILE_ID,
      preferred_name: profile.preferredName,
      pronouns: profile.pronouns,
      custom_pronouns: profile.customPronouns ?? null,
    });
    // error is intentionally ignored — Supabase write failure is non-fatal
  } catch {
    // thrown exceptions are also non-fatal; app continues with local state
  }
}

export async function loadCaregiverName(): Promise<{ caregiverName: string; caregiverRelationshipLabel?: string } | null> {
  try {
    const { data, error } = await supabase
      .from("caregivers")
      .select("name, relationship_label")
      .eq("id", DEMO_CAREGIVER_ID)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      caregiverName: data.name,
      caregiverRelationshipLabel: data.relationship_label ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function loadProfile(): Promise<DemoProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("preferred_name, pronouns, custom_pronouns")
      .eq("id", DEMO_PROFILE_ID)
      .single();

    if (error || !data) {
      return null;
    }

    const caregiver = await loadCaregiverName();

    return {
      userId: DEMO_PROFILE_ID,
      preferredName: data.preferred_name,
      pronouns: data.pronouns as PronounSet,
      customPronouns: data.custom_pronouns ?? undefined,
      caregiverName: caregiver?.caregiverName ?? "",
      caregiverRelationshipLabel: caregiver?.caregiverRelationshipLabel,
    };
  } catch {
    return null;
  }
}

export async function saveCaregiverName(caregiverName: string, caregiverRelationshipLabel?: string): Promise<void> {
  try {
    const { error } = await supabase.from("caregivers").upsert({
      id: DEMO_CAREGIVER_ID,
      name: caregiverName,
      relationship_label: caregiverRelationshipLabel ?? null,
    });
    // error is intentionally ignored — Supabase write failure is non-fatal
  } catch {
    // thrown exceptions are also non-fatal; app continues with local state
  }
}
