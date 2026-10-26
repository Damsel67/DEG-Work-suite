import { useState } from "react";
import {
  AtSign,
  AudioLines,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  FileText,
  FolderOpen,
  Grid2X2,
  Hash,
  Image as ImageIcon,
  LayoutList,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plus,
  Phone,
  Radio,
  Search,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/lib/supabase/workspace-context";

type Section = "chats" | "channels" | "contacts" | "history" | "files" | "calendar";
type NavEntry = { key: string; label: string; icon: LucideIcon; group?: string };

const SECTION_NAV: Record<Section, NavEntry[]> = {
  chats: [
    { key: "recent", label: "Recent messages", icon: Clock3, group: "Messages" },
    { key: "channels", label: "Recent channels", icon: Hash, group: "Messages" },
  ],
  channels: [
    { key: "all", label: "All Channels", icon: Hash, group: "Browse" },
    { key: "personal", label: "Personal", icon: MessageCircle, group: "Browse" },
    { key: "external", label: "External", icon: Users, group: "Browse" },
  ],
  contacts: [
    { key: "announcements", label: "Announcements", icon: Megaphone, group: "Resources" },
    { key: "all-users", label: "All Users", icon: UsersRound, group: "People" },
    { key: "departments", label: "Departments", icon: Building2, group: "People" },
    { key: "direct-reports", label: "My Direct Reports", icon: Users, group: "People" },
    { key: "external-users", label: "External Users", icon: AtSign, group: "People" },
    { key: "teams", label: "Teams", icon: FileText, group: "People" },
    { key: "team-availability", label: "Team Availability", icon: CalendarDays, group: "People" },
  ],
  history: [
    { key: "conversations", label: "Conversations", icon: MessagesSquare },
    { key: "direct-calls", label: "Direct Calls", icon: Phone },
    { key: "meetings", label: "Meetings", icon: Video },
    { key: "live-events", label: "Live Events", icon: Radio },
    { key: "sent-messages", label: "Sent Messages", icon: MessageCircle },
    { key: "hashtags", label: "Hashtags", icon: Hash },
  ],
  files: [
    { key: "shared", label: "Shared in Cliq", icon: FolderOpen },
    { key: "nexa", label: "Nexa", icon: MessagesSquare },
    { key: "recordings", label: "Recordings", icon: Video },
  ],
  calendar: [
    { key: "my-calendar", label: "My Calendar", icon: CalendarDays, group: "My Calendar" },
    { key: "team-calendars", label: "Team Calendars", icon: UsersRound, group: "Team Calendars" },
  ],
};

const SECTION_TITLES: Record<Section, string> = {
  chats: "Hive",
  channels: "Channels",
  contacts: "Contacts",
  history: "History",
  files: "Files",
  calendar: "Calendar",
};

const EMPTY_COPY: Record<string, { title: string; detail: string }> = {
  recent: {
    title: "No recent conversations",
    detail:
      "Your direct and group conversations will appear here when Huddle messaging is connected.",
  },
  channels: {
    title: "No recent channel messages",
    detail:
      "Recent channel conversations will appear here when channel storage and membership are configured.",
  },
  all: {
    title: "No channels available",
    detail:
      "Company channels will appear here when channel records and membership permissions are configured.",
  },
  personal: {
    title: "No personal channels",
    detail: "Channels you create or join will appear here after channel membership is set up.",
  },
  external: {
    title: "No external channels",
    detail:
      "External channels you can access will appear here when the company directory and channel access are configured.",
  },
  announcements: {
    title: "Announcements are not connected",
    detail:
      "Company announcements will appear here when an announcements channel or feed is configured.",
  },
  "all-users": {
    title: "The people directory is not connected",
    detail:
      "All company users will appear here when the workspace has a directory that is safe to share with members.",
  },
  departments: {
    title: "Department information is not connected",
    detail: "Department membership will appear here when department records are available.",
  },
  "direct-reports": {
    title: "Reporting lines are not connected",
    detail:
      "People in your reporting line will appear here when manager relationships are available.",
  },
  "external-users": {
    title: "No external user directory",
    detail:
      "Contractors and other external users will appear here when their company directory records are configured.",
  },
  teams: {
    title: "Teams are not configured",
    detail: "Company teams and their members will appear here when team records are available.",
  },
  "team-availability": {
    title: "Team availability is not connected",
    detail:
      "Shared availability requires workspace presence records. Pulse currently stores only your own status in this browser.",
  },
  conversations: {
    title: "No conversation history",
    detail:
      "Conversation messages will be grouped by date after Huddle message storage is configured.",
  },
  "direct-calls": {
    title: "No direct call history",
    detail: "Call records will appear here after a meeting or calling provider is connected.",
  },
  meetings: {
    title: "No meeting history",
    detail: "Meetings you attend will appear here after a meeting provider is connected.",
  },
  "live-events": {
    title: "No live event history",
    detail: "Live events you attend will appear here once event records are available.",
  },
  "sent-messages": {
    title: "No messages to show",
    detail:
      "Messages sent to you will appear here, grouped by date, when Huddle messaging is connected.",
  },
  shared: {
    title: "No shared files yet",
    detail:
      "Files shared in Cliq will appear here when Huddle file storage and access permissions are connected.",
  },
  nexa: {
    title: "No Nexa files yet",
    detail:
      "Files created or shared with Nexa will appear here when Nexa file storage is configured.",
  },
  recordings: {
    title: "No recordings yet",
    detail:
      "Meeting recordings will appear here when recording storage and permissions are configured.",
  },
  "my-calendar": {
    title: "Your calendar is ready",
    detail:
      "Scheduled events will appear on their dates and times when calendar data is connected.",
  },
  "team-calendars": {
    title: "Team calendars are not connected",
    detail: "Organization teams and event data are not configured in the current workspace.",
  },
};

export function HuddleContextualWorkspace({
  section,
  initialView,
}: {
  section: Section;
  initialView?: string;
}) {
  const { workspace } = useWorkspace();
  const [activeView, setActiveView] = useState(
    initialView && SECTION_NAV[section].some((entry) => entry.key === initialView)
      ? initialView
      : (SECTION_NAV[section][0]?.key ?? ""),
  );
  const [query, setQuery] = useState("");
  const [callFilter, setCallFilter] = useState("All");
  const [meetingFilter, setMeetingFilter] = useState("Everyone");
  const [meetingApplied, setMeetingApplied] = useState("Everyone");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyDate, setHistoryDate] = useState("");
  const [historyFilter, setHistoryFilter] = useState("All activity");
  const entries = SECTION_NAV[section];
  const activeEntry = entries.find((entry) => entry.key === activeView) ?? entries[0];
  const copy = EMPTY_COPY[activeView];
  const availableGroups = [...new Set(entries.map((entry) => entry.group).filter(Boolean))];

  return (
    <div className="flex min-h-0 w-full flex-1 max-md:flex-col">
      <aside
        aria-label={`${SECTION_TITLES[section]} navigation`}
        className="flex w-56 shrink-0 flex-col border-r border-border bg-card/55 max-md:w-full max-md:border-r-0 max-md:border-b"
      >
        <div className="border-b border-border px-4 py-4">
          <h1 className="text-base font-semibold">{SECTION_TITLES[section]}</h1>
          {section === "chats" && (
            <p className="mt-1 text-xs text-muted-foreground">Recent messages and conversations</p>
          )}
          {section === "channels" && (
            <p className="mt-1 text-xs text-muted-foreground">Browse company channels</p>
          )}
          {section === "contacts" && (
            <p className="mt-1 text-xs text-muted-foreground">People and teams</p>
          )}
          {section === "history" && (
            <p className="mt-1 text-xs text-muted-foreground">Your activity, organized by type</p>
          )}
          {!["history", "files", "calendar"].includes(section) && (
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={`Search ${SECTION_TITLES[section].toLowerCase()}`}
                placeholder={section === "channels" ? "Search channels" : "Search"}
                className="h-8 bg-background pl-8 text-xs"
              />
            </div>
          )}
        </div>
        <nav
          className="min-h-0 flex-1 overflow-y-auto p-2"
          aria-label={`${SECTION_TITLES[section]} sections`}
        >
          {availableGroups.map((group) => (
            <div key={group} className="mb-3">
              <p className="px-2 pb-1 pt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group}
              </p>
              {entries
                .filter((entry) => entry.group === group)
                .map((entry) => (
                  <NavButton
                    key={entry.key}
                    entry={entry}
                    active={activeView === entry.key}
                    onClick={() => setActiveView(entry.key)}
                  />
                ))}
            </div>
          ))}
          {availableGroups.length === 0 &&
            entries.map((entry) => (
              <NavButton
                key={entry.key}
                entry={entry}
                active={activeView === entry.key}
                onClick={() => setActiveView(entry.key)}
              />
            ))}
        </nav>
      </aside>

      <main
        className="flex min-h-0 min-w-0 flex-1 flex-col bg-background p-5 md:p-7"
        aria-live="polite"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            {activeEntry && <activeEntry.icon className="size-5 text-primary" aria-hidden="true" />}
            <div>
              <h2 className="text-lg font-semibold">
                {section === "calendar" ? "Calendar" : activeEntry?.label}
              </h2>
              {section === "calendar" ? (
                <p className="text-xs text-muted-foreground">GMT+1 · Africa/Lagos</p>
              ) : (
                workspace && <p className="text-xs text-muted-foreground">{workspace.name}</p>
              )}
            </div>
          </div>
          {section === "history" && activeView === "direct-calls" && (
            <div
              className="flex items-center gap-1 rounded-lg border border-border p-1"
              aria-label="Filter calls"
            >
              {["All", "Missed", "Received"].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={callFilter === filter ? "secondary" : "ghost"}
                  aria-pressed={callFilter === filter}
                  onClick={() => setCallFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          )}
          {section === "history" && activeView === "meetings" && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="meeting-history-filter">
                Meetings with
              </label>
              <select
                id="meeting-history-filter"
                value={meetingFilter}
                onChange={(event) => setMeetingFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option>Everyone</option>
                <option>My Team</option>
                <option value="Specific user">Specific user</option>
              </select>
              {meetingFilter === "Specific user" && (
                <span className="text-xs text-muted-foreground">
                  User selection requires the people directory.
                </span>
              )}
              <Button size="sm" onClick={() => setMeetingApplied(meetingFilter)}>
                Apply
              </Button>
              <span className="sr-only" role="status">
                Filter applied: {meetingApplied}
              </span>
            </div>
          )}
        </div>

        {section === "history" && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={`Search ${activeEntry?.label.toLowerCase()}`}
                placeholder="Search history"
                value={historyQuery}
                onChange={(event) => setHistoryQuery(event.target.value)}
                className="h-9 bg-card pl-9"
              />
            </div>
            <label className="sr-only" htmlFor="history-date">
              Choose a date
            </label>
            <Input
              id="history-date"
              type="date"
              aria-label="Choose a date"
              value={historyDate}
              onChange={(event) => setHistoryDate(event.target.value)}
              className="h-9 w-40 bg-card"
            />
            {(activeView === "conversations" || activeView === "sent-messages") && (
              <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm">
                <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Filter {activeEntry?.label}</span>
                <select
                  aria-label={`Filter ${activeEntry?.label}`}
                  value={historyFilter}
                  onChange={(event) => setHistoryFilter(event.target.value)}
                  className="max-w-44 bg-transparent outline-none"
                >
                  <option>All activity</option>
                  <option>Direct conversations</option>
                  <option>Channel conversations</option>
                  <option>Mentions</option>
                </select>
              </label>
            )}
          </div>
        )}

        {section === "files" ? (
          <FilesBrowser destination={activeView} />
        ) : section === "calendar" ? (
          <CalendarView selectedCalendar={activeView} />
        ) : section === "history" && activeView === "hashtags" ? (
          <HashtagOverview />
        ) : (
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="max-w-md text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                {activeEntry && <activeEntry.icon className="size-5" aria-hidden="true" />}
              </span>
              <h3 className="mt-4 font-semibold">{copy?.title ?? "Nothing here yet"}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy?.detail}</p>
              {section === "chats" && (
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Conversation panels need persistent conversations and membership records before
                  they can be opened or split side by side.
                </p>
              )}
              {query && section !== "history" && (
                <p className="mt-3 text-xs text-muted-foreground" role="status">
                  Search is ready; there are no connected{" "}
                  {section === "channels"
                    ? "channels"
                    : section === "contacts"
                      ? "directory records"
                      : "conversations"}{" "}
                  to match “{query}”.
                </p>
              )}
              {section === "history" && activeView === "direct-calls" && (
                <p className="mt-3 text-xs text-muted-foreground" role="status">
                  Showing {callFilter.toLowerCase()} calls.
                </p>
              )}
              {section === "history" && activeView === "meetings" && (
                <p className="mt-3 text-xs text-muted-foreground" role="status">
                  Current filter: {meetingApplied}.
                </p>
              )}
              {section === "history" && (historyQuery || historyDate) && (
                <p className="mt-3 text-xs text-muted-foreground" role="status">
                  Search and date filters will apply when history records are connected.
                </p>
              )}
              {section === "history" && historyFilter !== "All activity" && (
                <p className="mt-2 text-xs text-muted-foreground" role="status">
                  Selected filter: {historyFilter}.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavButton({
  entry,
  active,
  onClick,
}: {
  entry: NavEntry;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = entry.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-foreground/75 hover:bg-accent hover:text-foreground"}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{entry.label}</span>
    </button>
  );
}

const FILE_TYPES = [
  { label: "Images", icon: ImageIcon },
  { label: "Video", icon: Video },
  { label: "Audio", icon: AudioLines },
  { label: "Files", icon: FileText },
  { label: "Recordings", icon: Radio },
];

function FilesBrowser({ destination }: { destination: string }) {
  const [fileType, setFileType] = useState("Images");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [accessFilter, setAccessFilter] = useState("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [recordingScope, setRecordingScope] = useState("All Recordings");
  const [sender, setSender] = useState("All");
  const [senderQuery, setSenderQuery] = useState("");
  const [appliedSender, setAppliedSender] = useState("");
  const isRecordings = fileType === "Recordings";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="File types">
          {FILE_TYPES.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              type="button"
              role="tab"
              aria-selected={fileType === label}
              variant={fileType === label ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFileType(label)}
            >
              <Icon aria-hidden="true" /> {label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-1">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <LayoutList aria-hidden="true" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid2X2 aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={`Search ${fileType.toLowerCase()}`}
            placeholder={`Search ${fileType.toLowerCase()}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 bg-card pl-9"
          />
        </div>
        <label className="sr-only" htmlFor="file-date">
          Select date
        </label>
        <Input
          id="file-date"
          type="date"
          aria-label="Select date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-9 w-40 bg-card"
        />
        <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm">
          <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Filter files</span>
          <select
            aria-label="Filter files"
            value={accessFilter}
            onChange={(event) => setAccessFilter(event.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="All">Filter: All</option>
            <option value="You">Filter: You</option>
            <option value="Shared with me">Filter: Shared with me</option>
          </select>
        </label>
      </div>

      {isRecordings && (
        <section
          className="space-y-3 rounded-lg border border-border bg-card/45 p-4"
          aria-label="Recording filters"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1" role="tablist" aria-label="Recording ownership">
              {["All Recordings", "My Recordings", "Shared with Me"].map((scope) => (
                <Button
                  key={scope}
                  role="tab"
                  aria-selected={recordingScope === scope}
                  variant={recordingScope === scope ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setRecordingScope(scope)}
                >
                  {scope}
                </Button>
              ))}
            </div>
            <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
              <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Filter by sender</span>
              <select
                aria-label="Filter by sender"
                value={sender}
                onChange={(event) => setSender(event.target.value)}
                className="bg-transparent outline-none"
              >
                <option>All</option>
                <option>You</option>
                <option>Specific Sender</option>
              </select>
            </label>
          </div>
          {sender === "Specific Sender" && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-56 flex-1">
                <label
                  htmlFor="recording-sender"
                  className="mb-1 block text-xs text-muted-foreground"
                >
                  Search organization members
                </label>
                <Input
                  id="recording-sender"
                  value={senderQuery}
                  onChange={(event) => setSenderQuery(event.target.value)}
                  placeholder="Search by name"
                  className="h-9 bg-background"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  The people directory is not connected, so there are no senders to select yet.
                </p>
              </div>
              <Button
                size="sm"
                disabled={!appliedSender}
                onClick={() => setAppliedSender(senderQuery.trim())}
              >
                Apply sender
              </Button>
            </div>
          )}
        </section>
      )}

      <section
        className="flex min-h-56 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/25 p-8 text-center"
        aria-live="polite"
      >
        {fileType === "Images" ? (
          <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
        ) : fileType === "Video" ? (
          <Video className="size-6 text-muted-foreground" aria-hidden="true" />
        ) : fileType === "Audio" ? (
          <AudioLines className="size-6 text-muted-foreground" aria-hidden="true" />
        ) : fileType === "Files" ? (
          <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Radio className="size-6 text-muted-foreground" aria-hidden="true" />
        )}
        <h3 className="mt-3 font-semibold">No {fileType.toLowerCase()} to display</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          {destination === "shared"
            ? "Shared files are not stored in the current Huddle workspace yet."
            : destination === "nexa"
              ? "Nexa file storage is not configured yet."
              : "Recording storage and organization sender records are not configured yet."}
        </p>
        {(query || date || accessFilter !== "All" || appliedSender) && (
          <p className="mt-2 text-xs text-muted-foreground" role="status">
            Filters are selected; they will apply when file records are connected.
          </p>
        )}
      </section>
      <span className="sr-only" role="status">
        {view === "grid" ? "Grid" : "List"} view selected. {recordingScope} selected.
        {senderQuery ? ` Sender search: ${senderQuery}.` : ""}
      </span>
    </div>
  );
}

function CalendarView({ selectedCalendar }: { selectedCalendar: string }) {
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [teamChecked, setTeamChecked] = useState(false);
  const week = getWeekDays(weekAnchor);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const isTeamCalendar = selectedCalendar === "team-calendars";

  const shiftWeek = (amount: number) => {
    setWeekAnchor((date) => {
      const next = new Date(date);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous week"
            onClick={() => shiftWeek(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => shiftWeek(1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekAnchor(new Date())}>
            Today
          </Button>
          <span className="ml-2 text-xs text-muted-foreground">GMT+1 · Africa/Lagos</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-ochre text-dark-bark hover:bg-ochre/90">
              <Plus aria-hidden="true" /> Create Event <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                toast.info("Meeting scheduling is not connected to a calendar provider yet.")
              }
            >
              Schedule Meeting
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.info("Live event scheduling is not connected to calendar storage yet.")
              }
            >
              Schedule Live Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isTeamCalendar ? (
        <section className="flex min-h-64 flex-1 flex-col rounded-lg border border-border bg-card/30 p-5">
          <h3 className="font-semibold">Team Calendars</h3>
          <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={teamChecked}
              disabled
              onChange={(event) => setTeamChecked(event.target.checked)}
            />
            Select all team calendars
          </label>
          <p className="m-auto max-w-md text-center text-sm leading-6 text-muted-foreground">
            Organization teams are not configured, so there are no team calendars to select.
          </p>
        </section>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-card/20">
          <div className="min-w-[74rem]">
            <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
              No calendar events are connected yet. Scheduled meetings will appear in their time
              slots when calendar data is available.
            </p>
            <div
              className="sticky top-0 z-10 grid border-b border-border bg-card"
              style={{ gridTemplateColumns: "4rem repeat(7, minmax(9rem, 1fr))" }}
            >
              <div className="border-r border-border p-2" aria-hidden="true" />
              {week.map((date) => (
                <div
                  key={date.toISOString()}
                  className="border-r border-border px-3 py-3 text-center text-xs font-medium"
                >
                  {formatter.format(date)}
                </div>
              ))}
            </div>
            {Array.from({ length: 16 }, (_, index) => index + 7).map((hour) => (
              <div
                key={hour}
                className="grid min-h-14 border-b border-border/70"
                style={{ gridTemplateColumns: "4rem repeat(7, minmax(9rem, 1fr))" }}
              >
                <div className="border-r border-border px-2 pt-1 text-right text-[0.68rem] text-muted-foreground">
                  {new Intl.DateTimeFormat("en-NG", {
                    timeZone: "Africa/Lagos",
                    hour: "numeric",
                    hour12: true,
                  }).format(new Date(2020, 0, 1, hour))}
                </div>
                {week.map((date) => (
                  <div
                    key={`${date.toDateString()}-${hour}`}
                    className="border-r border-border/70"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getWeekDays(anchor: Date) {
  const start = new Date(anchor);
  const day = start.getDay();
  start.setDate(start.getDate() - ((day + 6) % 7));
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function HashtagOverview() {
  const groups = [
    "Recently Used",
    "Trending in Your Organization",
    "Suggested to You",
    "Following",
  ];
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => (
          <section key={group} className="min-h-32 rounded-lg border border-border bg-card/50 p-4">
            <h3 className="text-sm font-semibold">{group}</h3>
            <p className="mt-5 text-xs text-muted-foreground">No hashtag data is connected yet.</p>
          </section>
        ))}
      </div>
      <section className="flex min-h-48 flex-1 flex-col rounded-lg border border-border bg-card/50 p-5">
        <h3 className="font-semibold">Organization Tag Cloud</h3>
        <div className="flex flex-1 items-center justify-center text-center">
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            The organization tag cloud will appear when at least five hashtags are available in open
            channels.
          </p>
        </div>
      </section>
    </div>
  );
}
