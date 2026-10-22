import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader, StatusBadge } from "@/components/app/ui";
import { automations } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/automations")({
  head: () => pageHead("Automations", "Flowline workflows with run history, retries and visible failures."),
  component: AutomationsPage,
});

function AutomationsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(automations.map((a) => [a.id, true])));
  return (
    <div className="space-y-8">
      <PageHeader
        module="automations"
        title="Automations"
        description="Flowline workflows"
        actions={<Button onClick={() => toast("New workflow builder arrives in phase 8.")}><Plus /> New workflow</Button>}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {automations.map((a) => (
          <article key={a.id} className="surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold leading-snug">{a.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{a.trigger}</p>
              </div>
              <Switch
                checked={enabled[a.id] ?? true}
                onCheckedChange={(v) => {
                  setEnabled((s) => ({ ...s, [a.id]: v }));
                  toast(v ? "Workflow resumed" : "Workflow paused");
                }}
                aria-label={`${enabled[a.id] ? "Pause" : "Resume"} ${a.name}`}
              />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Runs</p><p className="font-display text-2xl">{a.runs}</p></div>
              <div><p className="text-xs text-muted-foreground">Success</p><p className="font-display text-2xl">{a.success}%</p></div>
              <div><p className="text-xs text-muted-foreground">Last run</p><p className="mt-1.5 text-sm">{a.lastRun}</p></div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <StatusBadge value={enabled[a.id] ? a.status : "Draft"} />
              {a.status === "Failing" && (
                <Button size="sm" variant="outline" onClick={() => toast("Retry queued", { description: "Retries are safe: each run has a unique key so nothing duplicates." })}>
                  <RotateCw /> Retry
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
