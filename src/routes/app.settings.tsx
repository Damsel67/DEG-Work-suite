import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, CircleUserRound, KeyRound, Mail, Palette } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { useTheme } from "@/lib/theme";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => pageHead("My Settings", "Your DEG Workspace profile and account details."),
  component: SettingsPage,
});

type SettingsSection = "profile" | "account";

function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("profile");
  const { user, profileName, workspace, organization } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const displayName =
    profileName ??
    (typeof user?.user_metadata?.["full_name"] === "string"
      ? user.user_metadata["full_name"]
      : "DEG Workspace user");
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();
  const avatarUrl = user?.user_metadata?.["avatar_url"];

  return (
    <div className="space-y-7">
      <PageHeader
        title="My Settings"
        description="Manage your personal profile and account details."
      />
      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="My settings sections" className="flex gap-2 md:flex-col">
          {(
            [
              ["profile", "Profile", CircleUserRound],
              ["account", "Account", KeyRound],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              aria-current={section === key ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors md:flex-none",
                section === key
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        {section === "profile" ? (
          <section className="surface overflow-hidden" aria-labelledby="profile-heading">
            <div className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-5 md:px-7">
              <Avatar className="size-16">
                {typeof avatarUrl === "string" && avatarUrl.startsWith("https://") && (
                  <AvatarImage src={avatarUrl} alt="" />
                )}
                <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 id="profile-heading" className="font-display text-2xl">
                  Profile
                </h2>
                <p className="mt-1 truncate font-semibold">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user?.email ?? "No login email available"}
                </p>
              </div>
            </div>
            <dl className="grid gap-x-8 gap-y-5 px-5 py-6 sm:grid-cols-2 md:px-7">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Display name
                </dt>
                <dd className="mt-1 text-sm">{displayName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Login email
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  {user?.email ?? "Not available"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Workspace
                </dt>
                <dd className="mt-1 text-sm">{workspace?.name ?? "No workspace selected"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Organisation role
                </dt>
                <dd className="mt-1 text-sm capitalize">
                  {organization?.role ?? "Personal workspace"}
                </dd>
              </div>
            </dl>
            <p className="border-t border-border bg-muted/40 px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7">
              Profile details are read from your signed-in DEG account. Profile editing is not
              connected yet.
            </p>
          </section>
        ) : (
          <div className="space-y-5">
            <Panel title="Account">
              <div className="space-y-5 p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="size-4" />
                  </span>
                  <div>
                    <h2 className="font-semibold">Manage your account</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Your login is managed by the connected DEG authentication provider. Password
                      and recovery controls remain in the sign-in flow.
                    </p>
                  </div>
                </div>
                <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Login email
                    </dt>
                    <dd className="mt-1 break-all text-sm">{user?.email ?? "Not available"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Workspace
                    </dt>
                    <dd className="mt-1 text-sm">{workspace?.name ?? "No workspace selected"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Role
                    </dt>
                    <dd className="mt-1 text-sm capitalize">
                      {organization?.role ?? "Personal workspace"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Local time zone
                    </dt>
                    <dd className="mt-1 text-sm">
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </dd>
                  </div>
                </dl>
              </div>
            </Panel>
            <Panel title="Appearance">
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {(["light", "dark"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setTheme(choice)}
                    aria-pressed={theme === choice}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                      theme === choice ? "border-primary" : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Palette className="size-4" />
                    </span>
                    <span className="text-sm font-semibold">
                      {choice === "light" ? "Light · warm stone" : "Dark · dark bark"}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="Organisation">
              <div className="flex items-start gap-3 p-5">
                <BriefcaseBusiness className="mt-0.5 size-4 text-muted-foreground" />
                <p className="text-sm leading-6 text-muted-foreground">
                  {organization
                    ? `${organization.name} settings and team administration are managed through the People app according to your ${organization.role} role.`
                    : "This is a personal workspace. Organisation administration is not applicable."}
                </p>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
