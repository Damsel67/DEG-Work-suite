import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Circle, Orbit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/ui";
import { pageHead } from "@/lib/seo";

const plannedCapabilities = [
  "Ask questions and draft content",
  "Summarize conversations and extract action items",
  "Prepare meeting notes",
  "Turn a conversation into a task or reminder",
  "Find information the signed-in user is allowed to access",
];

export const Route = createFileRoute("/app/nexa")({
  head: () => pageHead("Nexa", "Your intelligence, amplified."),
  component: NexaPage,
});

function NexaPage() {
  return (
    <div className="space-y-8">
      <PageHeader module="nexa" title="Nexa" description="Your intelligence, amplified." />

      <section className="surface max-w-4xl p-6 md:p-8" aria-labelledby="nexa-status-title">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Orbit className="size-6" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <Badge variant="warning">AI provider not configured</Badge>
        </div>
        <h2 id="nexa-status-title" className="mt-6 font-display text-3xl font-normal">Nexa is not responding yet.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          This project has no connected AI provider or server-side Nexa endpoint. No answers are simulated, and no conversation data is sent to an AI service.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Provider setup must happen on the server with a private key before Nexa can answer questions. Any action that changes work will require your confirmation.
        </p>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-semibold">Planned capabilities</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {plannedCapabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <Circle className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button asChild variant="outline" className="mt-8">
          <Link to="/app">Return to Huddle <ArrowRight /></Link>
        </Button>
      </section>
    </div>
  );
}
