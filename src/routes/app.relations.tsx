import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Initials, PageHeader } from "@/components/app/ui";
import { contacts, formatNaira, pipelineStages } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/relations")({
  head: () => pageHead("Relations", "Clients, companies and deals with a full history of every interaction."),
  component: RelationsPage,
});

function RelationsPage() {
  const total = contacts.reduce((s, c) => s + c.value, 0);
  return (
    <div className="space-y-8">
      <PageHeader
        module="relations"
        title="Relations"
        description={`Pipeline value ${formatNaira(total * 100)}`}
        actions={<Button onClick={() => toast("New contact", { description: "Duplicates are checked before saving." })}><Plus /> New contact</Button>}
      />
      <div className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-5">
        {pipelineStages.map((stage) => {
          const items = contacts.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="min-w-[220px] rounded-2xl bg-muted/60 p-3">
              <div className="flex items-center justify-between px-1 pb-3">
                <h2 className="text-sm font-semibold">{stage}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((c) => (
                  <div key={c.id} className="surface p-4">
                    <p className="font-semibold leading-snug">{c.company}</p>
                    <p className="text-sm text-muted-foreground">{c.name}</p>
                    <p className="mt-3 font-display text-xl">{formatNaira(c.value * 100)}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Initials name={c.owner} /></span>
                      <span>{c.last}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="px-1 text-xs text-muted-foreground">No deals</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
