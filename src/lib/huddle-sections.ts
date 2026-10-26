import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  NotebookPen,
  MessagesSquare,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";

export const HUDDLE_SECTIONS: {
  key: string;
  label: string;
  icon: LucideIcon;
  setup: string;
}[] = [
  {
    key: "chats",
    label: "Hive",
    icon: MessagesSquare,
    setup:
      "Persistent conversations and message membership tables are not configured in the connected Supabase project. The existing Chats route and behavior remain unchanged.",
  },
  {
    key: "channels",
    label: "Channels",
    icon: UsersRound,
    setup:
      "Channel membership, public discovery, and private-channel row-level security are not configured yet.",
  },
  {
    key: "meetings",
    label: "Meetings",
    icon: Video,
    setup:
      "No meeting provider is configured. Huddle will not request camera or microphone access until a real meeting provider is connected.",
  },
  {
    key: "contacts",
    label: "Contacts",
    icon: Users,
    setup:
      "The current workspace schema stores member IDs and roles, but not a Huddle contact directory or presence data.",
  },
  {
    key: "files",
    label: "Files",
    icon: FileText,
    setup:
      "Huddle does not have a private message-attachments storage bucket or access policies yet.",
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    setup:
      "Personal and team calendars will appear here when calendar and event storage is configured.",
  },
  {
    key: "history",
    label: "History",
    icon: Clock3,
    setup:
      "Conversation and meeting history will be available after the corresponding Huddle records are persisted.",
  },
  {
    key: "reminders",
    label: "Reminders",
    icon: Bell,
    setup: "Huddle reminder records and notifications are not configured yet.",
  },
  {
    key: "notebooks",
    label: "Notebooks",
    icon: NotebookPen,
    setup: "Huddle notebooks are not connected to persistent storage yet.",
  },
  {
    key: "team-availability",
    label: "Team Availability",
    icon: CalendarDays,
    setup:
      "The workspace currently has no shared presence records or employee directory. Pulse stores only your own status in this browser.",
  },
  {
    key: "availability",
    label: "Pulse",
    icon: BriefcaseBusiness,
    setup:
      "No presence or availability provider is configured, so this page does not invent online states.",
  },
];
