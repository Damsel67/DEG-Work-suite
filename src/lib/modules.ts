import command from "@/assets/icons/deg-module-command.svg";
import projects from "@/assets/icons/deg-module-orbit.svg";
import tasks from "@/assets/icons/deg-module-tasks.svg";
import relations from "@/assets/icons/deg-module-relations.svg";
import support from "@/assets/icons/deg-module-support.svg";
import finance from "@/assets/icons/deg-module-finance.svg";
import automations from "@/assets/icons/deg-module-automations.svg";
import people from "@/assets/icons/deg-module-people.svg";
import documents from "@/assets/icons/deg-module-documents.svg";
import messages from "@/assets/icons/deg-module-messages.svg";
import insights from "@/assets/icons/deg-module-insights.svg";
import moments from "@/assets/icons/deg-module-moments.svg";
import type { LucideIcon } from "lucide-react";
import { MessagesSquare, Orbit } from "lucide-react";

export type ModuleKey =
  | "nexa"
  | "projects"
  | "tasks"
  | "relations"
  | "support"
  | "finance"
  | "automations"
  | "people"
  | "documents"
  | "huddle"
  | "insights"
  | "moments";

export type ModuleMeta = {
  key: ModuleKey;
  name: string;
  short: string;
  description: string;
  icon: string;
  Icon?: LucideIcon;
  status?: "Live" | "Prototype" | "Setup needed" | "Provider needed";
  to:
    | "/app/nexa"
    | "/app/projects"
    | "/app/tasks"
    | "/app/relations"
    | "/app/support"
    | "/app/finance"
    | "/app/automations"
    | "/app/people"
    | "/app/documents"
    | "/app"
    | "/app/insights"
    | "/app/moments";
  group: "intelligence" | "work" | "customers" | "operations" | "human";
};

export const MODULES: ModuleMeta[] = [
  {
    key: "nexa",
    name: "Nexa",
    short: "AI assistance · Planning · Automation",
    description:
      "A workspace assistant for thinking, drafting, and approved next steps. AI provider setup is required before it can respond.",
    icon: command,
    Icon: Orbit,
    status: "Provider needed",
    to: "/app/nexa",
    group: "intelligence",
  },
  {
    key: "projects",
    name: "Orbit",
    short: "Projects, tasks & workflows",
    description:
      "Manage projects, tasks, deadlines, milestones, dependencies, and workflow progress.",
    icon: projects,
    status: "Live",
    to: "/app/projects",
    group: "work",
  },
  {
    key: "tasks",
    name: "Tasks",
    short: "To-dos",
    description: "Assign, prioritise and complete the day's work with status everyone can trust.",
    icon: tasks,
    status: "Live",
    to: "/app/tasks",
    group: "work",
  },
  {
    key: "documents",
    name: "Documents",
    short: "Files & notes",
    description: "Private files and shared notes with access checked on every path.",
    icon: documents,
    status: "Prototype",
    to: "/app/documents",
    group: "work",
  },
  {
    key: "huddle",
    name: "Huddle",
    short: "Your team's office, everywhere",
    description: "Team conversations and collaboration. Messaging storage is not configured yet.",
    icon: messages,
    Icon: MessagesSquare,
    status: "Setup needed",
    to: "/app",
    group: "work",
  },
  {
    key: "relations",
    name: "Relations",
    short: "Clients & CRM",
    description: "Contacts, companies and deals with a history of every interaction.",
    icon: relations,
    status: "Prototype",
    to: "/app/relations",
    group: "customers",
  },
  {
    key: "support",
    name: "Support",
    short: "Tickets",
    description: "Service requests with owners, SLA timestamps and unmistakable internal notes.",
    icon: support,
    status: "Prototype",
    to: "/app/support",
    group: "customers",
  },
  {
    key: "finance",
    name: "Finance",
    short: "Invoices",
    description: "Invoices and payments that reconcile to the records underneath.",
    icon: finance,
    status: "Prototype",
    to: "/app/finance",
    group: "operations",
  },
  {
    key: "automations",
    name: "Automations",
    short: "Flowline workflows",
    description: "Repeatable workflows with run history, retries and visible failure alerts.",
    icon: automations,
    status: "Prototype",
    to: "/app/automations",
    group: "operations",
  },
  {
    key: "insights",
    name: "Insights",
    short: "Reports",
    description: "Calm reports on delivery, customers and cash — traceable to source.",
    icon: insights,
    status: "Prototype",
    to: "/app/insights",
    group: "operations",
  },
  {
    key: "people",
    name: "People",
    short: "Team & roles",
    description: "Members, roles and invitations with secure workspace boundaries.",
    icon: people,
    status: "Prototype",
    to: "/app/people",
    group: "operations",
  },
  {
    key: "moments",
    name: "DEG Moments",
    short: "Private journal",
    description:
      "A quiet space to reflect. Private by default — never visible to admins or AI unless you share.",
    icon: moments,
    status: "Prototype",
    to: "/app/moments",
    group: "human",
  },
];

export const moduleByKey = (k: ModuleKey) => MODULES.find((m) => m.key === k)!;

export const NAV_GROUPS: { label: string; keys: ModuleKey[] }[] = [
  { label: "Intelligence", keys: ["nexa"] },
  { label: "Work", keys: ["projects", "tasks", "documents"] },
  { label: "Customers", keys: ["relations", "support"] },
  { label: "Operations", keys: ["finance", "automations", "insights", "people"] },
  { label: "Personal", keys: ["moments"] },
];
