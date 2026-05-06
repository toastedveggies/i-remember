import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import { caregiverSummary, eventLog } from "@/data/demoData";

export default function CaregiverPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Caregiver Dashboard</h1>
          <p className="text-base text-brand-muted">A calm overview of recent activity and current status.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
          <CaregiverSummary
            personName={caregiverSummary.personName}
            lastCheckIn={caregiverSummary.lastCheckIn}
            status={caregiverSummary.status}
            todaysEvents={caregiverSummary.todaysEvents}
          />
          <EventLogList items={eventLog} />
        </div>
      </div>
    </main>
  );
}
