import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import { scenarios } from "@/data/demoData";

export default function DemoPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md space-y-4 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold text-calm-text">Scenario Demo Simulator</h1>
        <p className="mt-1 text-sm text-calm-muted">Practice supportive responses with sample situations.</p>
      </header>

      <ResponseCard
        title="Demo intent"
        message="This simulator shows static examples only. It does not make clinical or emergency decisions."
      />
      <ScenarioSelector scenarios={scenarios} />
    </main>
  );
}
