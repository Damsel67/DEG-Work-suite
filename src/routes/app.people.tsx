import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatusBadge } from "@/components/app/ui";
import { people } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/people")({
  head: () => pageHead("People", "Team members, roles and invitations for your workspace."),
  component: PeoplePage,
});

function PeoplePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        module="people"
        title="People"
        description={`${people.length} members in DEG Studio Lagos`}
        actions={<Button onClick={() => toast("Invite teammate", { description: "Invitations will be sent by email once sign-in is live." })}><UserPlus /> Invite</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <article key={p.id} className="surface flex items-center gap-4 p-5">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">{p.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="truncate text-sm text-muted-foreground">{p.title}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{p.role}</Badge>
                <StatusBadge value={p.status} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
