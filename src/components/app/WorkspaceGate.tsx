import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, RotateCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { useLocation } from "@tanstack/react-router";
import { getPostAuthenticationPath } from "@/lib/auth-routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthResidence, IntelligenceLoading } from "@/components/app/AuthResidence";
import { toast } from "sonner";

type AuthMode = "signin" | "signup" | "recovery" | "update-password";
type AccountType = "freelancer" | "company" | "school";
type OnboardingDraft = {
  accountType: AccountType;
  fullName: string;
  country: string;
  workspaceName: string;
  organizationName: string;
  industry: string;
  companySize: string;
  website: string;
  companyDomain: string;
  institutionType: string;
  enabledApps: string[];
};

const ONBOARDING_DRAFT_KEY = "deg-onboarding-draft-v1";
const emptyDraft: OnboardingDraft = {
  accountType: "freelancer",
  fullName: "",
  country: "",
  workspaceName: "",
  organizationName: "",
  industry: "",
  companySize: "",
  website: "",
  companyDomain: "",
  institutionType: "",
  enabledApps: ["huddle", "orbit"],
};

function readOnboardingDraft(): OnboardingDraft {
  if (typeof window === "undefined") return emptyDraft;
  try {
    const saved = JSON.parse(window.localStorage.getItem(ONBOARDING_DRAFT_KEY) ?? "null");
    return saved && typeof saved === "object" ? { ...emptyDraft, ...saved } : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

function getRecoveryLinkError() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.hash.slice(1));
  const description = params.get("error_description");
  if (!description) return "";
  return `This reset link could not be verified: ${description}. Request a new password reset link and open it promptly.`;
}

function clearRecoveryUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", window.location.pathname);
}

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const {
    user,
    workspace,
    enabledApps,
    selectWorkspace,
    loading,
    loadingStage,
    loadError,
    recoveryMode,
    clearRecoveryMode,
    refresh,
  } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [onboarding, setOnboarding] = useState<OnboardingDraft>(readOnboardingDraft);
  const [workspaceSetupMode, setWorkspaceSetupMode] = useState<"create" | "join">("create");
  const [invitationCode, setInvitationCode] = useState("");
  const [mode, setMode] = useState<AuthMode>(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("auth") === "signup"
      ? "signup"
      : "signin",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(getRecoveryLinkError);
  const [notice, setNotice] = useState("");
  const supabase = createSupabaseBrowserClient();
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(onboarding));
    } catch {
      // The current form remains usable if browser storage is disabled.
    }
  }, [onboarding]);

  useEffect(() => {
    if (!user || workspace) return;
    let cancelled = false;
    void (async () => {
      const result = await supabase
        .from("onboarding_drafts")
        .select("draft")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || result.error || !result.data?.draft || typeof result.data.draft !== "object")
        return;
      const serverDraft = result.data.draft as Partial<OnboardingDraft>;
      setOnboarding((current) => ({ ...current, ...serverDraft }));
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, user, workspace]);

  useEffect(() => {
    if (!user || workspace) return;
    const timer = window.setTimeout(() => {
      void supabase
        .from("onboarding_drafts")
        .upsert(
          { user_id: user.id, draft: onboarding, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [onboarding, supabase, user, workspace]);

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "recovery") {
        const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/app/dashboard?auth=recovery`,
        });
        if (recoveryError) throw recoveryError;
        setNotice("If an account exists for this email, a password reset link is on its way.");
      } else if (mode === "update-password" || recoveryMode) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        clearRecoveryMode();
        clearRecoveryUrl();
        setPassword("");
        setNotice("Your password has been updated. Your workspace is ready.");
        await refresh();
      } else {
        const result =
          mode === "signin"
            ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
            : await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                  emailRedirectTo: `${window.location.origin}${getPostAuthenticationPath(window.location.pathname, window.location.search)}`,
                  data: { full_name: onboarding.fullName.trim() },
                },
              });
        if (result.error) throw result.error;
        if (mode === "signup" && !result.data.session) {
          setMode("signin");
          setPassword("");
          setNotice(
            "Check your email to confirm your account. Your setup details are saved in this browser; sign in here after confirming to finish creating your workspace.",
          );
        } else if (mode === "signin") {
          await refresh();
          window.location.replace(
            getPostAuthenticationPath(window.location.pathname, window.location.search),
          );
        } else {
          await refresh();
        }
      }
    } catch (authError) {
      const authErrorMessage = authError instanceof Error ? authError.message : "";
      if (mode === "signin" && /invalid login credentials/i.test(authErrorMessage)) {
        setError("Incorrect email or password. Please try again or reset your password.");
      } else if (mode === "signup" && /already registered/i.test(authErrorMessage)) {
        setMode("signin");
        setPassword("");
        setNotice("An account may already exist with this email. Sign in or reset your password.");
      } else {
        setError(authErrorMessage || "We couldn't complete that request. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function completeOnboarding(event: FormEvent) {
    event.preventDefault();
    if (onboarding.enabledApps.length === 0) {
      setError("Choose at least one application to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error: workspaceError } = await supabase.rpc("complete_deg_onboarding", {
        account_type: onboarding.accountType,
        full_name: onboarding.fullName.trim(),
        country: onboarding.country.trim(),
        workspace_name: onboarding.workspaceName.trim(),
        organization_name: onboarding.organizationName.trim(),
        industry: onboarding.industry.trim() || null,
        company_size: onboarding.companySize || null,
        website: onboarding.website.trim() || null,
        company_domain: onboarding.companyDomain.trim() || null,
        institution_type: onboarding.institutionType || null,
        enabled_apps: onboarding.enabledApps,
      });
      if (workspaceError) throw workspaceError;
      try {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch {
        // A completed profile remains saved in Supabase if local storage is unavailable.
      }
      await supabase
        .from("onboarding_drafts")
        .delete()
        .eq("user_id", user?.id ?? "");
      await refresh();
      toast.success("Your DEG WorkSuite workspace is ready");
      window.location.replace("/app/dashboard");
    } catch (workspaceError) {
      setError(
        workspaceError instanceof Error
          ? workspaceError.message
          : "Unable to finish account setup. Check that the local onboarding migration has been applied to a development database.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function acceptInvitation(event: FormEvent) {
    event.preventDefault();
    const code = invitationCode.trim();
    if (!/^[0-9a-f-]{36}$/i.test(code)) {
      setError("Enter the invitation code provided by your organisation administrator.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data: workspaceId, error: invitationError } = await supabase.rpc(
        "accept_deg_invitation",
        { invite_code: code },
      );
      if (invitationError) throw invitationError;
      if (typeof workspaceId !== "string")
        throw new Error("The invitation did not return a workspace.");
      try {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      } catch {
        // Invitation acceptance is persisted by Supabase.
      }
      selectWorkspace(workspaceId);
      await refresh();
      window.location.replace("/app/dashboard");
    } catch (invitationError) {
      setError(
        invitationError instanceof Error
          ? invitationError.message
          : "Unable to accept the invitation. Check the code and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <IntelligenceLoading />;

  if (loadError) {
    return (
      <AuthResidence>
        <p className="eyebrow">Connection needs attention</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          We couldn’t prepare your workspace.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{loadError}</p>
        <Button className="mt-7 h-12 px-5" onClick={() => void refresh().catch(() => undefined)}>
          <RotateCw /> Try again
        </Button>
      </AuthResidence>
    );
  }

  if (!user || recoveryMode) {
    const recovery = mode === "recovery";
    const updatingPassword = mode === "update-password" || recoveryMode;
    const signingUp = mode === "signup";
    const title = recovery
      ? "Reset password"
      : updatingPassword
        ? "Choose a new password"
        : signingUp
          ? "Create account"
          : "Sign in";

    return (
      <AuthResidence>
        <h2 className="font-display text-3xl font-normal leading-tight tracking-[-0.035em] text-foreground sm:text-[2.65rem]">
          {title}
        </h2>

        <form onSubmit={authenticate} className="mt-8 space-y-5">
          {signingUp && (
            <>
              <div className="space-y-2">
                <label htmlFor="signup-name" className="text-sm font-semibold text-foreground">
                  Full name
                </label>
                <Input
                  id="signup-name"
                  required
                  maxLength={160}
                  autoComplete="name"
                  value={onboarding.fullName}
                  onChange={(event) =>
                    setOnboarding({ ...onboarding, fullName: event.target.value })
                  }
                  placeholder="Your full name"
                  className="h-12 rounded-lg border-border bg-raised px-4 text-sm"
                />
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-foreground">
                  Choose your account type
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(
                    [
                      ["freelancer", "Freelancer"],
                      ["company", "Company"],
                      ["school", "School / Educational Organisation"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${onboarding.accountType === value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}
                    >
                      <input
                        type="radio"
                        name="account-type"
                        value={value}
                        checked={onboarding.accountType === value}
                        onChange={() =>
                          setOnboarding({
                            ...onboarding,
                            accountType: value,
                            enabledApps:
                              value === "freelancer"
                                ? onboarding.enabledApps.filter((app) => app !== "people")
                                : onboarding.enabledApps,
                          })
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <OnboardingFields
                onboarding={onboarding}
                setOnboarding={setOnboarding}
                includeApps={false}
              />
            </>
          )}
          {!updatingPassword && (
            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-sm font-semibold text-foreground">
                Email address
              </label>
              <Input
                id="auth-email"
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-lg border-border bg-raised px-4 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>
          )}

          {!recovery && (
            <div className="space-y-2">
              <label htmlFor="auth-password" className="text-sm font-semibold text-foreground">
                {updatingPassword ? "New password" : "Password"}
              </label>
              <div className="relative">
                <Input
                  id="auth-password"
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  autoComplete={updatingPassword || signingUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    updatingPassword || signingUp ? "At least 8 characters" : "Enter your password"
                  }
                  className="h-12 rounded-lg border-border bg-raised px-4 pr-12 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-5 text-foreground"
            >
              {notice}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full justify-between rounded-lg px-5 text-sm shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              {busy && <LoaderCircle className="animate-spin" />}
              {busy
                ? "Please wait"
                : recovery
                  ? "Send reset link"
                  : updatingPassword
                    ? "Update password"
                    : signingUp
                      ? "Create account"
                      : "Sign in"}
            </span>
            {!busy && <ArrowRight className="size-4" />}
          </Button>
        </form>

        {!recovery && !updatingPassword && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("recovery");
                  setError("");
                  setNotice("");
                }}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Forgot password?
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                setMode(signingUp ? "signin" : "signup");
                setError("");
                setNotice("");
              }}
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              {signingUp ? "I already have an account" : "Create an account"}
            </button>
          </div>
        )}
        {(recovery || updatingPassword) && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              clearRecoveryMode();
              clearRecoveryUrl();
              setError("");
              setNotice("");
            }}
            className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Return to sign in
          </button>
        )}
      </AuthResidence>
    );
  }

  if (!workspace) {
    return (
      <AuthResidence>
        <p className="eyebrow">Your DEG WorkSuite account</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">
          {workspaceSetupMode === "create" ? "Set up your workspace." : "Join your organisation."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {workspaceSetupMode === "create"
            ? "Your details are saved to your account. You can create a new workspace or join an existing organisation with an invitation code."
            : "Use the secure invitation code from your organisation administrator. Your account email must match the invitation and be confirmed."}
        </p>
        <div
          className="mt-5 flex rounded-lg border border-border p-1"
          role="group"
          aria-label="Workspace setup option"
        >
          <button
            type="button"
            onClick={() => {
              setWorkspaceSetupMode("create");
              setError("");
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${workspaceSetupMode === "create" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Create workspace
          </button>
          <button
            type="button"
            onClick={() => {
              setWorkspaceSetupMode("join");
              setError("");
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${workspaceSetupMode === "join" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Join with code
          </button>
        </div>
        {workspaceSetupMode === "join" ? (
          <form onSubmit={acceptInvitation} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="organization-invitation-code" className="text-sm font-semibold">
                Invitation code
              </label>
              <Input
                id="organization-invitation-code"
                required
                value={invitationCode}
                onChange={(event) => setInvitationCode(event.target.value)}
                placeholder="Paste the 36-character code"
                autoComplete="off"
                className="h-12 rounded-lg border-border bg-raised px-4 font-mono text-sm"
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="h-12 w-full justify-between rounded-lg px-5"
            >
              {busy ? "Joining organisation…" : "Accept invitation"}
              <ArrowRight />
            </Button>
          </form>
        ) : (
          <form
            onSubmit={completeOnboarding}
            className="mt-8 max-h-[68vh] space-y-4 overflow-y-auto pr-1"
          >
            <OnboardingFields onboarding={onboarding} setOnboarding={setOnboarding} includeApps />
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="h-12 w-full justify-between rounded-lg px-5"
            >
              {busy ? "Saving your workspace…" : "Finish setup"}
              <ArrowRight />
            </Button>
          </form>
        )}
        <button
          type="button"
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Sign out
        </button>
      </AuthResidence>
    );
  }

  const requiredApp =
    pathname === "/app/dashboard" ||
    pathname === "/app/settings" ||
    pathname === "/app/getting-started" ||
    pathname === "/app/moments"
      ? null
      : pathname === "/app" ||
          pathname === "/app/" ||
          pathname.startsWith("/app/huddle/") ||
          pathname === "/app/messages"
        ? "huddle"
        : pathname.startsWith("/app/projects") || pathname.startsWith("/app/tasks")
          ? "orbit"
          : pathname.startsWith("/app/people")
            ? "people"
            : pathname.startsWith("/app/nexa") ||
                pathname.startsWith("/app/command") ||
                pathname.startsWith("/app/documents") ||
                pathname.startsWith("/app/relations") ||
                pathname.startsWith("/app/support") ||
                pathname.startsWith("/app/finance") ||
                pathname.startsWith("/app/automations") ||
                pathname.startsWith("/app/insights") ||
                pathname.startsWith("/app/suite/")
              ? null
              : pathname.startsWith("/app/")
                ? "unavailable"
                : null;
  if (requiredApp && (requiredApp === "unavailable" || !enabledApps.includes(requiredApp))) {
    return (
      <AuthResidence>
        <p className="eyebrow">Application access</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">
          {requiredApp === "unavailable"
            ? "This application isn’t available yet."
            : "This app isn’t enabled for your account."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {requiredApp === "unavailable"
            ? "This route is not yet a working DEG application. It is hidden from your app launcher until implemented."
            : "Ask your DEG WorkSuite owner or administrator to enable access. Your workspace and other authorised apps remain available."}
        </p>
        <Button className="mt-7 h-12 px-5" onClick={() => window.location.assign("/app/dashboard")}>
          Go to DEG WorkSuite
        </Button>
      </AuthResidence>
    );
  }

  return <>{children}</>;
}

function OnboardingFields({
  onboarding,
  setOnboarding,
  includeApps,
}: {
  onboarding: OnboardingDraft;
  setOnboarding: (draft: OnboardingDraft) => void;
  includeApps: boolean;
}) {
  const fieldClass = "h-12 rounded-lg border-border bg-raised px-4 text-sm";
  const set = <Key extends keyof OnboardingDraft>(key: Key, value: OnboardingDraft[Key]) =>
    setOnboarding({ ...onboarding, [key]: value });
  const availableApps = [
    {
      app: "huddle",
      name: "Huddle",
      description: "Workspace home, conversations and collaboration setup",
    },
    { app: "orbit", name: "Orbit", description: "Projects and tasks" },
  ];
  if (onboarding.accountType !== "freelancer") {
    availableApps.push({
      app: "people",
      name: "People",
      description: "Organisation directory; invitation and access editing are not connected yet",
    });
  }
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="signup-country" className="text-sm font-semibold text-foreground">
          Country
        </label>
        <Input
          id="signup-country"
          required
          maxLength={100}
          autoComplete="country-name"
          value={onboarding.country}
          onChange={(event) => set("country", event.target.value)}
          placeholder="Country or territory"
          className={fieldClass}
        />
      </div>
      {onboarding.accountType !== "freelancer" && (
        <div className="space-y-2">
          <label htmlFor="signup-organization" className="text-sm font-semibold text-foreground">
            {onboarding.accountType === "company" ? "Company name" : "Institution name"}
          </label>
          <Input
            id="signup-organization"
            required
            maxLength={160}
            value={onboarding.organizationName}
            onChange={(event) => set("organizationName", event.target.value)}
            placeholder={
              onboarding.accountType === "company"
                ? "Company or business name"
                : "School or institution name"
            }
            className={fieldClass}
          />
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="signup-workspace" className="text-sm font-semibold text-foreground">
          Workspace name
        </label>
        <Input
          id="signup-workspace"
          required
          maxLength={100}
          value={onboarding.workspaceName}
          onChange={(event) => set("workspaceName", event.target.value)}
          placeholder={
            onboarding.accountType === "freelancer" ? "e.g. Jordan’s Studio" : "e.g. Acme Team"
          }
          className={fieldClass}
        />
      </div>
      {onboarding.accountType === "company" && (
        <>
          <div className="space-y-2">
            <label htmlFor="signup-industry" className="text-sm font-semibold text-foreground">
              Industry
            </label>
            <Input
              id="signup-industry"
              required
              maxLength={120}
              value={onboarding.industry}
              onChange={(event) => set("industry", event.target.value)}
              placeholder="e.g. Design, education, consulting"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-company-size" className="text-sm font-semibold text-foreground">
              Company size
            </label>
            <select
              id="signup-company-size"
              required
              value={onboarding.companySize}
              onChange={(event) => set("companySize", event.target.value)}
              className={`w-full ${fieldClass}`}
            >
              <option value="">Select company size</option>
              <option value="1">Just me</option>
              <option value="2-10">2–10 people</option>
              <option value="11-50">11–50 people</option>
              <option value="51-200">51–200 people</option>
              <option value="201+">201+ people</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-website" className="text-sm font-semibold text-foreground">
              Website <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="signup-website"
              type="url"
              maxLength={300}
              value={onboarding.website}
              onChange={(event) => set("website", event.target.value)}
              placeholder="https://example.com"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-domain" className="text-sm font-semibold text-foreground">
              Company domain <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="signup-domain"
              maxLength={255}
              value={onboarding.companyDomain}
              onChange={(event) => set("companyDomain", event.target.value)}
              placeholder="example.com"
              className={fieldClass}
            />
            <p className="text-xs text-muted-foreground">
              A company email domain is not required to register or invite employees.
            </p>
          </div>
        </>
      )}
      {onboarding.accountType === "school" && (
        <div className="space-y-2">
          <label
            htmlFor="signup-institution-type"
            className="text-sm font-semibold text-foreground"
          >
            Institution type
          </label>
          <select
            id="signup-institution-type"
            required
            value={onboarding.institutionType}
            onChange={(event) => set("institutionType", event.target.value)}
            className={`w-full ${fieldClass}`}
          >
            <option value="">Select institution type</option>
            <option value="primary">Primary school</option>
            <option value="secondary">Secondary school</option>
            <option value="higher-education">Higher education</option>
            <option value="training">Training organisation</option>
            <option value="other">Other educational organisation</option>
          </select>
        </div>
      )}
      {includeApps && (
        <fieldset className="space-y-2 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-semibold">Choose your initial applications</legend>
          {availableApps.map(({ app, name, description }) => (
            <label
              key={app}
              className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-accent/50"
            >
              <input
                type="checkbox"
                checked={onboarding.enabledApps.includes(app)}
                onChange={(event) =>
                  set(
                    "enabledApps",
                    event.target.checked
                      ? [...onboarding.enabledApps, app]
                      : onboarding.enabledApps.filter((item) => item !== app),
                  )
                }
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold">{name}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </span>
            </label>
          ))}
          <p className="text-xs text-muted-foreground">
            Other apps will appear after they are implemented and enabled for your workspace.
          </p>
        </fieldset>
      )}
    </>
  );
}
