type Scenario = {
  id: string;
  label: string;
  guidance: string;
};

type ScenarioSelectorProps = {
  scenarios: Scenario[];
};

export default function ScenarioSelector({ scenarios }: ScenarioSelectorProps) {
  return (
    <section className="rounded-2xl border border-calm-border bg-calm-card p-4 shadow-sm">
      <h2 className="text-base font-semibold text-calm-text">Scenario Demo Simulator</h2>
      <div className="mt-3 space-y-3">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="rounded-xl border border-calm-border p-3">
            <h3 className="text-sm font-semibold text-calm-text">{scenario.label}</h3>
            <p className="mt-1 text-sm text-calm-text">{scenario.guidance}</p>
            <button
              type="button"
              className="mt-3 min-h-11 rounded-lg bg-calm-accent px-4 py-2 text-sm font-medium text-white"
            >
              Preview Scenario
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
