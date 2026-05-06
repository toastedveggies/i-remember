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
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-text">Scenario Demo Simulator</h2>
      <div className="mt-3 space-y-3">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <h3 className="text-base font-semibold text-brand-text">{scenario.label}</h3>
            <p className="mt-1 text-base text-brand-muted">{scenario.guidance}</p>
            <button
              type="button"
              className="mt-3 min-h-14 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
            >
              <span aria-hidden="true" className="mr-2">
                →
              </span>
              Preview
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
