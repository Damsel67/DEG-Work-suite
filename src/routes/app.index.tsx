import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel, StatCard, StatusBadge } from "@/components/app/ui";
import { automations, projects, proposals, tasks, tickets } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";
import { moduleByKey } from "@/lib/modules";

export const Route = createFileRoute("/app/")({
  head: () => pageHead("Home", "Your priorities, projects, requests and AI proposals at a glance."),
  component: Dashboard,
});

function greeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [hello, setHello] = useState("Welcome back");
  useEffect(() => setHello(greeting(new Date().getHours())), []);

  const priority = tasks.filter((t) => (t.priority === "Urgent" || t.priority === "High") && t.status !== "Done");
  const open = tickets.filter((t) => t.status !== "Resolved");
  const health = Math.round(automations.reduce((s, a) => s + a.success, 0) / automations.length);

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <h1 className="font-display text-4xl font-normal md:text-5xl">{hello}, Adaeze</h1>
        <p className="mt-2 text-muted-foreground">Your work, priorities and intelligence in one place.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Priority tasks" value={String(priority.length).padStart(2, "0")} hint="Urgent or high, not done" />
        <StatCard label="Active projects" value={String(projects.length).padStart(2, "0")} hint="1 blocked, 1 at risk" />
        <StatCard label="Open requests" value={String(open.length).padStart(2, "0")} hint="1 past SLA" />
        <StatCard label="Automation health" value={`${health}%`} hint="Successful runs, last 30 days" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Panel title="DEG Command" action={<span className="text-xs text-muted-foreground">{proposals.length} awaiting review</span>}>
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-highlight" /> Proposal
            </div>
            <p className="mt-2 text-lg font-semibold">{proposals[0].title}</p>
            <p className="mt-1 text-sm text-muted-foreground">Draft ready · Review before sending</p>
            <Button asChild className="mt-5">
              <Link to="/app/command">Review proposal</Link>
            </Button>
          </div>
        </Panel>

        <section className="moments surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-primary">DEG Moments</h2>
            <img src={moduleByKey("moments").icon} alt="" className="size-7 rounded-lg" />
          </div>
          <div className="p-5">
            <p className="font-medium">A quiet space to reflect</p>
            <Link
              to="/app/moments"
              className="mt-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-5 text-sm text-secondary-foreground transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2"><Lock className="size-4" /> My Journal · Private by default</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Priority tasks" action={<Link to="/app/tasks" className="text-sm font-semibold text-primary hover:underline">All tasks</Link>}>
          <ul className="divide-y divide-border">
            {priority.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.project} · due {t.due}</p>
                </div>
                <StatusBadge value={t.priority} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Projects" action={<Link to="/app/projects" className="text-sm font-semibold text-primary hover:underline">All projects</Link>}>
          <ul className="divide-y divide-border">
            {projects.slice(0, 4).map((p) => (
              <li key={p.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <StatusBadge value={p.status} />
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
