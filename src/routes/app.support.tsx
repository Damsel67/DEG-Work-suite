import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, StatusBadge } from "@/components/app/ui";
import { tickets } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/support")({
  head: () => pageHead("Support", "Service requests with owners, SLA timers and clear internal notes."),
  component: SupportPage,
});

function SupportPage() {
  const [selected, setSelected] = useState(tickets[0].id);
  const [mode, setMode] = useState<"reply" | "internal">("reply");
  const t = tickets.find((x) => x.id === selected)!;

  return (
    <div className="space-y-8">
      <PageHeader
        module="support"
        title="Support"
        description={`${tickets.filter((x) => x.status !== "Resolved").length} open requests`}
        actions={<Button onClick={() => toast("New request", { description: "Requester, issue, priority and owner are captured." })}><Plus /> Create request</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <ul className="surface divide-y divide-border overflow-hidden">
          {tickets.map((x) => (
            <li key={x.id}>
              <button
                onClick={() => setSelected(x.id)}
                className={cn("w-full px-5 py-4 text-left transition-colors hover:bg-muted/60", selected === x.id && "bg-muted")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">{x.id}</span>
                  <span className={cn("text-xs", x.sla.startsWith("Overdue") ? "font-semibold text-destructive" : "text-muted-foreground")}>{x.sla}</span>
                </div>
                <p className="mt-1 font-medium">{x.subject}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge value={x.status} />
                  <StatusBadge value={x.priority} />
                </div>
              </button>
            </li>
          ))}
        </ul>

        <Panel title={`${t.id} · ${t.requester}`}>
          <div className="space-y-4 p-5">
            <h2 className="text-xl font-semibold">{t.subject}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><span className="text-muted-foreground">Owner</span><br />{t.owner}</p>
              <p><span className="text-muted-foreground">SLA</span><br />{t.sla}</p>
            </div>
            <div className="flex rounded-lg border border-border p-0.5 text-sm" role="tablist">
              <button role="tab" aria-selected={mode === "reply"} onClick={() => setMode("reply")} className={cn("flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 font-medium", mode === "reply" && "bg-primary text-primary-foreground")}>
                <MessageSquare className="size-4" /> Reply to client
              </button>
              <button role="tab" aria-selected={mode === "internal"} onClick={() => setMode("internal")} className={cn("flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 font-medium", mode === "internal" && "bg-highlight text-highlight-foreground")}>
                <Lock className="size-4" /> Internal note
              </button>
            </div>
            <div className={cn("rounded-xl border-2 p-1", mode === "internal" ? "border-dashed border-highlight bg-highlight/10" : "border-transparent")}>
              {mode === "internal" && <p className="px-2 pt-1 text-xs font-semibold">Only your team can see this note</p>}
              <Textarea placeholder={mode === "reply" ? `Reply to ${t.requester}…` : "Add a note for your team…"} className="min-h-[120px] border-0 bg-transparent shadow-none focus-visible:ring-0" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success(mode === "reply" ? "Reply previewed — not sent in the prototype" : "Internal note added")}>
                {mode === "reply" ? "Send reply" : "Add note"}
              </Button>
              <Button variant="outline" onClick={() => toast("Resolving asks for a resolution reason.")}>Resolve</Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
