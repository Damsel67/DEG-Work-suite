import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, StatCard } from "@/components/app/ui";
import { projects, tasks, tickets } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/insights")({
  head: () => pageHead("Insights", "Calm reports on delivery, customers and cash, traceable to source records."),
  component: InsightsPage,
});

const WEEKS = [
  { w: "W38", done: 9 },
  { w: "W39", done: 12 },
  { w: "W40", done: 8 },
  { w: "W41", done: 14 },
  { w: "W42", done: 11 },
  { w: "W43", done: 16 },
];

function InsightsPage() {
  const max = Math.max(...WEEKS.map((w) => w.done));
  const byStatus = ["To do", "In progress", "In review", "Done"].map((s) => ({ s, n: tasks.filter((t) => t.status === s).length }));
  const resolved = tickets.filter((t) => t.status === "Resolved").length;
  const avg = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);

  return (
    <div className="space-y-8">
      <PageHeader module="insights" title="Insights" description="Every number links back to its records" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average project progress" value={`${avg}%`} hint={`Across ${projects.length} projects`} />
        <StatCard label="Requests resolved" value={`${resolved}/${tickets.length}`} hint="Last 30 days" />
        <StatCard label="Tasks closed this week" value={WEEKS.at(-1)!.done} hint="Up from 11 last week" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Tasks completed per week">
          <div className="flex h-64 items-end gap-4 p-6">
            {WEEKS.map((w, i) => (
              <div key={w.w} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold">{w.done}</span>
                <div
                  className={i === WEEKS.length - 1 ? "w-full rounded-t-full bg-highlight" : "w-full rounded-t-full bg-primary"}
                  style={{ height: `${(w.done / max) * 170}px` }}
                />
                <span className="text-xs text-muted-foreground">{w.w}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Tasks by status">
          <ul className="space-y-4 p-6">
            {byStatus.map((b) => (
              <li key={b.s}>
                <div className="flex justify-between text-sm"><span>{b.s}</span><span className="font-semibold">{b.n}</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-chart-4" style={{ width: `${(b.n / tasks.length) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
