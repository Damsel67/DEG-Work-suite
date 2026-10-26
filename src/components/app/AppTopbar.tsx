import { useEffect, useRef, useState } from "react";
import {
  AppWindow,
  Bell,
  Check,
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
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WorkspaceAppsLauncher } from "@/components/app/WorkspaceAppsLauncher";
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
  const { user, workspace, profileName } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const initials = profileName
    ? profileName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : (user?.email ?? "U").slice(0, 2).toUpperCase();
  const projectResults = searchResults.filter((result) => result.category === "Project");
  const taskResults = searchResults.filter((result) => result.category === "Task");

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
      <Link
        to="/app/dashboard"
        aria-label="Open DEG WorkSuite dashboard"
        className="hidden shrink-0 items-center gap-2 rounded-md pr-3 text-sm font-semibold tracking-tight text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      >
        <Logo className="h-[18px]" />
      </Link>
      <span
        className="hidden max-w-36 truncate border-l border-border pl-3 text-xs text-muted-foreground lg:block"
        title={workspace?.name}
      >
        {workspace?.name}
      </span>
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
              {profileName ?? user?.email ?? "Account"}
              {profileName && (
                <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
              )}
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
        <WorkspaceAppsLauncher className="ml-1 size-8 shrink-0 rounded-md" />
      </div>
    </header>
  );
}
