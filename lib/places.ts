import {
  defaultTrustedLocations,
  generateId,
  type BrowserLocation,
  type DemoScenario,
  type LocationMode,
  type LocationSource,
  type TrustedLocation
} from "@/data/demoState";
import { supabase } from "./supabaseClient";

const DEMO_PROFILE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_PLACE_RADIUS_METERS = 75;
export const MAX_DEMO_BROWSER_ACCURACY_METERS = 250;

type PlaceRow = {
  id: string;
  name: string;
  address: string | null;
  instructions: string | null;
  trusted_slot: number | null;
  latitude: number | null;
  longitude: number | null;
  place_type: string | null;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type TrustedPlaceMatch = {
  place: TrustedLocation;
  distanceMeters: number;
  radiusMeters: number;
};

export type ResolvedLocationContext = {
  source: LocationSource;
  coordinates: Coordinates;
  accuracyMeters: number | null;
  matchedTrustedPlace: TrustedLocation | null;
  matchedPlaceId: string | null;
  scenarioPlace: TrustedLocation | null;
  locationMode: LocationMode;
  fallbackReason?: "browser_unavailable" | "browser_inaccurate";
};

function fallbackPlaceForSlot(slot: 1 | 2 | 3): TrustedLocation | undefined {
  return defaultTrustedLocations.find((location) => location.trustedSlot === slot);
}

export function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const startLatitude = toRadians(a.latitude);
  const endLatitude = toRadians(b.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) * Math.cos(endLatitude) *
    Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function matchTrustedPlace(
  coordinates: Coordinates,
  locations: TrustedLocation[]
): TrustedPlaceMatch | null {
  let bestMatch: TrustedPlaceMatch | null = null;

  for (const location of locations) {
    if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
      continue;
    }

    const radiusMeters = location.radiusMeters ?? fallbackPlaceForSlot(location.trustedSlot)?.radiusMeters ?? DEFAULT_PLACE_RADIUS_METERS;
    const distanceMeters = haversineDistanceMeters(coordinates, {
      latitude: location.latitude,
      longitude: location.longitude
    });

    if (distanceMeters > radiusMeters) {
      continue;
    }

    if (!bestMatch || distanceMeters < bestMatch.distanceMeters) {
      bestMatch = { place: location, distanceMeters, radiusMeters };
    }
  }

  return bestMatch;
}

export function resolveActiveLocationContext(params: {
  scenario: DemoScenario;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: BrowserLocation | null;
}): ResolvedLocationContext {
  const { scenario, trustedLocations, activeLocationSource, browserLocation } = params;
  const scenarioPlace = scenario.scenarioPlaceId
    ? trustedLocations.find((location) => location.id === scenario.scenarioPlaceId) ?? null
    : null;

  let source: LocationSource = "scenario_seed";
  let coordinates: Coordinates = scenario.seededCoordinates;
  let accuracyMeters: number | null = null;
  let fallbackReason: ResolvedLocationContext["fallbackReason"];

  if (activeLocationSource === "browser_geolocation") {
    if (!browserLocation) {
      fallbackReason = "browser_unavailable";
    } else if (browserLocation.accuracyMeters > MAX_DEMO_BROWSER_ACCURACY_METERS) {
      fallbackReason = "browser_inaccurate";
    } else {
      source = "browser_geolocation";
      coordinates = {
        latitude: browserLocation.latitude,
        longitude: browserLocation.longitude
      };
      accuracyMeters = browserLocation.accuracyMeters;
    }
  }

  const match = matchTrustedPlace(coordinates, trustedLocations);

  return {
    source,
    coordinates,
    accuracyMeters,
    matchedTrustedPlace: match?.place ?? null,
    matchedPlaceId: match?.place.id ?? null,
    scenarioPlace,
    locationMode: match ? "trusted_place" : "other",
    fallbackReason
  };
}

export async function loadTrustedLocations(userId = DEMO_PROFILE_ID): Promise<TrustedLocation[]> {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("id, name, address, instructions, trusted_slot, latitude, longitude, place_type")
      .eq("user_id", userId)
      .eq("is_trusted", true)
      .order("trusted_slot", { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as PlaceRow[])
      .filter((row) => row.trusted_slot === 1 || row.trusted_slot === 2 || row.trusted_slot === 3)
      .map((row) => {
        const fallback = fallbackPlaceForSlot(row.trusted_slot as 1 | 2 | 3);
        return {
          id: row.id,
          trustedSlot: row.trusted_slot as 1 | 2 | 3,
          name: row.name,
          address: row.address ?? undefined,
          displayAddress: row.address ?? fallback?.displayAddress ?? undefined,
          instructions: row.instructions ?? fallback?.instructions ?? undefined,
          latitude: row.latitude ?? fallback?.latitude,
          longitude: row.longitude ?? fallback?.longitude,
          radiusMeters: fallback?.radiusMeters ?? DEFAULT_PLACE_RADIUS_METERS,
          placeType: (row.place_type as TrustedLocation["placeType"] | null) ?? fallback?.placeType ?? "trusted"
        };
      });
  } catch {
    return [];
  }
}

export async function saveTrustedLocation(location: TrustedLocation, userId = DEMO_PROFILE_ID): Promise<TrustedLocation> {
  const fallback = fallbackPlaceForSlot(location.trustedSlot);
  const payload = {
    id: location.id ?? fallback?.id ?? generateId(),
    user_id: userId,
    name: location.name.trim(),
    address: location.address?.trim() || null,
    instructions: location.instructions?.trim() || null,
    latitude: typeof location.latitude === "number" ? location.latitude : fallback?.latitude ?? null,
    longitude: typeof location.longitude === "number" ? location.longitude : fallback?.longitude ?? null,
    is_trusted: true,
    trusted_slot: location.trustedSlot,
    place_type: location.placeType ?? fallback?.placeType ?? "trusted"
  };

  await supabase.from("places").upsert(payload);

  return {
    id: payload.id,
    trustedSlot: location.trustedSlot,
    name: payload.name,
    address: payload.address ?? undefined,
    displayAddress: location.displayAddress ?? payload.address ?? fallback?.displayAddress ?? undefined,
    instructions: payload.instructions ?? undefined,
    latitude: payload.latitude ?? undefined,
    longitude: payload.longitude ?? undefined,
    radiusMeters: location.radiusMeters ?? fallback?.radiusMeters ?? DEFAULT_PLACE_RADIUS_METERS,
    placeType: payload.place_type as TrustedLocation["placeType"]
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
