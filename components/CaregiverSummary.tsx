import MemoryIcon from "@/components/MemoryIcon";

type CaregiverSummaryProps = {
  personName: string;
  lastCheckIn: string;
  status: string;
  todaysEvents: number;
};

export default function CaregiverSummary({ personName, lastCheckIn, status, todaysEvents }: CaregiverSummaryProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-text">
        <MemoryIcon name="shield" className="h-7 w-7 text-brand-primary" />
        Caregiver Snapshot
      </h2>
      <dl className="mt-3 space-y-2 text-base text-brand-text">
        <div className="flex items-center justify-between gap-3">
          <dt>Name</dt>
          <dd className="font-medium">{personName}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Last check-in</dt>
          <dd className="font-medium">{lastCheckIn}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Today's events</dt>
          <dd className="font-medium">{todaysEvents}</dd>
        </div>
      </dl>
      <p className="mt-3 rounded-2xl bg-brand-support p-4 text-base text-brand-text">
        <span aria-hidden="true" className="mr-2 inline-flex text-brand-primary">
          ✓
        </span>
        {status}
      </p>
    </section>
  );
}
