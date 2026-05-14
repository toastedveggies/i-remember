import MemoryIcon from "@/components/MemoryIcon";

type CaregiverSummaryProps = {
  personName: string;
  lastCheckIn: string;
  status: string;
  todaysEvents: number;
  missedCalls?: number;
  emergencyCalls?: number;
};

export default function CaregiverSummary({ personName, lastCheckIn, status, todaysEvents, missedCalls = 0, emergencyCalls = 0 }: CaregiverSummaryProps) {
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
          <dt>Today events</dt>
          <dd className="font-medium">{todaysEvents}</dd>
        </div>
        {emergencyCalls > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-600 px-3 py-2">
            <dt className="font-bold text-white">Emergency calls</dt>
            <dd className="font-bold text-white">{emergencyCalls}</dd>
          </div>
        ) : null}
        {missedCalls > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2">
            <dt className="font-medium text-red-700">Missed calls</dt>
            <dd className="font-semibold text-red-700">{missedCalls}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 rounded-2xl bg-brand-support p-4 text-base text-brand-text">
        <span aria-hidden="true" className="mr-2 inline-flex text-brand-primary">
          OK
        </span>
        {status}
      </p>
    </section>
  );
}
