import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Search, UserPlus, UserRound, UsersRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/ui";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/people")({
  head: () => pageHead("People", "Organisation members and application access."),
  component: PeoplePage,
});

type Membership = {
  user_id: string;
  employee_id: string | null;
  role: string;
  department: string | null;
  job_title: string | null;
  employment_status: string;
};
type Profile = { user_id: string; full_name: string; login_email: string | null };
type Invitation = {
  id: string;
  email: string;
  full_name: string;
  role: "manager" | "employee";
  department: string | null;
  job_title: string | null;
  app_keys: string[];
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
};

function PeoplePage() {
  const { organization } = useWorkspace();
  const [members, setMembers] = useState<Membership[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [apps, setApps] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [invite, setInvite] = useState({
    fullName: "",
    email: "",
    department: "",
    jobTitle: "",
    role: "employee" as "manager" | "employee",
    appKeys: ["huddle", "orbit"],
  });
  const supabase = createSupabaseBrowserClient();

  const load = useCallback(async () => {
    if (!organization) {
      setMembers([]);
      setProfiles([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: membershipRows, error: memberError } = await supabase
        .from("organization_members")
        .select("user_id, employee_id, role, department, job_title, employment_status")
        .eq("organization_id", organization.id)
        .order("joined_at");
      if (memberError) throw memberError;
      const rows = (membershipRows ?? []) as Membership[];
      setMembers(rows);
      if (!rows.length) {
        setProfiles([]);
        return;
      }
      const { data: profileRows, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, full_name, login_email")
        .in(
          "user_id",
          rows.map((row) => row.user_id),
        );
      if (profileError) throw profileError;
      setProfiles((profileRows ?? []) as Profile[]);
      if (organization.role === "owner" || organization.role === "administrator") {
        const [{ data: inviteRows, error: inviteError }, { data: appRows, error: appsError }] =
          await Promise.all([
            supabase
              .from("organization_invitations")
              .select(
                "id, email, full_name, role, department, job_title, app_keys, status, expires_at",
              )
              .eq("organization_id", organization.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("organization_apps")
              .select("app_key")
              .eq("organization_id", organization.id)
              .eq("enabled", true),
          ]);
        if (inviteError) throw inviteError;
        if (appsError) throw appsError;
        setInvitations((inviteRows ?? []) as Invitation[]);
        const enabled = ((appRows ?? []) as { app_key: string }[]).map((row) => row.app_key);
        setApps(enabled);
        setInvite((current) => ({
          ...current,
          appKeys: current.appKeys.filter((key) => enabled.includes(key)).length
            ? current.appKeys.filter((key) => enabled.includes(key))
            : enabled,
        }));
      } else {
        setInvitations([]);
        setApps([]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The organisation directory could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [organization, supabase]);

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization || !invite.appKeys.length) {
      setInviteError("Enable at least one application and select an app for the invite.");
      return;
    }
    setInviteBusy(true);
    setInviteError("");
    setInviteCode("");
    try {
      const { data, error: rpcError } = await supabase.rpc("create_deg_invitation", {
        invite_organization_id: organization.id,
        invite_email: invite.email.trim(),
        invite_full_name: invite.fullName.trim(),
        invite_department: invite.department.trim() || null,
        invite_job_title: invite.jobTitle.trim() || null,
        invite_role: invite.role,
        invite_app_keys: invite.appKeys,
      });
      if (rpcError) throw rpcError;
      const result = (Array.isArray(data) ? data[0] : data) as { invitation_code?: string } | null;
      if (!result?.invitation_code)
        throw new Error("The server did not return an invitation code.");
      setInviteCode(result.invitation_code);
      await load();
    } catch (createError) {
      setInviteError(
        createError instanceof Error ? createError.message : "The invitation could not be created.",
      );
    } finally {
      setInviteBusy(false);
    }
  }

  async function revokeInvitation(id: string) {
    setInviteError("");
    try {
      const { error: revokeError } = await supabase.rpc("revoke_deg_invitation", {
        invitation_id: id,
      });
      if (revokeError) throw revokeError;
      await load();
    } catch (revokeError) {
      setInviteError(
        revokeError instanceof Error ? revokeError.message : "Could not revoke this invitation.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  const visibleMembers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return members
      .map((member) => ({
        member,
        profile: profiles.find((profile) => profile.user_id === member.user_id),
      }))
      .filter(({ member, profile }) => {
        if (!needle) return true;
        return [
          profile?.full_name,
          profile?.login_email,
          member.employee_id,
          member.department,
          member.job_title,
          member.role,
        ].some((value) => value?.toLocaleLowerCase().includes(needle));
      });
  }, [members, profiles, query]);

  return (
    <div className="space-y-7">
      <PageHeader
        module="people"
        title="People"
        description={organization ? `${organization.name} directory` : "Organisation directory"}
      />

      {!organization ? (
        <section className="surface flex min-h-52 flex-col items-center justify-center p-8 text-center">
          <UsersRound className="size-7 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Organisation directory is unavailable</h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Create or join an organisation workspace to see its real members here.
          </p>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading members…"
                  : `${members.length} ${members.length === 1 ? "member" : "members"}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Names, login emails, roles, and employee IDs come from your organisation records. No
                sample people are shown.
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people"
                aria-label="Search organisation members"
                className="pl-9"
              />
            </div>
            {(organization.role === "owner" || organization.role === "administrator") && (
              <Button
                onClick={() => {
                  setInviteOpen((open) => !open);
                  setInviteError("");
                }}
                className="gap-2"
              >
                {inviteOpen ? <X /> : <UserPlus />}
                {inviteOpen ? "Close invite form" : "Invite employee"}
              </Button>
            )}
          </div>

          {inviteOpen &&
            (organization.role === "owner" || organization.role === "administrator") && (
              <section className="surface space-y-4 p-5" aria-labelledby="invite-heading">
                <div>
                  <h2 id="invite-heading" className="font-display text-xl">
                    Invite a coworker
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Creates a secure, expiring invitation. No email provider is connected, so the
                    code must be shared with the invitee manually.
                  </p>
                </div>
                <form onSubmit={createInvitation} className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium">
                    Full name
                    <Input
                      required
                      maxLength={160}
                      value={invite.fullName}
                      onChange={(event) => setInvite({ ...invite, fullName: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Login email
                    <Input
                      required
                      type="email"
                      maxLength={320}
                      value={invite.email}
                      onChange={(event) => setInvite({ ...invite, email: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Department
                    <Input
                      maxLength={120}
                      value={invite.department}
                      onChange={(event) => setInvite({ ...invite, department: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Job title
                    <Input
                      maxLength={120}
                      value={invite.jobTitle}
                      onChange={(event) => setInvite({ ...invite, jobTitle: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Role
                    <select
                      value={invite.role}
                      onChange={(event) =>
                        setInvite({ ...invite, role: event.target.value as "manager" | "employee" })
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </label>
                  <fieldset className="space-y-2 text-sm sm:col-span-2">
                    <legend className="font-medium">Application access</legend>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {apps.map((app) => (
                        <label key={app} className="flex items-center gap-2 capitalize">
                          <input
                            type="checkbox"
                            checked={invite.appKeys.includes(app)}
                            onChange={(event) =>
                              setInvite({
                                ...invite,
                                appKeys: event.target.checked
                                  ? [...invite.appKeys, app]
                                  : invite.appKeys.filter((key) => key !== app),
                              })
                            }
                          />
                          {app}
                        </label>
                      ))}
                    </div>
                    {apps.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No applications are enabled for this organisation.
                      </p>
                    )}
                  </fieldset>
                  {inviteError && (
                    <p role="alert" className="text-sm text-destructive sm:col-span-2">
                      {inviteError}
                    </p>
                  )}
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={inviteBusy || !apps.length}>
                      {inviteBusy ? "Creating invitation…" : "Create invitation"}
                    </Button>
                  </div>
                </form>
                {inviteCode && (
                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <p className="text-sm font-semibold">Share this invitation code privately</p>
                    <p className="mt-1 break-all font-mono text-sm">{inviteCode}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The invitee must sign in or create an account with {invite.email} and confirm
                      that email. This code expires in seven days. It is shown only once here.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => void navigator.clipboard.writeText(inviteCode)}
                    >
                      <Copy />
                      Copy code
                    </Button>
                  </div>
                )}
                {invitations.some((row) => row.status === "pending") && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Pending invitations</h3>
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {invitations
                        .filter((row) => row.status === "pending")
                        .map((row) => (
                          <li
                            key={row.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm"
                          >
                            <span>
                              <strong>{row.full_name}</strong> · {row.email}
                              <span className="ml-2 text-xs text-muted-foreground">
                                Expires {new Date(row.expires_at).toLocaleDateString()}
                              </span>
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void revokeInvitation(row.id)}
                            >
                              Revoke
                            </Button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

          {error ? (
            <section className="surface flex min-h-48 flex-col items-center justify-center p-8 text-center">
              <p role="alert" className="max-w-xl text-sm text-destructive">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </section>
          ) : loading ? (
            <div className="surface p-6 text-sm text-muted-foreground" role="status">
              Loading your organisation directory…
            </div>
          ) : visibleMembers.length ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(7rem,.8fr)] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground max-sm:hidden">
                <span>Person</span>
                <span>Department &amp; title</span>
                <span>Role / status</span>
              </div>
              <ul className="divide-y divide-border">
                {visibleMembers.map(({ member, profile }) => (
                  <li
                    key={member.user_id}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(7rem,.8fr)] sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {profile?.full_name ?? "Name not provided"}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {profile?.login_email ?? "Login email unavailable"}
                        </p>
                        {member.employee_id && (
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {member.employee_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{member.department || "Department not set"}</p>
                      {member.job_title && <p className="text-xs">{member.job_title}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {member.employment_status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <section className="surface flex min-h-48 flex-col items-center justify-center p-8 text-center">
              <UsersRound className="size-7 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">
                {query ? "No matching people" : "No members yet"}
              </h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                {query
                  ? "Try a different name, email, role, or department."
                  : "Members will appear here after they join this organisation."}
              </p>
            </section>
          )}
          <p className="text-xs leading-5 text-muted-foreground">
            Employee invitation creation is available to organisation owners and administrators.
            Invitation delivery remains manual until an email provider is configured; role and app
            access are validated by the backend migration.
          </p>
        </>
      )}
    </div>
  );
}
