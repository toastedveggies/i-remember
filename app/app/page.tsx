import CheckInCard from "@/components/CheckInCard";
import EventLogList from "@/components/EventLogList";
import ResponseCard from "@/components/ResponseCard";
import TodayCard from "@/components/TodayCard";
import { checkInQuestions, eventLog, todaySummary } from "@/data/demoData";

export default function TodayWindowPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md space-y-4 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold text-calm-text">Today Window</h1>
        <p className="mt-1 text-sm text-calm-muted">Clear, simple reminders for right now.</p>
      </header>

      <TodayCard title="Where am I?" body={todaySummary.where} />
      <TodayCard title="What is happening?" body={todaySummary.happening} />
      <ResponseCard title="What should I do next?" message={todaySummary.nextStep} />
      <CheckInCard questions={checkInQuestions} />
      <EventLogList items={eventLog} />
    </main>
  );
}
