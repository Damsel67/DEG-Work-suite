import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FolderKanban, ListChecks, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard } from "@/components/app/ui";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { pageHead } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  head: () => pageHead("Huddle", "Your team's office, everywhere."),
  component: Dashboard,
});

function Dashboard() {
  const { workspace } = useWorkspace();
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const supabase = createSupabaseBrowserClient();
  const load = useCallback(async () => {
    if (!workspace) return;
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("workspace_id", workspace.id);
    if (projectError) throw projectError;
    const projectIds = ((projects ?? []) as { id: string }[]).map((project) => project.id);
    setProjectCount(projectIds.length);
    if (projectIds.length === 0) {
      setTaskCount(0);
      setCompletedCount(0);
      return;
    }
    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("id, is_completed")
      .in("project_id", projectIds);
    if (taskError) throw taskError;
    const savedTasks = (tasks ?? []) as { id: string; is_completed: boolean }[];
    setTaskCount(savedTasks.length);
    setCompletedCount(savedTasks.filter((task) => task.is_completed).length);
  }, [supabase, workspace]);
  useEffect(() => {
    void load().catch((error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not load your workspace."),
    );
  }, [load]);

  return (
    <div className="space-y-8 animate-rise">
      <PageHeader module="huddle" title="Huddle" description="Your team's office, everywhere." />
      <p className="eyebrow">{workspace?.name}</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Projects"
          value={String(projectCount).padStart(2, "0")}
          hint="In this workspace"
        />
        <StatCard
          label="Tasks"
          value={String(taskCount).padStart(2, "0")}
          hint="Across your projects"
        />
        <StatCard
          label="Completed"
          value={String(completedCount).padStart(2, "0")}
          hint="Tasks marked done"
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="surface p-6">
          <FolderKanban className="size-6 text-primary" />
          <h2 className="mt-4 font-display text-2xl">Projects</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a project to organise the work you want to complete.
          </p>
          <Button asChild className="mt-5">
            <Link to="/app/projects">
              Open projects <ArrowRight />
            </Link>
          </Button>
        </section>
        <section className="surface p-6">
          <ListChecks className="size-6 text-primary" />
          <h2 className="mt-4 font-display text-2xl">Tasks</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add tasks to a project and mark each one complete as you go.
          </p>
          <Button asChild className="mt-5">
            <Link to="/app/tasks">
              Open tasks <CheckCircle2 />
            </Link>
          </Button>
        </section>
      </div>
      <section
        className="surface flex items-start gap-4 border border-border p-6"
        aria-labelledby="huddle-setup-title"
      >
        <MessagesSquare className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="huddle-setup-title" className="font-semibold">
            Huddle messaging needs database setup
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            The connected Supabase project currently has no Huddle conversation or channel tables.
            No sample messages, unread counts, people, or activity are shown as real.
          </p>
        </div>
      </section>
    </div>
  );
}

