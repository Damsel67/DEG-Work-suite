import { useEffect, useRef, useState } from "react";
import {
  AppWindow,
  Bell,
  Check,
  ChevronDown,
  CalendarDays,
  Hash,
  Megaphone,
  MessageSquarePlus,
  MessagesSquare,
  FolderKanban,
  HelpCircle,
  LogOut,
  Phone,
  Plus,
  Search,
  StickyNote,
  User,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MODULES } from "@/lib/modules";
import { ModuleGlyph } from "@/components/app/ModuleGlyph";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SearchResult = {
  id: string;
  title: string;
  category: "Project" | "Task";
  to: "/app/projects" | "/app/tasks";
};

export function AppTopbar() {
  const { user, workspace } = useWorkspace();
  const { pathname } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [launcherQuery, setLauncherQuery] = useState("");
  const [launcherGroup, setLauncherGroup] = useState("all");
  const currentApp = MODULES.find((module) =>
    module.key === "huddle"
      ? pathname === "/app" || pathname.startsWith("/app/huddle/") || pathname === "/app/messages"
      : pathname === module.to || pathname.startsWith(module.to + "/"),
  );
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();
  const projectResults = searchResults.filter((result) => result.category === "Project");
  const taskResults = searchResults.filter((result) => result.category === "Task");
  const launcherGroups = [
    { key: "all", label: "All applications" },
    { key: "intelligence", label: "Intelligence" },
    { key: "work", label: "Work" },
    { key: "customers", label: "Customers" },
    { key: "operations", label: "Operations" },
    { key: "human", label: "Personal" },
  ];
  const launcherItems = MODULES.filter((module) => {
    const matchesGroup = launcherGroup === "all" || module.group === launcherGroup;
    const matchesQuery = `${module.name} ${module.short} ${module.description}`
      .toLocaleLowerCase()
      .includes(launcherQuery.trim().toLocaleLowerCase());
    return matchesGroup && matchesQuery;
  });

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2 || !workspace) {
      setSearchResults([]);
      setSearchState("idle");
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchState("loading");
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name")
          .eq("workspace_id", workspace.id)
          .ilike("name", `%${query}%`)
          .limit(5);
        if (projectsError) throw projectsError;
        const projectRows = (projects ?? []) as { id: string; name: string }[];
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("id, title, projects!inner(workspace_id)")
          .eq("projects.workspace_id", workspace.id)
          .ilike("title", `%${query}%`)
          .limit(5);
        if (tasksError) throw tasksError;
        if (cancelled) return;
        setSearchResults([
          ...projectRows.map((project) => ({
            id: project.id,
            title: project.name,
            category: "Project" as const,
            to: "/app/projects" as const,
          })),
          ...((tasks ?? []) as { id: string; title: string }[]).map((task) => ({
            id: task.id,
            title: task.title,
            category: "Task" as const,
            to: "/app/tasks" as const,
          })),
        ]);
        setSearchState("ready");
      } catch {
        if (!cancelled) setSearchState("error");
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, workspace]);

  useEffect(() => {
    if (!searchOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [searchOpen]);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur md:gap-3 md:px-6">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <div ref={searchContainerRef} className="relative min-w-0 w-full max-w-3xl flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search the workspace"
          placeholder="Search projects and tasks…"
          className="h-10 rounded-full border-border bg-card pl-9"
          value={searchQuery}
          onFocus={() => setSearchOpen(true)}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setSearchOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSearchOpen(false);
          }}
          aria-expanded={searchOpen && searchQuery.trim().length >= 2}
          aria-controls="workspace-search-results"
        />
        {searchOpen && searchQuery.trim().length >= 2 && (
          <div
            id="workspace-search-results"
            role="region"
            aria-label="Workspace search results"
            className="absolute right-0 top-full z-50 mt-2 max-h-[min(65vh,24rem)] w-[min(92vw,24rem)] overflow-y-auto rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
          >
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Projects &amp; tasks
            </p>
            {searchState === "loading" && (
              <p className="px-2 py-4 text-sm text-muted-foreground">Searching your workspace…</p>
            )}
            {searchState === "error" && (
              <p role="alert" className="px-2 py-4 text-sm text-destructive">
                Search couldn’t load. Try again.
              </p>
            )}
            {searchState === "ready" && searchResults.length === 0 && (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                No matching projects or tasks.
              </p>
            )}
            {projectResults.length > 0 && (
              <div role="group" aria-label="Projects">
                <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Projects
                </p>
                {projectResults.map((result) => (
                  <Link
                    key={result.id}
                    to={result.to}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 truncate">{result.title}</span>
                    <FolderKanban
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            )}
            {taskResults.length > 0 && (
              <div role="group" aria-label="Tasks">
                <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Tasks
                </p>
                {taskResults.map((result) => (
                  <Link
                    key={result.id}
                    to={result.to}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 truncate">{result.title}</span>
                    <Check className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
            <p className="border-t border-border px-2 pt-2 text-[10px] leading-4 text-muted-foreground">
              People, messages, and files will appear when Huddle data is connected.
            </p>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            aria-label="Quick action"
            title="Quick action"
            className="size-11 shrink-0 rounded-xl shadow-soft [&_svg]:size-6"
          >
            <Plus aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-72">
          <DropdownMenuLabel>Quick action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/app/huddle/$section" params={{ section: "chats" }}>
              <MessageSquarePlus aria-hidden="true" /> Send a direct message
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/huddle/$section" params={{ section: "chats" }}>
              <MessagesSquare aria-hidden="true" /> Start a group conversation
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/huddle/$section" params={{ section: "channels" }}>
              <Hash aria-hidden="true" /> Create a channel
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              toast.info(
                "Guest invitations are not connected to a workspace invitation service yet.",
              )
            }
          >
            <UserPlus aria-hidden="true" /> Invite guests
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              toast.info("Calling is not available until a call provider is configured.")
            }
          >
            <Phone aria-hidden="true" /> Make a call
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Video aria-hidden="true" /> Meet now
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52">
              <DropdownMenuItem
                onSelect={() =>
                  toast.info("Audio meetings need a meeting provider before they can start.")
                }
              >
                <Phone aria-hidden="true" /> Audio meeting
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.info("Video meetings need a meeting provider before they can start.")
                }
              >
                <Video aria-hidden="true" /> Video meeting
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem asChild>
            <Link to="/app/huddle/$section" params={{ section: "meetings" }}>
              <CalendarDays aria-hidden="true" /> Schedule a meeting
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/huddle/$section" params={{ section: "meetings" }}>
              <Megaphone aria-hidden="true" /> Schedule a live event
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/huddle/$section" params={{ section: "reminders" }}>
              <Bell aria-hidden="true" /> Set a reminder
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/documents">
              <StickyNote aria-hidden="true" /> Take notes
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-full">
              <Bell />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <div className="flex flex-col items-center px-5 py-8 text-center">
              <AppWindow className="size-5 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">Notifications are not connected yet.</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                They will appear here when Huddle messaging is set up.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          className="hidden rounded-full sm:inline-flex"
          onClick={() =>
            toast("Help centre", {
              description: "Press / to search. Help articles are coming in a later phase.",
            })
          }
        >
          <HelpCircle />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Profile menu"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user?.email ?? "Account"}
              <p className="text-xs font-normal text-muted-foreground">Signed in</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/settings">
                <User className="size-4" /> Profile &amp; settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                const { error } = await createSupabaseBrowserClient().auth.signOut();
                if (error) toast.error(error.message);
              }}
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog
          open={launcherOpen}
          onOpenChange={(open) => {
            setLauncherOpen(open);
            if (!open) {
              setLauncherQuery("");
              setLauncherGroup("all");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open workspace applications"
              title="Applications"
              className="ml-1 size-8 shrink-0 rounded-md"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px] text-current"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                {[3, 10, 17].flatMap((x) =>
                  [3, 10, 17].map((y) => (
                    <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.8" />
                  )),
                )}
              </svg>
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[min(78vh,42rem)] w-[min(92vw,64rem)] max-w-none flex-col gap-0 overflow-hidden rounded-xl border-border bg-card p-0 shadow-2xl">
            <DialogHeader className="flex-row items-center gap-4 border-b border-border px-5 py-4 text-left sm:px-6">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  autoFocus
                  aria-label="Search applications"
                  placeholder="Search applications"
                  value={launcherQuery}
                  onChange={(event) => setLauncherQuery(event.target.value)}
                  className="h-10 max-w-sm rounded-full bg-background pl-9"
                />
              </div>
              <Link
                to="/app"
                onClick={() => setLauncherOpen(false)}
                className="shrink-0 rounded-sm px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Home
              </Link>
            </DialogHeader>
            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-8 gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide"
                    >
                      {launcherGroups.find((group) => group.key === launcherGroup)?.label ??
                        "All applications"}
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {launcherGroups.map((group) => (
                      <DropdownMenuItem
                        key={group.key}
                        onSelect={() => setLauncherGroup(group.key)}
                      >
                        <span className="flex-1">{group.label}</span>
                        {launcherGroup === group.key && (
                          <Check className="size-4 text-primary" aria-hidden="true" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DialogTitle className="sr-only">WorkSuite applications</DialogTitle>
                <DialogDescription className="sr-only">
                  Search and switch between the applications in your DEG WorkSuite.
                </DialogDescription>
              </div>
              {launcherItems.length ? (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {launcherItems.map((module) => {
                    const active = currentApp?.key === module.key;
                    return (
                      <Link
                        key={module.key}
                        to={module.to}
                        onClick={() => setLauncherOpen(false)}
                        aria-current={active ? "page" : undefined}
                        aria-label={`${module.name}${active ? ", current application" : ""}${module.status && module.status !== "Live" ? `, ${module.status}` : ""}`}
                        className={`group flex min-h-[5.5rem] items-center gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary/35 bg-primary/5" : ""}`}
                      >
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary transition-colors group-hover:bg-primary/12 ${active ? "bg-primary/12" : ""}`}
                        >
                          <ModuleGlyph module={module} className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{module.name}</span>
                            {active && (
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {module.status === "Live"
                              ? module.short
                              : `${module.status ?? "Prototype"} · ${module.short}`}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-6 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No matching applications.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

