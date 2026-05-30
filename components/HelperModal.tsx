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
  briefContext?: string;
};

export default function HelperModal({ open, onClose, profile, activeLocationSummary, onCallCaregiver, onCallEmergency, resolvedAddress, briefContext }: HelperModalProps) {
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

  const subjectCap = words.subject
    ? words.subject.charAt(0).toUpperCase() + words.subject.slice(1)
    : profile.preferredName;

  const caregiverLabel = profile.caregiverRelationshipLabel
    ? profile.caregiverRelationshipLabel.charAt(0).toUpperCase() + profile.caregiverRelationshipLabel.slice(1)
    : "Caregiver";

  return (
    <div className="fixed inset-0 z-50 font-sans" role="dialog" aria-modal="true" aria-label="Helper card">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
      />

      <div className="absolute inset-x-3 top-[6%] flex flex-col rounded-[24px] bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3DAC9]/40 px-5 py-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/claira-logo.webp" alt="Claira" className="h-6 w-auto" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F3EE] text-lg font-medium text-[#8B7D6B] transition-transform active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Identity block */}
        <div className="flex flex-col items-center gap-2 px-5 py-4 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7C9B78] font-serif text-3xl font-bold text-white shadow-md">
              {profile.preferredName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#E4F6DD]">
              <MemoryIcon name="checkCircle" className="h-3 w-3 text-[#7C9B78]" />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8B7D6B]">This person&apos;s name is</p>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#5A4A3A]">{profile.preferredName}</h1>
            <p className="text-sm text-[#8B7D6B]">
              {subjectCap}{" "}
              {profile.pronouns === "they/them" ? "have" : "has"} a memory condition and may need your help.
            </p>
          </div>
        </div>

        <hr className="mx-5 h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

        {/* Key info */}
        <div className="flex flex-col gap-2 px-5 py-3">
          {/* Location row */}
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C8E2C4]/20">
              <MemoryIcon name="home" className="h-5 w-5 text-[#7C9B78]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7D6B]">
                Where {words.subject ?? "they"} {profile.pronouns === "they/them" ? "are" : "is"}
              </span>
              <span className="font-serif text-sm font-semibold text-[#5A4A3A]">
                {activeLocationSummary.placeId
                  ? activeLocationSummary.label
                  : resolvedAddress ?? activeLocationSummary.label}
              </span>
              {activeLocationSummary.trustedPlaceAddress ? (
                <span className="text-xs text-[#8B7D6B]">{activeLocationSummary.trustedPlaceAddress}</span>
              ) : null}
            </div>
          </div>
          {/* Context row (conditional) */}
          {briefContext ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C8E2C4]/20">
                <MemoryIcon name="mapPin" className="h-5 w-5 text-[#7C9B78]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7D6B]">Situation</span>
                <span className="text-sm leading-snug text-[#5A4A3A]">{briefContext}</span>
              </div>
            </div>
          ) : null}
        </div>

        <hr className="mx-5 h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

        {/* Actions */}
        <div className="flex flex-col gap-2 px-5 py-3">
          <div className="mb-1 flex items-center gap-2">
            <MemoryIcon name="phone" className="h-3 w-3 text-[#7C9B78]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#719E6B]">Contact for help</span>
          </div>
          <button
            type="button"
            onClick={onCallCaregiver}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#7C9B78] py-3.5 text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
          >
            <MemoryIcon name="phone" className="h-4 w-4 text-white" />
            {`Call ${profile.caregiverName} — ${caregiverLabel}`}
          </button>
          <button
            type="button"
            onClick={onCallEmergency}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#A64D4D]/40 bg-[#E8B4B4]/20 py-3 text-sm font-bold text-[#A64D4D] transition-transform active:scale-[0.98]"
          >
            <MemoryIcon name="phone" className="h-4 w-4 text-[#A64D4D]" />
            Call Emergency Services
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-1.5 border-t border-[#E3DAC9]/40 px-5 pb-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7C9B78] py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
          >
            <MemoryIcon name="checkCircle" className="h-4 w-4 text-white" />
            I&apos;m OK — Close this card
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-1 text-center text-xs text-[#8B7D6B] underline underline-offset-2 active:opacity-70"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
