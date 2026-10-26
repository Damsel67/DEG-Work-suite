import { useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Building2, UsersRound } from "lucide-react";
import { ModuleGlyph } from "@/components/app/ModuleGlyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/dashboard")({
  head: () => pageHead("DEG Workspace", "Your DEG WorkSuite app portal."),
  component: WorkSuiteDashboard,
});

function WorkSuiteDashboard() {
  const { user, workspace, organization, profileName, enabledApps, selectWorkspace } =
    useWorkspace();
  const [invitationCode, setInvitationCode] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const supabase = createSupabaseBrowserClient();

  async function joinOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteBusy(true);
    setInviteError("");
    try {
      const { data: workspaceId, error } = await supabase.rpc("accept_deg_invitation", {
        invite_code: invitationCode.trim(),
      });
      if (error) throw error;
      if (typeof workspaceId !== "string")
        throw new Error("The invitation did not return a workspace.");
      selectWorkspace(workspaceId);
      window.location.assign("/app/dashboard");
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Could not accept this invitation.");
    } finally {
      setInviteBusy(false);
    }
  }

  const apps: {
    name: string;
    description: string;
    to: "/app" | "/app/projects" | "/app/people";
    glyph: "huddle" | "projects" | "people";
    detail: string;
  }[] = [];
  if (enabledApps.includes("huddle")) {
    apps.push({
      name: "Huddle",
      description: "Open your team’s communication and collaboration workspace.",
      to: "/app",
      glyph: "huddle",
      detail: "Separate app · opens Huddle",
    });
  }
  if (enabledApps.includes("orbit")) {
    apps.push({
      name: "Projects",
      description: "Plan projects and take tasks from open to complete.",
      to: "/app/projects",
      glyph: "projects",
      detail: "Projects and tasks",
    });
  }
  if (enabledApps.includes("people")) {
    apps.push({
      name: "People",
      description: "Browse your organisation’s real member directory and assigned roles.",
      to: "/app/people",
      glyph: "people",
      detail: "Organisation directory",
    });
  }

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="workspace-welcome"
        className="relative isolate overflow-hidden rounded-2xl border border-border bg-card px-6 py-9 shadow-sm md:px-10 md:py-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 -z-10 size-72 rounded-full border-[24px] border-primary/5"
        />
        <p className="eyebrow">DEG WORKSUITE</p>
        <h1
          id="workspace-welcome"
          className="mt-3 max-w-2xl font-display text-4xl font-light md:text-5xl"
        >
          {profileName ? `Welcome, ${profileName}.` : "Your workspace starts here."}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Open the DEG applications available to you. Huddle is a separate app in your workspace
          suite.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
            <Building2 className="size-4 text-primary" aria-hidden="true" />
            <span className="font-medium">{workspace?.name ?? "Your workspace"}</span>
          </span>
          {organization && (
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs capitalize text-muted-foreground">
              {organization.role}
            </span>
          )}
        </div>
      </section>

      <section aria-labelledby="apps-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="apps-heading" className="font-display text-2xl">
              Your applications
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only apps enabled for this account are shown here.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {apps.length} {apps.length === 1 ? "app" : "apps"} available
          </span>
        </div>

        {apps.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <Link
                key={app.name}
                to={app.to}
                className="group surface flex min-h-52 flex-col p-5 transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-14 items-center justify-center rounded-xl border border-border bg-background text-primary">
                    <ModuleGlyph module={app.glyph} className="size-8" />
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{app.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{app.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-primary">
                  {app.detail} <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="surface p-6 text-sm text-muted-foreground">
            No apps are currently enabled for this account. Ask your organisation owner or
            administrator for access.
          </div>
        )}
      </section>

      <details className="rounded-xl border border-border bg-card px-5 py-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold">
          <UsersRound className="size-4 text-primary" aria-hidden="true" />
          Join another organisation
        </summary>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Have an invitation code from an organisation administrator? Enter it while signed in with
          the invited, confirmed email address.
        </p>
        <form onSubmit={joinOrganization} className="mt-3 flex flex-wrap gap-2">
          <Input
            aria-label="Organisation invitation code"
            required
            value={invitationCode}
            onChange={(event) => setInvitationCode(event.target.value)}
            placeholder="Invitation code"
            className="max-w-md"
          />
          <Button type="submit" disabled={inviteBusy}>
            {inviteBusy ? "Joining…" : "Accept invitation"}
          </Button>
        </form>
        {inviteError && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {inviteError}
          </p>
        )}
      </details>
    </div>
  );
}
