type CaregiverSummaryProps = {
  personName: string;
  lastCheckIn: string;
  status: string;
  todaysEvents: number;
};

export default function CaregiverSummary({ personName, lastCheckIn, status, todaysEvents }: CaregiverSummaryProps) {
  return (
    <section className="rounded-2xl border border-calm-border bg-calm-card p-4 shadow-sm">
      <h2 className="text-base font-semibold text-calm-text">Caregiver Snapshot</h2>
      <dl className="mt-3 space-y-2 text-sm text-calm-text">
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
      <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-calm-text">{status}</p>
    </section>
  );
}
