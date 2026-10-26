import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  Check,
  CirclePlay,
  FolderKanban,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/getting-started")({
  head: () =>
    pageHead("Getting Started · DEG Workspace", "A guided introduction to DEG Workspace."),
  component: GettingStartedPage,
});

function GettingStartedPage() {
  const { workspace, enabledApps, organization } = useWorkspace();
  const steps = [
    {
      title: "Your workspace is ready",
      description: workspace?.name ?? "Your private workspace is set up.",
      complete: Boolean(workspace),
      icon: Check,
      href: "/app/dashboard" as const,
      action: "View workspace",
    },
    {
      title: "Open Huddle",
      description: "Visit your team's workspace for communication and collaboration.",
      complete: false,
      icon: BookOpenText,
      href: "/app" as const,
      action: "Open Huddle",
      enabled: enabledApps.includes("huddle"),
    },
    {
      title: "Create a project",
      description: "Bring your next piece of work into one clear plan.",
      complete: false,
      icon: FolderKanban,
      href: "/app/projects" as const,
      action: "Open Projects",
      enabled: enabledApps.includes("orbit"),
    },
    {
      title: "Explore your directory",
      description: "See the real people in your organisation and their workspace roles.",
      complete: false,
      icon: UsersRound,
      href: "/app/people" as const,
      action: "Open Directory",
      enabled: enabledApps.includes("people"),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to DEG Workspace"
        description="A few quick steps will help you get comfortable with your workspace."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <section aria-labelledby="setup-heading" className="surface overflow-hidden">
          <div className="border-b border-border px-5 py-4 md:px-7">
            <h2 id="setup-heading" className="font-display text-xl">
              Your setup guide
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {organization?.name ? `${organization.name} · ` : ""}Take each step at your own pace.
            </p>
          </div>
          <ol className="divide-y divide-border">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEnabled = step.enabled !== false;
              return (
                <li key={step.title} className="flex gap-4 px-5 py-5 md:px-7">
                  <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                        STEP {String(index + 1).padStart(2, "0")}
                      </span>
                      {step.complete && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                          <Check className="size-3.5" aria-hidden="true" /> Ready
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                    {isEnabled ? (
                      <Button asChild variant="link" className="mt-2 h-auto p-0">
                        <Link to={step.href}>
                          {step.action} <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        This application is not enabled for your account.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="surface p-5 md:p-6" aria-labelledby="guides-heading">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CirclePlay className="size-5" aria-hidden="true" />
          </div>
          <h2 id="guides-heading" className="mt-4 font-display text-xl">
            Guided walkthroughs
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Video walkthroughs are not connected yet. These links take you directly to the available
            parts of your workspace.
          </p>
          <div className="mt-5 space-y-2">
            {steps
              .filter((step) => step.enabled !== false && !step.complete)
              .map((step) => (
                <Link
                  key={step.title}
                  to={step.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3 text-sm transition-colors hover:bg-accent"
                >
                  <span>{step.action}</span>
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
