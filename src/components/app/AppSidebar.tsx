import { Link, useLocation } from "@tanstack/react-router";
import { Home, Settings } from "lucide-react";
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
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { NAV_GROUPS, moduleByKey } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname.startsWith(to));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pb-2 pt-4">
        <Link to="/app" className="block group-data-[collapsible=icon]:hidden" aria-label="DEG WorkSuite home">
          <Logo surface="onDark" className="h-9" />
        </Link>
        <Link to="/app" className="hidden group-data-[collapsible=icon]:block" aria-label="DEG WorkSuite home">
          <img src={moduleByKey("command").icon} alt="" className="size-8 rounded-lg" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/app")} tooltip="Home">
                  <Link to="/app">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {NAV_GROUPS.map((g) => (
          <SidebarGroup key={g.label} className="py-1">
            <SidebarGroupLabel className="text-[0.68rem] uppercase tracking-[0.18em] text-sidebar-foreground/55">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.keys.map((k) => {
                  const m = moduleByKey(k);
                  const active = isActive(m.to);
                  const moments = k === "moments";
                  return (
                    <SidebarMenuItem key={k}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={m.name}
                        className={cn(
                          moments &&
                            "data-[active=true]:bg-aubergine data-[active=true]:text-cream hover:bg-aubergine/70 hover:text-cream",
                        )}
                      >
                        <Link to={m.to}>
                          <img src={m.icon} alt="" className="size-5 rounded-[6px]" />
                          <span>{m.name}</span>
                        </Link>
                      </SidebarMenuButton>
                      {k === "command" && <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground">2</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/app/settings")} tooltip="Settings">
              <Link to="/app/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
