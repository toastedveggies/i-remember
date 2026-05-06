import MemoryIcon from "@/components/MemoryIcon";

type ResponseCardProps = {
  title: string;
  message: string;
  variant?: "card" | "row";
};

export default function ResponseCard({ title, message, variant = "card" }: ResponseCardProps) {
  const wrapper =
    variant === "row"
      ? "rounded-2xl border border-brand-highlight/40 bg-brand-bg p-4"
      : "rounded-3xl border border-brand-highlight/50 bg-brand-highlight/20 p-5 shadow-sm";

  return (
    <section className={wrapper}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-brand-compass" aria-hidden="true">
          <MemoryIcon name="checkCircle" className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
          <p className="mt-2 text-base leading-7 text-brand-muted">{message}</p>
        </div>
      </div>
    </section>
  );
}
