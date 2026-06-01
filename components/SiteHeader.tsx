"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  storageKey,
  normalizeDemoState,
  initialDemoState,
  type DemoState,
  type BrowserLocation,
} from "@/data/demoState";
import { MAX_DEMO_BROWSER_ACCURACY_METERS } from "@/lib/places";
import MemoryIcon from "@/components/MemoryIcon";

const scenarioButtons: { id: string; icon: "sunrise" | "stethoscope" | "rx" | "moon" | "alertTriangle" }[] = [
  { id: "home_reorientation", icon: "sunrise" },
  { id: "doctor_appointment_prep", icon: "stethoscope" },
  { id: "pharmacy_confusion", icon: "rx" },
  { id: "evening_routine", icon: "moon" },
  { id: "lost_unknown_location", icon: "alertTriangle" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<DemoState>(initialDemoState);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try { setState(normalizeDemoState(JSON.parse(raw))); } catch { /* use initialDemoState */ }
    }
    const handler = () => {
      const r = window.localStorage.getItem(storageKey);
      if (r) {
        try { setState(normalizeDemoState(JSON.parse(r))); } catch { /* ignore */ }
      }
    };
    window.addEventListener("claira-state-update", handler);
    return () => window.removeEventListener("claira-state-update", handler);
  }, []);

  const headerPersist = (nextState: DemoState) => {
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    window.dispatchEvent(new CustomEvent("claira-state-update"));
  };

  const handleScenarioClick = (id: string) => {
    if (id === "lost_unknown_location") {
      const raw = window.localStorage.getItem(storageKey);
      let current = initialDemoState;
      if (raw) {
        try { current = normalizeDemoState(JSON.parse(raw)); } catch { /* use initial */ }
      }
      headerPersist({
        ...current,
        activeScenarioId: "lost_unknown_location",
        demoClassroomMode: true,
        activeLocationSource: "scenario_seed",
      });

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position.coords.accuracy <= MAX_DEMO_BROWSER_ACCURACY_METERS) {
              const latest = window.localStorage.getItem(storageKey);
              let latestState = initialDemoState;
              if (latest) {
                try { latestState = normalizeDemoState(JSON.parse(latest)); } catch { /* use initial */ }
              }
              const browserLocation: BrowserLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracyMeters: position.coords.accuracy,
                timestamp: new Date().toISOString(),
              };
              headerPersist({
                ...latestState,
                activeLocationSource: "browser_geolocation",
                browserLocation,
              });
            }
          },
          () => { /* accuracy too broad or error — keep scenario_seed */ },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      }
    } else {
      const raw = window.localStorage.getItem(storageKey);
      let current = initialDemoState;
      if (raw) {
        try { current = normalizeDemoState(JSON.parse(raw)); } catch { /* use initial */ }
      }
      headerPersist({
        ...current,
        activeScenarioId: id,
        activeLocationSource: "scenario_seed",
        demoClassroomMode: false,
      });
    }
  };

  const activeScenarioId = state.activeScenarioId;
  const userInitial = state.profile.preferredName.charAt(0).toUpperCase();
  const caregiverInitial = state.profile.caregiverName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-brand-border bg-[#F4E9D5] backdrop-blur">
      <div className="flex items-stretch w-full max-w-3xl mx-auto pl-3 pr-1">
        {/* Left: Logo tap-to-home */}
        <Link href="/" className="flex items-center shrink-0 pr-3 py-2" aria-label="Claira home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/claira-logo.webp" alt="Claira" className="h-10 w-auto" />
        </Link>

        {/* Right: View tabs (row 1) + scenario buttons (row 2) */}
        <div className="flex flex-col items-end justify-between flex-1 pt-0 pb-1 gap-0.5">
          {/* Row 1: User / Caregiver tabs */}
          <div className="flex flex-row items-start gap-1">
            <button
              type="button"
              onClick={() => router.push("/app")}
              className={`rounded-t-none rounded-b-lg border-2 w-12 h-7 flex items-center justify-center text-sm font-bold transition-colors active:scale-95 focus:outline-none ${
                pathname === "/app"
                  ? "bg-[#F4F9F3] border-[#E4F6DD] text-[#9DB49A]"
                  : "bg-white border-[#E4F6DD] text-[#D1DBD0]"
              }`}
            >
              {userInitial}
            </button>
            <button
              type="button"
              onClick={() => router.push("/caregiver")}
              className={`rounded-t-none rounded-b-lg border-2 w-12 h-7 flex items-center justify-center text-sm font-bold transition-colors active:scale-95 focus:outline-none ${
                pathname === "/caregiver"
                  ? "bg-[#E3F6FB] border-[#D4E8ED] text-[#88AEB7]"
                  : "bg-white border-[#D4E8ED] text-[#C9D9DD]"
              }`}
            >
              {caregiverInitial}
            </button>
          </div>

          {/* Row 2: Scenario shortcut buttons */}
          <div className="flex flex-row items-center gap-0.5">
            {scenarioButtons.map(({ id, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleScenarioClick(id)}
                className={`rounded-md border-2 w-[26px] h-[22px] flex items-center justify-center transition-colors active:scale-95 focus:outline-none ${
                  activeScenarioId === id
                    ? "bg-[#FAE4B0] border-[#F5C842]"
                    : "bg-white border-[#FAE4B0]"
                }`}
              >
                <MemoryIcon
                  name={icon}
                  className={`h-3 w-3 ${activeScenarioId === id ? "text-[#BD8B35]" : "text-[#F0DBB7]"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
