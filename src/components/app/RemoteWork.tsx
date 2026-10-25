import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Coffee,
  LogIn,
  LogOut,
  Moon,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DURATIONS = [15, 30, 45, 60] as const;
type WorkStatus =
  | "Available for Collaboration"
  | "Engaged at Work"
  | "Meal Break"
  | "Short Break"
  | "Do Not Disturb"
  | "Offline";
type StoredPresence = { status: WorkStatus; expiresAt: number | null; checkedInAt: number | null };
const DEFAULT_PRESENCE: StoredPresence = {
  status: "Available for Collaboration",
  expiresAt: null,
  checkedInAt: null,
};
const pulseExpiryTimers = new Map<string, number>();

function keepExpiryRunning(key: string, expiresAt: number | null) {
  const prior = pulseExpiryTimers.get(key);
  if (prior) window.clearTimeout(prior);
  pulseExpiryTimers.delete(key);
  if (!expiresAt) return;
  const timer = window.setTimeout(
    () => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? "null") as StoredPresence | null;
        if (saved?.expiresAt === expiresAt && expiresAt <= Date.now()) {
          localStorage.setItem(
            key,
            JSON.stringify({ ...saved, status: "Available for Collaboration", expiresAt: null }),
          );
          window.dispatchEvent(new Event("deg-pulse-change"));
        }
      } catch {
        // The current status remains readable even if browser storage is unavailable.
      }
      pulseExpiryTimers.delete(key);
    },
    Math.max(0, expiresAt - Date.now()),
  );
  pulseExpiryTimers.set(key, timer);
}

export function RemoteWork() {
  const { user, workspace } = useWorkspace();
  const presenceKey = user && workspace ? `deg-pulse:${workspace.id}:${user.id}` : null;
  const [presence, setPresence] = useState(DEFAULT_PRESENCE);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const checkedIn = presence.checkedInAt !== null;
  const displayName = user?.user_metadata?.full_name || user?.email || "You";
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    setLoaded(false);
    if (!presenceKey) return;
    try {
      const raw = localStorage.getItem(presenceKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPresence;
        if (parsed.expiresAt && parsed.expiresAt <= Date.now()) {
          keepExpiryRunning(presenceKey, null);
          setPresence({ ...parsed, status: "Available for Collaboration", expiresAt: null });
        } else {
          keepExpiryRunning(presenceKey, parsed.expiresAt);
          setPresence(parsed);
        }
      } else {
        setPresence(DEFAULT_PRESENCE);
      }
    } catch {
      setPresence(DEFAULT_PRESENCE);
      keepExpiryRunning(presenceKey, null);
    }
    setLoaded(true);
  }, [presenceKey]);

  useEffect(() => {
    if (!loaded || !presenceKey) return;
    try {
      localStorage.setItem(presenceKey, JSON.stringify(presence));
      window.dispatchEvent(new Event("deg-pulse-change"));
    } catch {
      toast.error("Pulse could not save your status in this browser.");
    }
  }, [loaded, presenceKey, presence]);

  useEffect(() => {
    if (!presence.expiresAt) return;
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (presence.expiresAt && timestamp >= presence.expiresAt) {
        setPresence((current) => ({
          ...current,
          status: "Available for Collaboration",
          expiresAt: null,
        }));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [presence.expiresAt]);

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraOn]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);
  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  useEffect(() => {
    if (!presenceKey) return;
    const syncPresence = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(presenceKey) ?? "null",
        ) as StoredPresence | null;
        if (!saved) return;
        const next =
          saved.expiresAt && saved.expiresAt <= Date.now()
            ? { ...saved, status: "Available for Collaboration" as const, expiresAt: null }
            : saved;
        keepExpiryRunning(presenceKey, next.expiresAt);
        setPresence((current) =>
          current.status === next.status &&
          current.expiresAt === next.expiresAt &&
          current.checkedInAt === next.checkedInAt
            ? current
            : next,
        );
        if (next.status === "Offline") stopCamera();
      } catch {
        toast.error("Pulse could not refresh your saved status.");
      }
    };
    window.addEventListener("deg-pulse-change", syncPresence);
    window.addEventListener("storage", syncPresence);
    return () => {
      window.removeEventListener("deg-pulse-change", syncPresence);
      window.removeEventListener("storage", syncPresence);
    };
  }, [presenceKey, stopCamera]);

  async function toggleCamera() {
    if (cameraOn) {
      stopCamera();
      setCameraError(null);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable in this browser or connection.");
      return;
    }
    try {
      setCameraError(null);
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraOn(true);
    } catch {
      setCameraError("Camera access was not granted. You can try again when you are ready.");
    }
  }

  function updateStatus(status: WorkStatus, minutes?: number) {
    const timed = minutes !== undefined;
    const expiresAt = timed ? Date.now() + minutes * 60_000 : null;
    setPresence((current) => ({
      ...current,
      status,
      expiresAt,
    }));
    if (presenceKey) keepExpiryRunning(presenceKey, expiresAt);
  }

  const remain = presence.expiresAt
    ? Math.max(1, Math.ceil((presence.expiresAt - now) / 60_000))
    : null;
  const workState = !checkedIn
    ? null
    : ["Short Break", "Meal Break", "Offline"].includes(presence.status)
      ? "Away"
      : "At Work";
  const isSearchMatch =
    !memberSearch.trim() || displayName.toLowerCase().includes(memberSearch.trim().toLowerCase());

  return (
    <div className="space-y-5 animate-rise">
      <section
        className="surface -mx-4 -mt-8 overflow-hidden md:-mx-8 md:-mt-10"
        aria-label="Pulse work controls"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-sidebar px-4 py-2 text-sidebar-foreground">
          <div className="flex items-center gap-2 border-r border-sidebar-border pr-4">
            <span className="text-sm font-medium">Live video feed</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
              title={cameraOn ? "Turn camera off" : "Turn camera on"}
              onClick={() => void toggleCamera()}
            >
              {cameraOn ? <CameraOff /> : <Camera />}
            </Button>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Status:</span>
            <StatusPicker
              value={presence.status}
              disabled={presence.status === "Offline"}
              onSelect={updateStatus}
            />
            {remain && (
              <span className="text-xs text-muted-foreground">{remain} min remaining</span>
            )}
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Close Pulse and return Home"
            title="Close Pulse"
            className="ml-auto"
          >
            <Link to="/app">
              <X aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 border-b border-border p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 text-lg font-semibold">
                  {workspace?.name ?? "Workspace"}
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem disabled>
                  {workspace?.name ?? "No workspace selected"}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Departments are not configured</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-muted-foreground">
              Department member directory is not configured
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={() =>
                toast.info("Meet Now requires a meeting provider, which is not configured.")
              }
            >
              <Video aria-hidden="true" />
              Meet Now
              <ChevronDown aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.info(
                  "Scheduling requires a calendar or meeting provider, which is not configured.",
                )
              }
            >
              <CalendarDays aria-hidden="true" />
              Schedule Meeting
              <ChevronDown aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="border-b border-border p-4">
          <label className="sr-only" htmlFor="pulse-member-search">
            Search department members
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pulse-member-search"
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search for department members"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 bg-muted/30 p-4 xl:grid-cols-3">
          <PresencePanel
            title="At Work"
            icon={<BriefcaseBusiness />}
            empty={!isSearchMatch || workState !== "At Work"}
            emptyText={
              isSearchMatch ? "No team directory is connected." : "No members match this search."
            }
          >
            <MemberRow
              name={displayName}
              initials={initials}
              detail={presence.status}
              checkedInAt={presence.checkedInAt}
            />
          </PresencePanel>
          <PresencePanel
            title="Away"
            icon={<Users />}
            empty={!isSearchMatch || workState !== "Away"}
            emptyText={
              isSearchMatch ? "No team directory is connected." : "No members match this search."
            }
          >
            <MemberRow
              name={displayName}
              initials={initials}
              detail={presence.status}
              checkedInAt={presence.checkedInAt}
            />
          </PresencePanel>
          <PresencePanel
            title="Meetings"
            icon={<CalendarDays />}
            empty
            emptyText="No meeting provider or meeting history is connected."
          />
        </div>
        {cameraOn && (
          <div className="border-t border-border p-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="aspect-video max-h-64 rounded-lg bg-muted object-cover"
              aria-label="Your live camera preview"
            />
          </div>
        )}
        {cameraError && (
          <p role="alert" className="px-4 pb-3 text-sm text-destructive">
            {cameraError}
          </p>
        )}
      </section>

      <section
        className="surface flex flex-wrap items-center justify-between gap-3 p-4"
        aria-label="Work session"
      >
        <div>
          <h2 className="font-semibold">Work session</h2>
          <p className="text-sm text-muted-foreground">
            {checkedIn
              ? `Checked in ${new Date(presence.checkedInAt!).toLocaleString()}`
              : "Not checked in"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={checkedIn ? "outline" : "default"}
            onClick={() =>
              setPresence((current) => ({
                ...current,
                checkedInAt: current.checkedInAt ? null : Date.now(),
              }))
            }
          >
            {checkedIn ? <LogOut aria-hidden="true" /> : <LogIn aria-hidden="true" />}
            {checkedIn ? "Check Out" : "Check In"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Work session options">
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() =>
                  toast.info(
                    checkedIn
                      ? `Your session started ${new Date(presence.checkedInAt!).toLocaleString()}.`
                      : "You have no active work session.",
                  )
                }
              >
                Work session details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="flex w-full items-start gap-2 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
          <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Your status and check-in are saved in this browser for this user and workspace. Shared
          Supabase presence and attendance storage are not configured. DND cannot suppress app
          notifications until a notification service is connected. Closing Pulse leaves the work
          session and timer unchanged.
        </p>
      </section>
    </div>
  );
}

function StatusPicker({
  value,
  disabled,
  onSelect,
}: {
  value: WorkStatus;
  disabled: boolean;
  onSelect: (status: WorkStatus, minutes?: number) => void;
}) {
  const choices: { label: WorkStatus; icon: ReactNode; duration?: boolean; minutes?: number }[] = [
    { label: "Available for Collaboration", icon: <Users /> },
    { label: "Engaged at Work", icon: <BriefcaseBusiness /> },
    { label: "Meal Break", icon: <Coffee />, duration: true, minutes: 60 },
    { label: "Short Break", icon: <Clock3 />, duration: true },
    { label: "Do Not Disturb", icon: <Moon />, duration: true },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} className="gap-2">
          {value}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {choices.map((choice) =>
          choice.duration ? (
            <div key={choice.label}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {choice.label}
              </div>
              {(choice.minutes ? [choice.minutes] : DURATIONS).map((minutes) => (
                <DropdownMenuItem key={minutes} onSelect={() => onSelect(choice.label, minutes)}>
                  {choice.icon}
                  {choice.label} · {minutes} minutes
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <DropdownMenuItem key={choice.label} onSelect={() => onSelect(choice.label)}>
              {choice.icon}
              {choice.label}
              {value === choice.label && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PresencePanel({
  title,
  icon,
  empty,
  emptyText,
  children,
}: {
  title: string;
  icon: ReactNode;
  empty: boolean;
  emptyText: string;
  children?: ReactNode;
}) {
  return (
    <section className="surface min-h-48 overflow-hidden">
      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3 font-semibold">
        {icon}
        {title}
      </h2>
      {empty ? <p className="px-4 py-6 text-sm text-muted-foreground">{emptyText}</p> : children}
    </section>
  );
}

function MemberRow({
  name,
  initials,
  detail,
  checkedInAt,
}: {
  name: string;
  initials: string;
  detail: string;
  checkedInAt: number | null;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {detail}
          {checkedInAt
            ? ` · Since ${new Date(checkedInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : ""}
        </p>
      </div>
    </div>
  );
}

