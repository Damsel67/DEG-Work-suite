import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/ui";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Project = { id: string; name: string; created_at: string };
export const Route = createFileRoute("/app/projects")({
  head: () => pageHead("Projects", "Create and manage projects in your private workspace."),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { workspace } = useWorkspace();
  const [items, setItems] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const load = useCallback(async () => {
    if (!workspace) return;
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, created_at")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    setItems(data ?? []);
  }, [supabase, workspace]);
  useEffect(() => {
    void load().catch((e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not load projects."),
    );
  }, [load]);

  async function addProject(event: FormEvent) {
    event.preventDefault();
    if (!workspace || !name.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("projects")
        .insert({ workspace_id: workspace.id, name: name.trim() });
      if (error) throw error;
      setName("");
      await load();
      toast.success("Project created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        module="projects"
        title="Orbit"
        description={`${items.length} ${items.length === 1 ? "project" : "projects"} in ${workspace?.name ?? "your workspace"}`}
        actions={
          <div
            className="flex rounded-lg border border-border p-0.5"
            role="group"
            aria-label="View"
          >
            {(["cards", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={v === "cards" ? "Card view" : "List view"}
                className={cn(
                  "rounded-md p-1.5",
                  view === v ? "bg-secondary text-foreground" : "text-muted-foreground",
                )}
              >
                {v === "cards" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        }
      />
      <form onSubmit={addProject} className="surface flex flex-col gap-3 p-3 sm:flex-row">
        <Input
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your project"
          aria-label="New project name"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" disabled={busy}>
          <Plus /> Create project
        </Button>
      </form>
      {items.length === 0 ? (
        <div className="surface p-10 text-center text-sm text-muted-foreground">
          Your projects will appear here. Create your first project above.
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <article key={p.id} className="surface p-6">
              <p className="text-xs text-muted-foreground">{workspace?.name}</p>
              <h2 className="mt-2 text-lg font-semibold">{p.name}</h2>
              <p className="mt-4 text-xs text-muted-foreground">
                Created {new Date(p.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface divide-y divide-border">
          {items.map((p) => (
            <div key={p.id} className="px-5 py-4 font-medium">
              {p.name}
              <span className="ml-3 text-xs font-normal text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

