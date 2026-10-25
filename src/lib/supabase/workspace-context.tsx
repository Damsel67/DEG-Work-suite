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

export type Workspace = { id: string; name: string };
type WorkspaceContextValue = {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  selectWorkspace: (workspaceId: string) => void;
  loading: boolean;
  loadingStage: "auth" | "workspace";
  loadError: string | null;
  recoveryMode: boolean;
  clearRecoveryMode: () => void;
  refresh: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
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
        return;
      }
      setLoadingStage("workspace");
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name")
        .order("created_at");
      if (error) throw error;
      setWorkspaces(data ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load your workspace.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

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

  const workspace = workspaces.find((item) => item.id === selectedWorkspaceId) ?? workspaces[0] ?? null;
  const value = useMemo(
    () => ({
      user,
      workspace,
      workspaces,
      selectWorkspace,
      loading,
      loadingStage,
      loadError,
      recoveryMode,
      clearRecoveryMode: () => setRecoveryMode(false),
      refresh,
    }),
    [user, workspace, workspaces, selectWorkspace, loading, loadingStage, loadError, recoveryMode, refresh],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}

