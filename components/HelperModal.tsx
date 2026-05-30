"use client";

import { useEffect } from "react";
import MemoryIcon from "@/components/MemoryIcon";
import { pronounWords, type DemoProfile } from "@/data/demoState";
import type { ActiveLocationSummary, ContextPacket } from "@/data/demoData";

type HelperModalProps = {
  open: boolean;
  onClose: () => void;
  profile: DemoProfile;
  activeLocationSummary: ActiveLocationSummary;
  contextPacket: ContextPacket;
  onCallCaregiver?: () => void;
  onCallEmergency?: () => void;
  resolvedAddress?: string | null;
};

export default function HelperModal({ open, onClose, profile, activeLocationSummary, contextPacket, onCallCaregiver, onCallEmergency, resolvedAddress }: HelperModalProps) {
  const words = pronounWords(profile.pronouns, profile.customPronouns);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const steps = [
    "Speak slowly and calmly. Use a gentle, reassuring tone.",
    `Do not leave ${profile.preferredName} alone. Stay nearby until help arrives.`,
    `Call ${profile.preferredName}'s caregiver ${profile.caregiverName} using the button below.`,
    `If ${profile.preferredName} is in immediate danger, call emergency services.`,
  ];

  return (
    <div className="fixed inset-0 z-50 font-sans" role="dialog" aria-modal="true" aria-label="Helper card">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close helper card"
      />

      <div className="absolute inset-x-3 top-[4%] flex max-h-[92svh] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">

        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E3DAC9]/40 px-5 py-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/claira-logo.webp" alt="Claira" className="h-6 w-auto" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F3EE] text-lg font-medium text-[#8B7D6B] transition-transform active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-4">

          {/* Section 1: Person identity */}
          <section className="flex flex-col items-center gap-3 pb-4 pt-2 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#7C9B78] text-4xl font-serif font-bold text-white shadow-md">
                {profile.preferredName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E4F6DD]">
                <MemoryIcon name="checkCircle" className="h-3 w-3 text-[#7C9B78]" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B7D6B]">This person&apos;s name is</p>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#5A4A3A]">{profile.preferredName}</h1>
              <p className="mt-0.5 text-sm text-[#8B7D6B]">
                {words.subject ? words.subject.charAt(0).toUpperCase() + words.subject.slice(1) : profile.preferredName}{" "}
                {profile.pronouns === "they/them" ? "have" : "has"} a memory condition and may need your help.
              </p>
            </div>
          </section>

          <hr className="h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

          {/* Section 2: Key information */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MemoryIcon name="mapPin" className="h-3 w-3 text-[#7C9B78]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#719E6B]">Key information</span>
            </div>
            <div className="flex flex-col gap-2">
              {/* Card 1: Location */}
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C8E2C4]/20">
                  <MemoryIcon name="home" className="h-6 w-6 text-[#7C9B78]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">
                    Where {words.subject ?? "they"} {profile.pronouns === "they/them" ? "are" : "is"}
                  </span>
                  <span className="font-serif text-base font-medium text-[#5A4A3A]">
                    {activeLocationSummary.placeId
                      ? activeLocationSummary.label
                      : resolvedAddress != null
                        ? resolvedAddress
                        : activeLocationSummary.detail}
                  </span>
                  {activeLocationSummary.trustedPlaceAddress ? (
                    <span className="text-xs text-[#8B7D6B]">{activeLocationSummary.trustedPlaceAddress}</span>
                  ) : null}
                </div>
              </div>
              {/* Card 2: Date */}
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C8E2C4]/20">
                  <MemoryIcon name="calendar" className="h-6 w-6 text-[#7C9B78]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">Today is</span>
                  <span className="font-serif text-base font-medium text-[#5A4A3A]">{contextPacket.time_of_day}</span>
                </div>
              </div>
              {/* Card 3: Next event */}
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C8E2C4]/20">
                  <MemoryIcon name="clock" className="h-6 w-6 text-[#7C9B78]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">Coming up</span>
                  <span className="font-serif text-base font-medium text-[#5A4A3A]">{contextPacket.next_event}</span>
                </div>
              </div>
            </div>
          </section>

          <hr className="h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

          {/* Section 3: How you can help */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MemoryIcon name="checkCircle" className="h-3 w-3 text-[#8B7355]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B7355]">How you can help</span>
            </div>
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E4F6DD] text-[11px] font-bold text-[#7C9B78]">
                    {i + 1}
                  </div>
                  <p className="flex-1 pt-0.5 text-sm leading-relaxed text-[#5A4A3A]">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

          {/* Section 4: Primary caregiver */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MemoryIcon name="phone" className="h-3 w-3 text-[#7C9B78]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#719E6B]">Primary caregiver</span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border-2 border-[#C8E2C4]/40 bg-[#E4F6DD] px-4 py-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7C9B78] text-2xl font-serif font-bold text-white opacity-75">
                {profile.caregiverName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">Caregiver</span>
                <span className="font-serif text-base font-bold text-[#5A4A3A]">{profile.caregiverName}</span>
                {profile.caregiverRelationshipLabel ? (
                  <span className="text-xs text-[#8B7D6B]">{profile.caregiverRelationshipLabel}</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onCallCaregiver}
                className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[#7C9B78] text-white shadow-md transition-transform active:scale-95"
              >
                <MemoryIcon name="phone" className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onCallCaregiver}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#7C9B78] py-4 text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
            >
              <MemoryIcon name="phone" className="h-4 w-4 text-white" />
              {`Call ${profile.caregiverName} — ${profile.preferredName}'s Caregiver`}
            </button>
          </section>

          <hr className="h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

          {/* Section 5: Emergency */}
          <section className="flex flex-col gap-3 pb-2">
            <div className="flex items-center gap-2">
              <MemoryIcon name="shield" className="h-3 w-3 text-[#A64D4D]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A64D4D]">Emergency</span>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#E8B4B4]/30 bg-[#E8B4B4]/10 px-4 py-3">
              <MemoryIcon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-[#A64D4D]" />
              <p className="text-xs leading-relaxed text-[#5A4A3A]">
                Only use this if {profile.preferredName} is in immediate physical danger or medical emergency.
              </p>
            </div>
            <button
              type="button"
              onClick={onCallEmergency}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#A64D4D] py-5 text-base font-bold text-white shadow-lg transition-transform active:scale-[0.97]"
            >
              <MemoryIcon name="phone" className="h-5 w-5" />
              Call Emergency Services
            </button>
          </section>

        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#E3DAC9]/40 px-5 pb-5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7C9B78] py-4 text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
          >
            <MemoryIcon name="checkCircle" className="h-4 w-4 text-white" />
            I&apos;m OK — Close this card
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-sm text-[#8B7D6B] underline underline-offset-2 active:opacity-70"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

