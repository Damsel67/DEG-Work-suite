import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  // DEG Moments uses the Modern Art Residence expression; the rest of the app is Botanical Estate.
  const moments = pathname.startsWith("/app/moments");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={cn("bg-background text-foreground", moments && "moments")}>
        <AppTopbar />
        <div className="border-b border-border bg-canvas px-4 py-1.5 text-center text-xs text-muted-foreground md:px-6">
          You’re viewing a clickable prototype with sample data. Nothing is saved.
        </div>
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-10">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
