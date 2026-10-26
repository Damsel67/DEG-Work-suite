import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { cn } from "@/lib/utils";
import { WorkspaceProvider } from "@/lib/supabase/workspace-context";
import { WorkspaceGate } from "@/components/app/WorkspaceGate";
import { WorkspacePortalLayout } from "@/components/app/WorkspacePortal";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  // DEG Moments uses the Modern Art Residence expression; the rest of the app is Botanical Estate.
  const moments = pathname.startsWith("/app/moments");
  const contextualHuddle =
    /^\/app\/huddle\/(chats|channels|contacts|history|meetings|files|calendar)$/.test(pathname);
  const workspacePortal =
    pathname === "/app/dashboard" ||
    /^\/app\/(projects|tasks|people|settings|getting-started|suite)(\/|$)/.test(pathname);

  return (
    <WorkspaceProvider>
      <WorkspaceGate>
        {workspacePortal ? (
          <WorkspacePortalLayout>
            <Outlet />
          </WorkspacePortalLayout>
        ) : (
          <SidebarProvider style={{ "--sidebar-width": "12.25rem" } as React.CSSProperties}>
            <AppSidebar />
            <SidebarInset className={cn("bg-background text-foreground", moments && "moments")}>
              <AppTopbar />
              <div
                className={cn(
                  "mx-auto w-full max-w-7xl flex-1",
                  contextualHuddle ? "flex min-h-0 max-w-none" : "px-4 py-8 md:px-8 md:py-10",
                )}
              >
                <Outlet />
              </div>
            </SidebarInset>
          </SidebarProvider>
        )}
      </WorkspaceGate>
    </WorkspaceProvider>
  );
}
