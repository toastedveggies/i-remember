"use client";

import { useState } from "react";
import CheckInCard from "@/components/CheckInCard";
import EventLogList from "@/components/EventLogList";
import HelperModal from "@/components/HelperModal";
import ResponseCard from "@/components/ResponseCard";
import SupportActionCard from "@/components/SupportActionCard";
import TodayCard from "@/components/TodayCard";
import { checkInQuestions, eventLog, todaySummary } from "@/data/demoData";
import MemoryIcon from "@/components/MemoryIcon";

export default function TodayWindowPage() {
  const [helperOpen, setHelperOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Today Window</h1>
          <p className="text-base text-brand-muted">Calm, human support for moments of confusion.</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Main actions</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryIcon name="home" className="h-7 w-7 text-brand-primary" />
                <h3 className="text-xl font-semibold text-brand-text">Help me understand what's happening</h3>
              </div>

              <TodayCard title="Where am I?" body={todaySummary.where} iconName="mapPin" variant="row" />
              <TodayCard title="What is happening?" body={todaySummary.happening} iconName="clock" variant="row" />
              <ResponseCard title="What should I do next?" message={todaySummary.nextStep} variant="row" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryIcon name="checkCircle" className="h-7 w-7 text-brand-primary" />
                <h3 className="text-xl font-semibold text-brand-text">Do a quick check-in</h3>
              </div>
              <CheckInCard questions={checkInQuestions} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Support actions</h2>
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <SupportActionCard
              iconName="phone"
              title="Call caregiver"
              description="Call Maria for reassurance."
              buttonLabel="Call Maria"
              href="tel:+15551234567"
            />

            <SupportActionCard
              iconName="shield"
              title="Show helper card"
              description="A simple screen you can show to a nearby person."
              buttonLabel="Show helper card"
              onClick={() => setHelperOpen(true)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-text">Recent demo events</h2>
          <EventLogList items={eventLog} />
        </section>
      </div>

      <HelperModal open={helperOpen} onClose={() => setHelperOpen(false)} />
    </main>
  );
}
