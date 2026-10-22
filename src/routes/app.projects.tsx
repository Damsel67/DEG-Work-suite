import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Initials, PageHeader, StatusBadge } from "@/components/app/ui";
import { projects } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/projects")({
  head: () => pageHead("Projects", "Plan delivery with owners, progress and due dates across every client project."),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [view, setView] = useState<"cards" | "list">("cards");
  return (
    <div className="space-y-8">
      <PageHeader
        module="projects"
        title="Projects"
        description={`${projects.length} active projects`}
        actions={
          <>
            <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="View">
              {(["cards", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={v === "cards" ? "Card view" : "List view"}
                  className={cn("rounded-md p-1.5", view === v ? "bg-secondary text-foreground" : "text-muted-foreground")}
                >
                  {v === "cards" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
                </button>
              ))}
            </div>
            <Button onClick={() => toast("New project", { description: "Name, owner, visibility and members are validated when this goes live." })}>
              <Plus /> New project
            </Button>
          </>
        }
      />

      {view === "cards" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="surface flex flex-col p-6 transition-shadow hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{p.client}</p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug">{p.name}</h2>
                </div>
                <StatusBadge value={p.status} />
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-semibold text-foreground">{p.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="flex items-center gap-2"><Initials name={p.owner} /> {p.owner}</span>
                <span className="text-muted-foreground">Due {p.due}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Tasks</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="px-5 py-3.5"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.client}</p></td>
                  <td className="px-5 py-3.5">{p.owner}</td>
                  <td className="px-5 py-3.5">{p.tasks}</td>
                  <td className="px-5 py-3.5">{p.due}</td>
                  <td className="px-5 py-3.5"><StatusBadge value={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
