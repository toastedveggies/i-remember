"use client";

import { useEffect } from "react";
import BrandLogo from "@/components/BrandLogo";
import MemoryIcon from "@/components/MemoryIcon";
import { pronounWords, type DemoProfile } from "@/data/demoState";

type HelperModalProps = {
  open: boolean;
  onClose: () => void;
  profile: DemoProfile;
};

export default function HelperModal({ open, onClose, profile }: HelperModalProps) {
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

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Helper card">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
        aria-label="Close helper card"
      />

      <div className="absolute inset-x-0 top-0 flex justify-center px-4 py-6 sm:inset-y-10 sm:items-start">
        <div className="w-full max-w-lg overflow-auto rounded-3xl border border-brand-border bg-brand-surface shadow-lg">
          <div className="flex items-center gap-3 border-b border-brand-border p-4">
            <BrandLogo size={40} />
            <div>
              <div className="text-lg font-semibold text-brand-text">Memory Assistant</div>
              <div className="text-sm text-brand-muted">A calm support tool</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex min-h-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-bg px-4 text-base font-semibold text-brand-primary"
            >
              Close
            </button>
          </div>

          <div className="p-5">
            <h2 className="text-2xl font-semibold text-brand-text">{profile.preferredName} may need a little help right now.</h2>
            <p className="mt-2 text-base leading-7 text-brand-muted">
              This is a support tool for moments of confusion. If this is an emergency, call emergency services.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-bg p-4">
                <div className="mt-0.5 text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="mapPin" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-brand-text">Tell {words.object} where {words.subject} is</div>
                  <div className="mt-1 text-base text-brand-muted">You are at home, and you are safe right now.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-bg p-4">
                <div className="mt-0.5 text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="clock" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-brand-text">Tell {words.object} what time/day it is</div>
                  <div className="mt-1 text-base text-brand-muted">Today is Tuesday. It is evening.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-bg p-4">
                <div className="mt-0.5 text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="calendar" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-brand-text">Help {words.object} contact {profile.caregiverName}</div>
                  <div className="mt-1 text-base text-brand-muted">A quick call can help reassure {words.object}.</div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-brand-border bg-brand-support p-4">
              <div className="flex items-center gap-2">
                <div className="text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="phone" className="h-6 w-6" />
                </div>
                <div className="text-lg font-semibold text-brand-text">
                  {profile.caregiverName}
                  {profile.caregiverRelationshipLabel ? ` (${profile.caregiverRelationshipLabel})` : ""}
                </div>
              </div>

              <a
                href="tel:+15551234567"
                className="mt-3 flex min-h-14 items-center justify-center rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                {`Call ${profile.caregiverName}`}
              </a>

              <p className="mt-3 text-sm text-brand-muted">
                If you are worried or someone is in danger, please contact emergency services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

