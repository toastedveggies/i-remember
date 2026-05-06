type CheckInCardProps = {
  questions: string[];
};

export default function CheckInCard({ questions }: CheckInCardProps) {
  return (
    <section className="rounded-2xl border border-calm-border bg-calm-card p-4 shadow-sm">
      <h2 className="text-base font-semibold text-calm-text">Quick Check-In</h2>
      <ul className="mt-3 space-y-3">
        {questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              className="w-full rounded-xl border border-calm-border bg-white px-4 py-3 text-left text-sm text-calm-text"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
