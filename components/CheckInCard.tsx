import MemoryIcon from "@/components/MemoryIcon";

type CheckInCardProps = {
  questions: string[];
  title?: string;
};

export default function CheckInCard({ questions, title = "Do a quick check-in" }: CheckInCardProps) {
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
              className="min-h-14 w-full rounded-2xl border border-brand-border border-l-4 border-l-brand-compass bg-brand-surface px-4 py-4 text-left text-base text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
