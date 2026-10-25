import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BriefcaseBusiness, FolderKanban, Settings, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModuleGlyph } from "@/components/app/ModuleGlyph";
import { HUDDLE_SECTIONS } from "@/lib/huddle-sections";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type SavedPulse = { status?: string; expiresAt?: number | null; checkedInAt?: number | null };

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user, workspace } = useWorkspace();
  const [huddleMuted, setHuddleMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("deg-huddle-muted") === "true";
    } catch {
      return false;
    }
  });
  const [pulseOnline, setPulseOnline] = useState(true);
  const pulseKey = user && workspace ? `deg-pulse:${workspace.id}:${user.id}` : null;
  const isActive = (to: string) =>
    to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname.startsWith(to);

  useEffect(() => {
    const syncPulse = () => {
      if (!pulseKey) return;
      try {
        const saved = JSON.parse(localStorage.getItem(pulseKey) ?? "null") as SavedPulse | null;
        setPulseOnline(saved?.status !== "Offline");
      } catch {
        setPulseOnline(true);
      }
    };
    syncPulse();
    window.addEventListener("storage", syncPulse);
    window.addEventListener("deg-pulse-change", syncPulse);
    return () => {
      window.removeEventListener("storage", syncPulse);
      window.removeEventListener("deg-pulse-change", syncPulse);
    };
  }, [pulseKey, pathname]);

  const togglePulseOnline = (online: boolean) => {
    if (!pulseKey) return;
    try {
      const current = JSON.parse(localStorage.getItem(pulseKey) ?? "null") as SavedPulse | null;
      const next: SavedPulse = {
        status: online ? "Available for Collaboration" : "Offline",
        expiresAt: null,
        checkedInAt: current?.checkedInAt ?? null,
      };
      localStorage.setItem(pulseKey, JSON.stringify(next));
      setPulseOnline(online);
      window.dispatchEvent(new Event("deg-pulse-change"));
    } catch {
      toast.error("Pulse could not save your sign-in status in this browser.");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pb-2 pt-4">
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:justify-center">
          <Link
            to="/app"
            className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden"
            aria-label="Huddle home"
          >
            <ModuleGlyph module="huddle" className="size-6 shrink-0" />
            <span className="truncate text-base font-semibold tracking-tight">Huddle</span>
          </Link>
          <Link
            to="/app"
            className="hidden group-data-[collapsible=icon]:block"
            aria-label="Huddle home"
          >
            <ModuleGlyph module="huddle" className="size-8" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              huddleMuted ? "Unmute Huddle notification sounds" : "Mute Huddle notification sounds"
            }
            aria-pressed={huddleMuted}
            title={huddleMuted ? "Unmute Huddle sounds" : "Mute Huddle sounds"}
            className="size-8 shrink-0 bg-[#B99553] text-[#203B32] hover:bg-[#B99553] hover:text-[#203B32] group-data-[collapsible=icon]:hidden"
            onClick={() => {
              const next = !huddleMuted;
              setHuddleMuted(next);
              try {
                localStorage.setItem("deg-huddle-muted", String(next));
              } catch {
                toast.error("This browser could not save the Huddle sound preference.");
              }
            }}
          >
            {huddleMuted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <div className="flex items-center gap-1 rounded-md border-2 border-sidebar-border bg-sidebar-accent px-1 py-0.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
              <SidebarMenuButton
                asChild
                isActive={isActive("/app/huddle/availability")}
                tooltip="Pulse"
                className="min-w-0 flex-1 bg-transparent text-sidebar-foreground/75 hover:bg-transparent data-[active=true]:bg-transparent group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8"
              >
                <Link to="/app/huddle/$section" params={{ section: "availability" }}>
                  <BriefcaseBusiness aria-hidden="true" />
                  <span className="group-data-[collapsible=icon]:hidden">Pulse</span>
                </Link>
              </SidebarMenuButton>
              <Switch
                checked={pulseOnline}
                onCheckedChange={togglePulseOnline}
                aria-label={pulseOnline ? "Sign out of Pulse" : "Sign in to Pulse"}
                title={pulseOnline ? "Sign out of Pulse" : "Sign in to Pulse"}
                className="mr-1 scale-90 data-[state=checked]:bg-[#B99553] data-[state=unchecked]:bg-sidebar-foreground [&>span]:bg-[#203B32] group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:scale-[0.72]"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0 mt-3" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.62rem] uppercase tracking-[0.16em] text-sidebar-foreground/55">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              {HUDDLE_SECTIONS.filter(
                ({ key }) => !["availability", "team-availability", "meetings"].includes(key),
              ).map(({ key, label, icon: Icon }) => {
                const to = `/app/huddle/${key}`;
                return (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(to)}
                      tooltip={label}
                      className="h-[3.65rem] flex-col justify-center gap-1 px-1 py-1 text-[0.66rem] leading-tight text-sidebar-foreground/75 [&>span:last-child]:max-w-full [&>span:last-child]:whitespace-normal [&>span:last-child]:text-center group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8"
                    >
                      <Link to={to as never}>
                        <Icon aria-hidden="true" />
                        <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/app/projects")}
                  tooltip="Project"
                  className="h-[3.65rem] flex-col justify-center gap-1 px-1 py-1 text-[0.66rem] leading-tight text-sidebar-foreground/75 [&>span:last-child]:text-center group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8"
                >
                  <Link to="/app/projects">
                    <FolderKanban aria-hidden="true" />
                    <span className="group-data-[collapsible=icon]:hidden">Project</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="flex-row items-center gap-1 group-data-[collapsible=icon]:flex-col-reverse">
          <SidebarMenuItem className="min-w-0 flex-1 group-data-[collapsible=icon]:w-full">
            <SidebarMenuButton
              asChild
              isActive={isActive("/app/settings")}
              tooltip="Settings"
              className="h-[3.65rem] flex-1 flex-col justify-center gap-1 px-1 py-1 text-[0.66rem] leading-tight group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8"
            >
              <Link to="/app/settings">
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
            <SidebarTrigger
              aria-label="Collapse or expand sidebar"
              title="Collapse or expand sidebar"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

