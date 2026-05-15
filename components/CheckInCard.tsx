type CheckInCardProps = {
  questions: string[];
  selectedQuestion?: string;
  submittedState?: string;
  onSelectQuestion?: (question: string) => void;
  onSubmit?: () => void;
};

export default function CheckInCard({
  questions,
  selectedQuestion,
  submittedState,
  onSelectQuestion,
  onSubmit
}: CheckInCardProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <ul className="space-y-3">
        {questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => onSelectQuestion?.(question)}
              className={`min-h-14 w-full rounded-2xl border border-brand-border border-l-4 border-l-brand-compass px-4 py-4 text-left text-base text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${selectedQuestion === question ? "bg-green-50" : "bg-brand-surface"}`}
            >
              <span className="block font-medium">{selectedQuestion === question ? "Selected" : "Tap to select"}</span>
              {question}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          className="min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass disabled:opacity-50"
          disabled={!selectedQuestion}
        >
          Submit check-in
        </button>
        {submittedState ? <p className="rounded-2xl bg-brand-support p-3 text-sm text-brand-text">{submittedState}</p> : null}
      </div>
    </section>
  );
}
