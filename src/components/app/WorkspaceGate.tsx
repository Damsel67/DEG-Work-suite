import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, RotateCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthResidence, IntelligenceLoading } from "@/components/app/AuthResidence";
import { toast } from "sonner";

type AuthMode = "signin" | "signup" | "recovery" | "update-password";

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
  const [workspaceName, setWorkspaceName] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(getRecoveryLinkError);
  const [notice, setNotice] = useState("");

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "recovery") {
        const { error: recoveryError } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/app?auth=recovery`,
        });
        if (recoveryError) throw recoveryError;
        setNotice("If an account exists for this email, a password reset link is on its way.");
      } else if (mode === "update-password" || recoveryMode) {
        const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({ password });
        if (updateError) throw updateError;
        clearRecoveryMode();
        clearRecoveryUrl();
        setPassword("");
        setNotice("Your password has been updated. Your workspace is ready.");
        await refresh();
      } else {
        const result =
          mode === "signin"
            ? await createSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password })
            : await createSupabaseBrowserClient().auth.signUp({ email: email.trim(), password });
        if (result.error) throw result.error;
        if (mode === "signup" && !result.data.session) {
          setMode("signin");
          setPassword("");
          setNotice(
            "If you already registered with this email, sign in or reset your password. Otherwise, check your email to confirm your account.",
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

  async function createWorkspace(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: workspaceError } = await createSupabaseBrowserClient().rpc("create_workspace", {
        workspace_name: workspaceName.trim(),
      });
      if (workspaceError) throw workspaceError;
      await refresh();
      toast.success("Workspace created");
    } catch (workspaceError) {
      setError(
        workspaceError instanceof Error
          ? workspaceError.message
          : "Unable to create your workspace.",
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
        <p className="eyebrow">Your private workroom</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Give your workspace a name.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Projects and tasks you create will belong to this private workspace.
        </p>
        <form onSubmit={createWorkspace} className="mt-8 space-y-4">
          <label htmlFor="workspace-name" className="text-sm font-semibold">
            Workspace name
          </label>
          <Input
            id="workspace-name"
            required
            maxLength={100}
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="e.g. Studio North"
            className="h-12 rounded-lg border-border bg-raised px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
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
            {busy ? "Creating workspace…" : "Create workspace"}
            <ArrowRight />
          </Button>
        </form>
        <button
          type="button"
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={async () => {
            await createSupabaseBrowserClient().auth.signOut();
          }}
        >
          Sign out
        </button>
      </AuthResidence>
    );
  }

  return <>{children}</>;
}

