import MemoryIcon from "@/components/MemoryIcon";

type CheckInCardProps = {
  questions: string[];
  title?: string;
  selectedQuestion?: string;
  submittedState?: string;
  onSelectQuestion?: (question: string) => void;
  onSubmit?: () => void;
};

export default function CheckInCard({
  questions,
  title = "Do a quick check-in",
  selectedQuestion,
  submittedState,
  onSelectQuestion,
  onSubmit
}: CheckInCardProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-text">
        <span aria-hidden="true" className="text-brand-compass">
          <MemoryIcon name="checkCircle" className="h-7 w-7" />
        </span>
        {title}
      </h2>
      <ul className="mt-3 space-y-3">
        {questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => onSelectQuestion?.(question)}
              className="min-h-14 w-full rounded-2xl border border-brand-border border-l-4 border-l-brand-compass bg-brand-surface px-4 py-4 text-left text-base text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
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
