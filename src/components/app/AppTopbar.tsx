import { Link } from "@tanstack/react-router";
import { Bell, ChevronDown, HelpCircle, LogOut, Search, User } from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NOTIFICATIONS = [
  { title: "Proposal awaiting your approval", meta: "DEG Command · 4 min ago" },
  { title: "SR-1036 is past its SLA", meta: "Support · 30 min ago" },
  { title: "Contact sync failed 3 times", meta: "Automations · 1 hr ago" },
];

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="hidden gap-1.5 px-2 sm:inline-flex">
            <span className="text-sm font-semibold">DEG Studio Lagos</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuItem>DEG Studio Lagos</DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast("Workspace switching is part of the next phase.")}>
            Okoye Holdings (guest)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative ml-auto w-full max-w-sm md:ml-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search the workspace"
          placeholder="Search projects, people, files…"
          className="h-9 rounded-full border-border bg-card pl-9"
        />
      </div>

      <div className="flex items-center gap-1 md:ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications, 3 unread" className="relative rounded-full">
              <Bell />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-highlight" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5">
                <span className="font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.meta}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          className="hidden rounded-full sm:inline-flex"
          onClick={() => toast("Help centre", { description: "Press / to search. Help articles are coming in a later phase." })}
        >
          <HelpCircle />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Profile menu">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">AO</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              Adaeze Okafor
              <p className="text-xs font-normal text-muted-foreground">Owner</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/settings"><User className="size-4" /> Profile & preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/"><LogOut className="size-4" /> Leave prototype</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
