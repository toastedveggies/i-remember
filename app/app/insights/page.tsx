"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMonthlyData, getWeeklyData, getYearlyData, type MonthlyData, type WeeklyData, type YearlyData } from "@/lib/insightsData";

type Tab = "week" | "month" | "year";

// ── Static placeholder data ──────────────────────────────────────────────────

const weekBarData = [
  { label: "Mon", count: 4 },
  { label: "Tue", count: 2 },
  { label: "Wed", count: 5 },
  { label: "Thu", count: 3 },
  { label: "Fri", count: 1 },
  { label: "Sat", count: 3 },
  { label: "Sun", count: 2 },
];

const monthBarData = [
  { label: "Wk 1", count: 14 },
  { label: "Wk 2", count: 11 },
  { label: "Wk 3", count: 9 },
  { label: "Wk 4", count: 8 },
];

const yearLineData = [
  { label: "Jan", count: 8 },
  { label: "Feb", count: 9 },
  { label: "Mar", count: 11 },
  { label: "Apr", count: 10 },
  { label: "May", count: 13 },
  { label: "Jun", count: 14 },
  { label: "Jul", count: 15 },
  { label: "Aug", count: 16 },
  { label: "Sep", count: 18 },
  { label: "Oct", count: 19 },
  { label: "Nov", count: 21 },
  { label: "Dec", count: 23 },
];

const weekTimeOfDay = [
  { label: "Morning", range: "6am–12pm", count: 5 },
  { label: "Afternoon", range: "12pm–6pm", count: 8 },
  { label: "Evening", range: "6pm–10pm", count: 7 },
  { label: "Night", range: "10pm–6am", count: 0 },
];

const monthTimeOfDay = [
  { label: "Morning", range: "6am–12pm", count: 17 },
  { label: "Afternoon", range: "12pm–6pm", count: 24 },
  { label: "Evening", range: "6pm–10pm", count: 27 },
  { label: "Night", range: "10pm–6am", count: 2 },
];

const weekStats = { helpRequests: 20, checkIns: 14, caregiverCalls: 2, emergencyEvents: 0 };

// Sundowning heatmap: rows = Jan–Dec, cols = Morning / Afternoon / Evening / Night
const sundowningRows = [
  [4, 6, 8, 1],
  [3, 5, 7, 1],
  [4, 7, 8, 0],
  [3, 6, 7, 1],
  [3, 5, 6, 0],
  [2, 5, 6, 0],
  [2, 4, 5, 0],
  [2, 5, 6, 0],
  [2, 4, 4, 0],
  [1, 3, 4, 0],
  [1, 3, 4, 0],
  [1, 2, 3, 0],
];
const heatmapMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const heatmapBuckets = ["Morning","Afternoon","Evening","Night"];

// ── Sub-components ───────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const chartH = 96;
  return (
    <div className="flex items-end gap-1 sm:gap-2" style={{ height: chartH + 44 }}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-xs text-brand-muted">{item.count > 0 ? item.count : ""}</span>
          <div
            className="w-full rounded-t-lg"
            style={{
              height: item.count > 0 ? `${(item.count / max) * chartH}px` : "2px",
              backgroundColor: item.count > 0 ? "#A44A3F" : "#D9D6D0",
            }}
          />
          <span className="text-xs text-brand-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }: { data: { label: string; count: number }[] }) {
  const W = 480;
  const H = 90;
  const pad = 6;
  const max = Math.max(...data.map((d) => d.count), 1);
  const pts = data
    .map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = pad + ((max - d.count) / max) * (H - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="120" preserveAspectRatio="none">
        <polyline
          points={pts}
          fill="none"
          stroke="#A44A3F"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => {
          const x = pad + (i / (data.length - 1)) * (W - pad * 2);
          const y = pad + ((max - d.count) / max) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r="4" fill="#A44A3F" />;
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.label} className="text-xs text-brand-muted">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function TimeOfDayBreakdown({ data }: { data: { label: string; range: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ul className="space-y-3">
      {data.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-medium text-brand-text">
              {row.label}{" "}
              <span className="font-normal text-xs text-brand-muted">{row.range}</span>
            </span>
            <span className="text-sm font-semibold text-brand-text">{row.count}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-brand-border overflow-hidden">
            <div
              className="h-2 rounded-full bg-brand-compass"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatGrid({ stats }: { stats: typeof weekStats }) {
  const items = [
    { label: "Help requests", value: stats.helpRequests, variant: "default" as const },
    { label: "Check-ins completed", value: stats.checkIns, variant: "default" as const },
    { label: "Caregiver calls", value: stats.caregiverCalls, variant: (stats.caregiverCalls > 0 ? "warn" : "default") as "warn" | "default" },
    { label: "Emergency events", value: stats.emergencyEvents, variant: (stats.emergencyEvents > 0 ? "alert" : "default") as "alert" | "default" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border border-brand-border p-4 ${
            item.variant === "alert" ? "bg-red-50" : item.variant === "warn" ? "bg-blue-50" : "bg-brand-bg"
          }`}
        >
          <p
            className={`text-3xl font-bold ${
              item.variant === "alert" ? "text-red-600" : item.variant === "warn" ? "text-blue-700" : "text-brand-text"
            }`}
          >
            {item.value}
          </p>
          <p className="text-sm text-brand-muted mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function StabilityScore({ score, periodLabel }: { score: number; periodLabel: string }) {
  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-7xl font-bold text-brand-primary">{score}</p>
      <p className="text-xl text-brand-muted mt-1">/ 100</p>
      <p className="mt-3 text-sm text-brand-muted text-center max-w-xs">
        Stability score for {periodLabel}. Reflects the ratio of low-uncertainty to
        high-uncertainty moments across all events. Higher is calmer.
      </p>
    </div>
  );
}

function SundowningHeatmap({ rows }: { rows: number[][] }) {
  const maxVal = Math.max(...rows.flat(), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" style={{ borderSpacing: "3px", borderCollapse: "separate" }}>
        <thead>
          <tr>
            <th className="w-10 text-left font-medium text-brand-muted pb-2" />
            {heatmapBuckets.map((b) => (
              <th key={b} className="text-center font-medium text-brand-muted pb-2 px-1">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, mi) => (
            <tr key={heatmapMonths[mi]}>
              <td className="pr-2 py-0.5 font-medium text-brand-muted text-right">
                {heatmapMonths[mi]}
              </td>
              {row.map((val, bi) => (
                <td key={bi} className="py-0.5 px-0.5">
                  <div
                    className="h-5 w-full rounded"
                    style={{
                      backgroundColor: `rgba(164, 74, 63, ${val > 0 ? 0.1 + (val / maxVal) * 0.75 : 0.05})`,
                    }}
                    title={`${heatmapMonths[mi]} ${heatmapBuckets[bi]}: ${val}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AppInsightsPage() {
  const [tab, setTab] = useState<Tab>("week");
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [weekData, setWeekData] = useState<WeeklyData | null>(null);
  const [monthData, setMonthData] = useState<MonthlyData | null>(null);
  const [yearData, setYearData] = useState<YearlyData | null>(null);

  useEffect(() => {
    Promise.all([getWeeklyData(), getMonthlyData(), getYearlyData()]).then(([w, m, y]) => {
      setWeekData(w);
      setMonthData(m);
      setYearData(y);
      setInsightsLoading(false);
    });
  }, []);

  const resolvedWeekBarData = weekData?.eventsPerDay ?? weekBarData;
  const resolvedWeekTimeOfDay = weekData
    ? [
        { label: "Morning",   range: "6am–12pm",  count: weekData.timeOfDay.morning },
        { label: "Afternoon", range: "12pm–6pm",  count: weekData.timeOfDay.afternoon },
        { label: "Evening",   range: "6pm–10pm",  count: weekData.timeOfDay.evening },
        { label: "Night",     range: "10pm–6am",  count: weekData.timeOfDay.night },
      ]
    : weekTimeOfDay;
  const resolvedWeekStats = weekData?.glance ?? weekStats;

  const resolvedMonthBarData = monthData?.eventsPerWeek ?? monthBarData;
  const resolvedMonthTimeOfDay = monthData
    ? [
        { label: "Morning",   range: "6am–12pm",  count: monthData.timeOfDay.morning },
        { label: "Afternoon", range: "12pm–6pm",  count: monthData.timeOfDay.afternoon },
        { label: "Evening",   range: "6pm–10pm",  count: monthData.timeOfDay.evening },
        { label: "Night",     range: "10pm–6am",  count: monthData.timeOfDay.night },
      ]
    : monthTimeOfDay;
  const resolvedMonthScore = monthData?.stabilityScore ?? 72;

  const resolvedYearLineData = yearData?.eventsPerMonth ?? yearLineData;
  const resolvedYearScore = yearData?.stabilityScore ?? 68;
  const resolvedSundowningRows = yearData?.sundowningPattern
    ? yearData.sundowningPattern.map((p) => [p.morning, p.afternoon, p.evening, p.night])
    : sundowningRows;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">

        <header className="space-y-2">
          <Link
            href="/app"
            className="flex items-center gap-1 rounded-lg px-1 py-0.5 text-sm font-medium text-brand-primary hover:text-brand-compass focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-semibold text-brand-text">Insights</h1>
          <p className="text-base text-brand-muted">Your personal activity history.</p>
          <p className="text-xs text-brand-muted">
            {insightsLoading
              ? "Loading data from Supabase…"
              : weekData
                ? "Live data from Supabase."
                : "Prototype note: charts use placeholder data. Seed data in /demo to populate."}
          </p>
        </header>

        {insightsLoading && (
          <p className="animate-pulse text-sm text-brand-muted">Loading insights…</p>
        )}

        <div className="flex gap-2">
          {(["week", "month", "year"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                tab === t
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-brand-border bg-brand-bg text-brand-text hover:bg-brand-surface"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "week" && (
          <div className="space-y-4">
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">Confusion Events This Week</h2>
              <p className="text-sm text-brand-muted">Help requests per day (reorientation started)</p>
              <BarChart data={resolvedWeekBarData} />
            </section>

            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">Time of Day</h2>
              <TimeOfDayBreakdown data={resolvedWeekTimeOfDay} />
            </section>

            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">This Week at a Glance</h2>
              <StatGrid stats={resolvedWeekStats} />
            </section>
          </div>
        )}

        {tab === "month" && (
          <div className="space-y-4">
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">Confusion Events This Month</h2>
              <p className="text-sm text-brand-muted">Help requests per week</p>
              <BarChart data={resolvedMonthBarData} />
            </section>

            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">Time of Day</h2>
              <TimeOfDayBreakdown data={resolvedMonthTimeOfDay} />
            </section>

            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-brand-text">Stability Score</h2>
              <StabilityScore score={resolvedMonthScore} periodLabel="this month" />
            </section>
          </div>
        )}

        {tab === "year" && (
          <div className="space-y-4">
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">Confusion Events This Year</h2>
              <p className="text-sm text-brand-muted">
                Help requests per month — higher values indicate more confusion events
              </p>
              <LineChart data={resolvedYearLineData} />
            </section>

            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
              <h2 className="text-xl font-semibold text-brand-text">Sundowning Pattern</h2>
              <p className="text-sm text-brand-muted">
                Event frequency by month and time of day. Darker cells = more events.
              </p>
              <SundowningHeatmap rows={resolvedSundowningRows} />
            </section>

            <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-brand-text">Stability Score</h2>
              <StabilityScore score={resolvedYearScore} periodLabel="this year" />
            </section>
          </div>
        )}

      </div>
    </main>
  );
}
