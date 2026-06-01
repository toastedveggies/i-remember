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

  const fullName = profile.fullName && profile.fullName.trim() !== "" ? profile.fullName : profile.preferredName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 font-sans" role="dialog" aria-modal="true" aria-label="Helper card">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
      />

      <div className="relative w-full max-h-[90dvh] overflow-y-auto flex flex-col rounded-[24px] bg-white ring-[6px] ring-[#92BDBB] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3DAC9]/40 bg-[#DDE9E8] rounded-t-[24px] px-5 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/claira-logo.webp" alt="Claira" className="h-6 w-auto" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F3EE] text-lg font-medium text-[#8B7D6B] shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Identity block */}
        <div className="flex flex-col items-center gap-2 px-5 py-2 text-center">
          <p className="text-[17px] font-bold text-[#5A4A3A]">Hi, my name is</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#5A4A3A]">{fullName}</h1>
          <p className="mt-0.5 text-[17px] font-bold text-[#5A4A3A]">I need a little help right now.</p>
        </div>

        <hr className="mx-5 h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

        {/* Key info */}
        <div className="flex flex-col gap-2 px-5 py-2">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">Can you tell {profile.preferredName}</span>
          </div>
          {/* Location row */}
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-3 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C8E2C4]/20">
              <MemoryIcon name="home" className="h-5 w-5 text-[#7C9B78]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">
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
            <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E3DAC9]/60 bg-[#F6F3EE] px-4 py-2 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C8E2C4]/20">
                <MemoryIcon name="mapPin" className="h-5 w-5 text-[#7C9B78]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B7D6B]">What&apos;s happening</span>
                <span className="text-sm leading-snug text-[#5A4A3A]">{briefContext}</span>
              </div>
            </div>
          ) : null}
        </div>

        <hr className="mx-5 h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

        {/* Caregiver */}
        <div className="flex flex-col gap-2 px-5 py-2">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#C8E2C4] bg-[#C8E2C4]/20 px-4 py-2 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)]">
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A4A3A]/60">
                If {profile.preferredName} needs more assistance
              </p>
              <p className="font-serif text-sm font-semibold text-[#7C9B78]">
                Call {profile.caregiverName}, {words.possessive} {profile.caregiverRelationshipLabel ?? "caregiver"}
              </p>
            </div>
            <button
              type="button"
              onClick={onCallCaregiver}
              aria-label={`Call ${profile.caregiverName}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#DFFFC4] bg-[#7C9B78] shadow-md shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-95"
            >
              <div className="flex flex-col items-center leading-none gap-0">
                <span className="text-[8px] font-bold uppercase tracking-wide text-white">call</span>
                <span className="font-serif text-sm font-bold text-white">{profile.caregiverName.charAt(0).toUpperCase()}</span>
              </div>
            </button>
          </div>
        </div>

        <hr className="mx-5 h-px border-0 bg-gradient-to-r from-transparent via-[#E3DAC9] to-transparent" />

        {/* Footer */}
        <div className="flex flex-col gap-1.5 border-t border-[#E3DAC9]/40 px-5 pb-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="mx-auto flex w-1/2 items-center justify-center gap-2 rounded-2xl bg-[#7C9B78] py-2 text-sm font-bold text-white shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-[0.98]"
          >
            <div className="flex flex-col items-center gap-0">
              <span className="text-base font-bold">I&apos;M OK</span>
              <span className="text-xs font-normal opacity-80">close this card</span>
            </div>
          </button>
        </div>

        <div className="mx-5 mt-1 h-[2px] rounded-full bg-[#E3DAC9]" />

        {/* Emergency */}
        <div className="mb-1 flex flex-col gap-2 px-5 py-1.5">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E8B4B4] bg-[#E8B4B4]/20 px-4 py-1 shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)]">
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A64D4D]/70">
                If you feel that {profile.preferredName} is in danger
              </p>
              <p className="text-[13px] font-serif font-bold text-[#B27070]">Call emergency services</p>
            </div>
            <button type="button" onClick={onCallEmergency} aria-label="Call emergency services" className="shrink-0 rounded-xl border-2 border-[#EDDBDB] bg-[#A64D4D] px-3 py-1 text-xs font-bold text-white shadow-md shadow-[0px_0px_6px_-1px_rgba(0,0,0,0.22)] transition-transform active:scale-95">Call 911</button>
          </div>
        </div>

      </div>
    </div>
  );
}
