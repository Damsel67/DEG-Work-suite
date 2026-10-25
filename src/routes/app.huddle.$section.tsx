import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CircleHelp } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { HUDDLE_SECTIONS } from "@/lib/huddle-sections";
import { pageHead } from "@/lib/seo";
import { RemoteWork } from "@/components/app/RemoteWork";
import { HuddleContextualWorkspace } from "@/components/app/HuddleContextualWorkspace";

export const Route = createFileRoute("/app/huddle/$section")({
  head: () => pageHead("Huddle", "Huddle collaboration"),
  component: HuddleSectionPage,
});

function HuddleSectionPage() {
  const { section } = Route.useParams();
  const selected = HUDDLE_SECTIONS.find((item) => item.key === section);

  if (!selected) {
    return (
      <div className="space-y-6">
        <PageHeader module="huddle" title="Huddle" description="That section is not available." />
        <Button asChild variant="outline">
          <Link to="/app">
            <ArrowLeft /> Huddle home
          </Link>
        </Button>
      </div>
    );
  }

  if (selected.key === "availability") return <RemoteWork />;

  if (
    ["chats", "channels", "contacts", "history", "meetings", "files", "calendar"].includes(
      selected.key,
    )
  ) {
    return (
      <HuddleContextualWorkspace
        key={selected.key}
        section={
          selected.key === "meetings"
            ? "history"
            : (selected.key as "chats" | "channels" | "contacts" | "history" | "files" | "calendar")
        }
        initialView={selected.key === "meetings" ? "meetings" : undefined}
      />
    );
  }

  const Icon = selected.icon;
  return (
    <div className="space-y-8">
      <PageHeader module="huddle" title={selected.label} description="Huddle collaboration" />
      <section className="surface max-w-3xl p-6 md:p-8" aria-labelledby="huddle-setup-title">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-olive">
          Setup needed
        </p>
        <h2 id="huddle-setup-title" className="mt-2 font-display text-2xl font-normal">
          {selected.label} is not connected yet.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{selected.setup}</p>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          This view does not show sample people, messages, calls, files, or activity as real
          workspace data.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/app">
            <ArrowLeft /> Huddle home
          </Link>
        </Button>
      </section>
    </div>
  );
}

