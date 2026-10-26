import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ArchMark } from "@/components/brand/Logo";
import { ModuleGlyph } from "@/components/app/ModuleGlyph";
import { WorkspaceAppsLauncher } from "@/components/app/WorkspaceAppsLauncher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function WorkspacePortalLayout({ children }: { children: ReactNode }) {
  const { user, workspace, profileName, enabledApps } = useWorkspace();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const initials = (profileName ?? user?.email ?? "U")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const avatarUrl = user?.user_metadata?.["avatar_url"];

  const visibleNavigation = [
    ...(enabledApps.includes("huddle")
      ? [{ key: "huddle", label: "Huddle", href: "/app" as const, glyph: "huddle" as const }]
      : []),
    ...(enabledApps.includes("orbit")
      ? [
          {
            key: "projects",
            label: "Projects",
            href: "/app/projects" as const,
            glyph: "projects" as const,
          },
        ]
      : []),
    ...(enabledApps.includes("people")
      ? [{ key: "people", label: "People", href: "/app/people" as const, glyph: "people" as const }]
      : []),
  ];

  const sidebar = (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ${collapsed ? "w-[4.5rem]" : "w-60"}`}
    >
      <Link
        to="/app/dashboard"
        aria-label="DEG Workspace home"
        className={`flex h-[4.25rem] items-center border-b border-sidebar-border px-4 ${collapsed ? "justify-center" : "gap-3"}`}
      >
        <ArchMark className="size-7 shrink-0 [&_.stroke-foreground]:stroke-sidebar-foreground [&_.stroke-ochre]:stroke-sidebar-primary [&_.stroke-clay]:stroke-sidebar-foreground" />
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">DEG Workspace</span>
        )}
      </Link>
      <nav aria-label="Workspace home" className="px-2 pt-3">
        <Link
          to="/app/dashboard"
          onClick={() => setMobileOpen(false)}
          title={collapsed ? "Home" : undefined}
          aria-current={pathname === "/app/dashboard" ? "page" : undefined}
          className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${collapsed ? "justify-center" : "gap-3"} ${pathname === "/app/dashboard" ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/85"}`}
        >
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent">
            <Home className="size-4" aria-hidden="true" />
          </span>
          {!collapsed && <span className="truncate">Home</span>}
        </Link>
      </nav>
      {!collapsed && (
        <p className="px-5 pb-2 pt-5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">
          Applications
        </p>
      )}
      <nav
        aria-label="Workspace applications"
        className={`flex-1 space-y-1 px-2 py-3 ${collapsed ? "pt-4" : ""}`}
      >
        {visibleNavigation.map((item) => {
          const active =
            item.key === "huddle"
              ? pathname === "/app" || pathname.startsWith("/app/huddle")
              : item.key === "projects"
                ? pathname.startsWith("/app/projects") || pathname.startsWith("/app/tasks")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${collapsed ? "justify-center" : "gap-3"} ${active ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground/85"}`}
            >
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent">
                <ModuleGlyph module={item.glyph} className="size-5" />
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div
        className={`border-t border-sidebar-border p-2 ${collapsed ? "flex justify-center" : ""}`}
      >
        <Button
          variant="ghost"
          size="icon"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <div className="hidden md:flex">{sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {sidebar}
          <Button
            size="icon"
            variant="outline"
            className="absolute right-3 top-3"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </Button>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 sm:hidden">
              <span className="truncate text-sm font-semibold">DEG Workspace</span>
            </div>
            <div className="hidden min-w-0 items-center gap-3 sm:flex">
              <Link to="/app/dashboard" className="text-sm font-semibold hover:text-primary">
                Home
              </Link>
              <Link
                to="/app/getting-started"
                aria-current={pathname === "/app/getting-started" ? "page" : undefined}
                className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${pathname === "/app/getting-started" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                <BookOpenText className="size-4" aria-hidden="true" />
                Getting Started
              </Link>
              <span className="hidden h-5 border-l border-border lg:block" />
              <span
                className="hidden max-w-56 truncate text-xs text-muted-foreground lg:block"
                title={workspace?.name}
              >
                {workspace?.name ?? "Your workspace"}
              </span>
            </div>
          </div>
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open workspace settings"
                title="Settings"
              >
                <Settings className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(88vw,20rem)] border-r border-border bg-card p-0"
            >
              <SheetHeader className="border-b border-border px-5 py-5 text-left">
                <SheetTitle>App Settings</SheetTitle>
                <SheetDescription>Directory and personal account settings.</SheetDescription>
              </SheetHeader>
              <nav aria-label="Workspace settings" className="space-y-1 p-3">
                <Link
                  to="/app/people"
                  onClick={(event) => {
                    if (!enabledApps.includes("people")) {
                      event.preventDefault();
                      return;
                    }
                    setSettingsOpen(false);
                  }}
                  aria-disabled={!enabledApps.includes("people")}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${enabledApps.includes("people") ? "hover:bg-accent" : "cursor-not-allowed opacity-55"}`}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-accent">
                    <ModuleGlyph module="people" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Directory</span>
                    <span className="block text-xs text-muted-foreground">
                      {enabledApps.includes("people")
                        ? "People in your organisation"
                        : "Enable People access to open the directory"}
                    </span>
                  </span>
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setSettingsOpen(false)}
                  aria-current={pathname === "/app/settings" ? "page" : undefined}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-accent">
                    <Settings className="size-4" />
                  </span>
                  <span>
                    <span className="block font-medium">My Settings</span>
                    <span className="block text-xs text-muted-foreground">Profile and account</span>
                  </span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <WorkspaceAppsLauncher />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open account menu"
              >
                <Avatar className="size-8">
                  {typeof avatarUrl === "string" && avatarUrl.startsWith("https://") && (
                    <AvatarImage src={avatarUrl} alt="" />
                  )}
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-label="Signed in"
                  title="Signed in"
                  className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-primary"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-xl p-2">
              <div className="mb-1 rounded-lg bg-muted/70 px-3 py-3">
                <p className="truncate text-sm font-semibold">
                  {profileName ?? user?.email ?? "Account"}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  Signed in to {workspace?.name ?? "your workspace"}
                </p>
              </div>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">My Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const { error } = await createSupabaseBrowserClient().auth.signOut();
                  if (error) toast.error(error.message);
                }}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 md:px-8 md:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
