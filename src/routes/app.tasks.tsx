import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/app/ui";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Project = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  project_id: string;
  is_completed: boolean;
  created_at: string;
};
export const Route = createFileRoute("/app/tasks")({
  head: () => pageHead("Tasks", "Create and complete tasks in your projects."),
  component: TasksPage,
});

function TasksPage() {
  const { workspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<Task[]>([]);
  const [projectId, setProjectId] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const loadProjects = useCallback(async () => {
    if (!workspace) return;
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .eq("workspace_id", workspace.id)
      .order("created_at");
    if (error) throw error;
    const next = (data ?? []) as Project[];
    setProjects(next);
    setProjectId((current) => (next.some((p) => p.id === current) ? current : (next[0]?.id ?? "")));
  }, [supabase, workspace]);
  const loadTasks = useCallback(async () => {
    if (!projectId) {
      setItems([]);
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, project_id, is_completed, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    setItems(data ?? []);
  }, [projectId, supabase]);
  useEffect(() => {
    void loadProjects().catch((e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not load projects."),
    );
  }, [loadProjects]);
  useEffect(() => {
    void loadTasks().catch((e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not load tasks."),
    );
  }, [loadTasks]);
  const visible = useMemo(
    () => items.filter((t) => filter === "all" || (filter === "done") === t.is_completed),
    [items, filter],
  );
  const done = items.filter((t) => t.is_completed).length;

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!projectId || !title.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .insert({ project_id: projectId, title: title.trim() });
      if (error) throw error;
      setTitle("");
      await loadTasks();
      toast.success("Task added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add task.");
    } finally {
      setBusy(false);
    }
  }

  async function setCompleted(task: Task, completed: boolean) {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: completed })
      .eq("id", task.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === task.id ? { ...item, is_completed: completed } : item)),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        module="tasks"
        title="Tasks"
        description={`${done} of ${items.length} complete`}
      />
      {projects.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="font-medium">Create a project first</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks belong to a project in your workspace.
          </p>
        </div>
      ) : (
        <>
          <label className="flex max-w-sm items-center gap-3 text-sm">
            <span className="shrink-0 text-muted-foreground">Project</span>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger aria-label="Project">
                <SelectValue placeholder="Choose project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <form onSubmit={add} className="surface flex flex-col gap-3 p-3 sm:flex-row">
            <Input
              required
              maxLength={240}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a task…"
              aria-label="New task title"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" disabled={busy || !projectId}>
              <Plus /> Add task
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "open", "done"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                aria-pressed={filter === s}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent",
                )}
              >
                {s === "all" ? "All" : s === "open" ? "To do" : "Done"}
              </button>
            ))}
          </div>
          <ul className="surface divide-y divide-border overflow-hidden">
            {visible.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">
                No tasks in this view.
              </li>
            )}
            {visible.map((task) => (
              <li key={task.id} className="flex items-center gap-3 px-5 py-4">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={(checked) => void setCompleted(task, checked === true)}
                  aria-label={task.is_completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                />
                <p
                  className={cn(
                    "font-medium",
                    task.is_completed && "text-muted-foreground line-through",
                  )}
                >
                  {task.title}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

