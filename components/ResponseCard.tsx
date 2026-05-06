type ResponseCardProps = {
  title: string;
  message: string;
};

export default function ResponseCard({ title, message }: ResponseCardProps) {
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-base font-semibold text-calm-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-calm-text">{message}</p>
    </section>
  );
}
