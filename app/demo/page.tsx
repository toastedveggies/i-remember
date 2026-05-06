import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import { scenarios } from "@/data/demoData";

export default function DemoPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Scenario Demo Simulator</h1>
          <p className="text-base text-brand-muted">Practice supportive responses with sample situations.</p>
        </header>

        <ResponseCard
          title="Demo intent"
          message="This simulator shows static examples only. It does not make clinical or emergency decisions."
        />

        <ScenarioSelector scenarios={scenarios} />
      </div>
    </main>
  );
}
