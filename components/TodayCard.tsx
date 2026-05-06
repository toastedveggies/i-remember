type TodayCardProps = {
  title: string;
  body: string;
};

export default function TodayCard({ title, body }: TodayCardProps) {
  return (
    <section className="rounded-2xl border border-calm-border bg-calm-card p-4 shadow-sm">
      <h2 className="text-base font-semibold text-calm-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-calm-text">{body}</p>
    </section>
  );
}
