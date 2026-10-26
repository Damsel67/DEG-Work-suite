import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./client";

export type AccountType = "freelancer" | "company" | "school";
export type Workspace = { id: string; name: string; organization_id?: string | null };
export type OrganizationSummary = {
  id: string;
  name: string;
  account_type: AccountType;
  role: "owner" | "administrator" | "manager" | "employee";
};
type WorkspaceContextValue = {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  organization: OrganizationSummary | null;
  profileName: string | null;
  enabledApps: string[];
  selectWorkspace: (workspaceId: string) => void;
  loading: boolean;
  loadingStage: "auth" | "workspace";
  loadError: string | null;
  recoveryMode: boolean;
  clearRecoveryMode: () => void;
  refresh: () => Promise<void>;
};

const MVP_APPS = ["huddle", "orbit"];

function isMissingOnboardingSchema(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "42P01" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    /schema cache|does not exist|could not find the table/i.test(error.message ?? "")
  );
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [enabledApps, setEnabledApps] = useState<string[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem("deg-current-workspace-id");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<"auth" | "workspace">("auth");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    return query.get("auth") === "recovery" || fragment.get("type") === "recovery";
  });
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setLoadingStage("auth");
    try {
      const {
        data: { user: activeUser },
        error: userError,
      } = await supabase.auth.getUser();
      // Supabase reports a missing session as an AuthError; that is the normal
      // signed-out state and should lead to the sign-in form, not an error page.
      if (userError && userError.name !== "AuthSessionMissingError") throw userError;
      setUser(activeUser);
      if (!activeUser) {
        setWorkspaces([]);
        setOrganization(null);
        setProfileName(null);
        setEnabledApps([]);
        return;
      }
      setLoadingStage("workspace");
      let data: Workspace[] | null = null;
      const expanded = await supabase
        .from("workspaces")
        .select("id, name, organization_id")
        .order("created_at");
      if (expanded.error && isMissingOnboardingSchema(expanded.error)) {
        const legacy = await supabase.from("workspaces").select("id, name").order("created_at");
        if (legacy.error) throw legacy.error;
        data = (legacy.data ?? []) as Workspace[];
        setOrganization(null);
        setProfileName(activeUser.user_metadata?.full_name ?? null);
        setEnabledApps(data.length ? MVP_APPS : []);
      } else {
        if (expanded.error) throw expanded.error;
        data = (expanded.data ?? []) as Workspace[];
        const activeWorkspace = data.find((item) => item.id === selectedWorkspaceId) ?? data[0];
        if (activeWorkspace?.organization_id) {
          const [orgResult, memberResult, profileResult, orgAppsResult, memberAppsResult] =
            await Promise.all([
              supabase
                .from("organizations")
                .select("id, name, account_type")
                .eq("id", activeWorkspace.organization_id)
                .maybeSingle(),
              supabase
                .from("organization_members")
                .select("role")
                .eq("organization_id", activeWorkspace.organization_id)
                .eq("user_id", activeUser.id)
                .maybeSingle(),
              supabase
                .from("user_profiles")
                .select("full_name")
                .eq("user_id", activeUser.id)
                .maybeSingle(),
              supabase
                .from("organization_apps")
                .select("app_key, enabled")
                .eq("organization_id", activeWorkspace.organization_id),
              supabase
                .from("organization_member_apps")
                .select("app_key, enabled")
                .eq("organization_id", activeWorkspace.organization_id)
                .eq("user_id", activeUser.id),
            ]);
          const optionalResults = [
            orgResult,
            memberResult,
            profileResult,
            orgAppsResult,
            memberAppsResult,
          ];
          const missingOptionalSchema = optionalResults.find(
            (result) => result.error && isMissingOnboardingSchema(result.error),
          );
          if (missingOptionalSchema) {
            setOrganization(null);
            setProfileName(activeUser.user_metadata?.full_name ?? null);
            setEnabledApps(MVP_APPS);
          } else {
            for (const result of optionalResults) if (result.error) throw result.error;
            const org = orgResult.data;
            const membership = memberResult.data;
            if (!org || !membership) {
              setOrganization(null);
              setProfileName(profileResult.data?.full_name ?? null);
              setEnabledApps([]);
            } else {
              setOrganization({ ...org, role: membership.role } as OrganizationSummary);
              setProfileName(
                profileResult.data?.full_name ?? activeUser.user_metadata?.full_name ?? null,
              );
              const organizationAppRows = (orgAppsResult.data ?? []) as {
                app_key: string;
                enabled: boolean;
              }[];
              const memberAppRows = (memberAppsResult.data ?? []) as {
                app_key: string;
                enabled: boolean;
              }[];
              const orgEnabled = new Set<string>(
                organizationAppRows.filter((item) => item.enabled).map((item) => item.app_key),
              );
              const memberOverrides = new Map<string, boolean>(
                memberAppRows.map((item) => [item.app_key, item.enabled]),
              );
              setEnabledApps(
                [...orgEnabled].filter((appKey) => memberOverrides.get(appKey) !== false),
              );
            }
          }
        } else {
          setOrganization(null);
          setProfileName(activeUser.user_metadata?.full_name ?? null);
          setEnabledApps(data.length ? MVP_APPS : []);
        }
      }
      setWorkspaces(data ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load your workspace.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedWorkspaceId]);

  useEffect(() => {
    let mounted = true;
    void refresh().catch((error: unknown) => {
      if (mounted) {
        console.error("Unable to load your DEG WorkSuite workspace.", error);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
      if (event === "SIGNED_OUT") setRecoveryMode(false);
      window.setTimeout(() => {
        void refresh().catch((error: unknown) =>
          console.error("Unable to refresh workspace access.", error),
        );
      }, 0);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refresh, supabase]);

  const selectWorkspace = useCallback((workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    try {
      window.localStorage.setItem("deg-current-workspace-id", workspaceId);
    } catch {
      // Workspace selection remains available for this session if storage is disabled.
    }
  }, []);

  const workspace =
    workspaces.find((item) => item.id === selectedWorkspaceId) ?? workspaces[0] ?? null;
  const value = useMemo(
    () => ({
      user,
      workspace,
      workspaces,
      organization,
      profileName,
      enabledApps,
      selectWorkspace,
      loading,
      loadingStage,
      loadError,
      recoveryMode,
      clearRecoveryMode: () => setRecoveryMode(false),
      refresh,
    }),
    [
      user,
      workspace,
      workspaces,
      organization,
      profileName,
      enabledApps,
      selectWorkspace,
      loading,
      loadingStage,
      loadError,
      recoveryMode,
      refresh,
    ],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}
