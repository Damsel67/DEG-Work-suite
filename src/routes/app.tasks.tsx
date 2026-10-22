import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Initials, PageHeader, StatusBadge } from "@/components/app/ui";
import { tasks as seed, type Priority, type TaskStatus } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tasks")({
  head: () => pageHead("Tasks", "Assign, prioritise and complete the day's work across every project."),
  component: TasksPage,
});

const STATUSES: TaskStatus[] = ["To do", "In progress", "In review", "Done"];

function TasksPage() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [title, setTitle] = useState("");

  const visible = useMemo(() => (filter === "all" ? items : items.filter((t) => t.status === filter)), [items, filter]);
  const done = items.filter((t) => t.status === "Done").length;

  const setStatus = (id: string, status: TaskStatus) => setItems((xs) => xs.map((t) => (t.id === id ? { ...t, status } : t)));

  const add = () => {
    if (!title.trim()) {
      toast.error("A task needs a title");
      return;
    }
    setItems((xs) => [
      { id: `t${Date.now()}`, title: title.trim(), project: "Unassigned", assignee: "Adaeze Okafor", priority: "Normal" as Priority, status: "To do", due: "No date" },
      ...xs,
    ]);
    setTitle("");
    toast.success("Task added");
  };

  return (
    <div className="space-y-8">
      <PageHeader module="tasks" title="Tasks" description={`${done} of ${items.length} complete`} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="surface flex flex-col gap-3 p-3 sm:flex-row"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" aria-label="New task title" className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
        <Button type="submit"><Plus /> Add task</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
            )}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
        {filter !== "all" && (
          <button onClick={() => setFilter("all")} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            Reset
          </button>
        )}
      </div>

      <ul className="surface divide-y divide-border overflow-hidden">
        {visible.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No tasks with this status.</li>}
        {visible.map((t) => (
          <li key={t.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Checkbox
                checked={t.status === "Done"}
                onCheckedChange={(c) => setStatus(t.id, c ? "Done" : "To do")}
                aria-label={t.status === "Done" ? `Reopen ${t.title}` : `Complete ${t.title}`}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <p className={cn("font-medium", t.status === "Done" && "text-muted-foreground line-through")}>{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.project} · due {t.due}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-7 md:pl-0">
              <StatusBadge value={t.priority} />
              <span className="flex items-center gap-2 text-sm"><Initials name={t.assignee} /><span className="hidden lg:inline">{t.assignee}</span></span>
              <Select value={t.status} onValueChange={(v) => setStatus(t.id, v as TaskStatus)}>
                <SelectTrigger className="h-8 w-[130px] bg-background text-xs" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
