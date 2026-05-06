import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import { caregiverSummary, eventLog } from "@/data/demoData";

export default function CaregiverPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md space-y-4 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold text-calm-text">Caregiver Dashboard</h1>
        <p className="mt-1 text-sm text-calm-muted">A quick view of recent activity and current state.</p>
      </header>

      <CaregiverSummary
        personName={caregiverSummary.personName}
        lastCheckIn={caregiverSummary.lastCheckIn}
        status={caregiverSummary.status}
        todaysEvents={caregiverSummary.todaysEvents}
      />
      <EventLogList items={eventLog} />
    </main>
  );
}
