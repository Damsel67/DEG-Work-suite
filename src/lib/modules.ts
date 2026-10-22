import command from "@/assets/icons/deg-module-command.svg";
import projects from "@/assets/icons/deg-module-projects.svg";
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

export type ModuleKey =
  | "command"
  | "projects"
  | "tasks"
  | "relations"
  | "support"
  | "finance"
  | "automations"
  | "people"
  | "documents"
  | "messages"
  | "insights"
  | "moments";

export type ModuleMeta = {
  key: ModuleKey;
  name: string;
  short: string;
  description: string;
  icon: string;
  to:
    | "/app/command"
    | "/app/projects"
    | "/app/tasks"
    | "/app/relations"
    | "/app/support"
    | "/app/finance"
    | "/app/automations"
    | "/app/people"
    | "/app/documents"
    | "/app/messages"
    | "/app/insights"
    | "/app/moments";
  group: "intelligence" | "work" | "customers" | "operations" | "human";
};

export const MODULES: ModuleMeta[] = [
  {
    key: "command",
    name: "DEG Command",
    short: "Ask & approve",
    description: "Ask questions about your work, get sourced answers, and approve every proposed action before it runs.",
    icon: command,
    to: "/app/command",
    group: "intelligence",
  },
  {
    key: "projects",
    name: "Projects",
    short: "Delivery & boards",
    description: "Plan delivery with owners, milestones and a clear view of what is on track.",
    icon: projects,
    to: "/app/projects",
    group: "work",
  },
  {
    key: "tasks",
    name: "Tasks",
    short: "To-dos",
    description: "Assign, prioritise and complete the day's work with status everyone can trust.",
    icon: tasks,
    to: "/app/tasks",
    group: "work",
  },
  {
    key: "documents",
    name: "Documents",
    short: "Files & notes",
    description: "Private files and shared notes with access checked on every path.",
    icon: documents,
    to: "/app/documents",
    group: "work",
  },
  {
    key: "messages",
    name: "Messages",
    short: "Conversations",
    description: "Team conversations tied to the work they are about.",
    icon: messages,
    to: "/app/messages",
    group: "work",
  },
  {
    key: "relations",
    name: "Relations",
    short: "Clients & CRM",
    description: "Contacts, companies and deals with a history of every interaction.",
    icon: relations,
    to: "/app/relations",
    group: "customers",
  },
  {
    key: "support",
    name: "Support",
    short: "Tickets",
    description: "Service requests with owners, SLA timestamps and unmistakable internal notes.",
    icon: support,
    to: "/app/support",
    group: "customers",
  },
  {
    key: "finance",
    name: "Finance",
    short: "Invoices",
    description: "Invoices and payments that reconcile to the records underneath.",
    icon: finance,
    to: "/app/finance",
    group: "operations",
  },
  {
    key: "automations",
    name: "Automations",
    short: "Flowline workflows",
    description: "Repeatable workflows with run history, retries and visible failure alerts.",
    icon: automations,
    to: "/app/automations",
    group: "operations",
  },
  {
    key: "insights",
    name: "Insights",
    short: "Reports",
    description: "Calm reports on delivery, customers and cash — traceable to source.",
    icon: insights,
    to: "/app/insights",
    group: "operations",
  },
  {
    key: "people",
    name: "People",
    short: "Team & roles",
    description: "Members, roles and invitations with secure workspace boundaries.",
    icon: people,
    to: "/app/people",
    group: "operations",
  },
  {
    key: "moments",
    name: "DEG Moments",
    short: "Private journal",
    description: "A quiet space to reflect. Private by default — never visible to admins or AI unless you share.",
    icon: moments,
    to: "/app/moments",
    group: "human",
  },
];

export const moduleByKey = (k: ModuleKey) => MODULES.find((m) => m.key === k)!;

export const NAV_GROUPS: { label: string; keys: ModuleKey[] }[] = [
  { label: "Intelligence", keys: ["command"] },
  { label: "Work", keys: ["projects", "tasks", "documents", "messages"] },
  { label: "Customers", keys: ["relations", "support"] },
  { label: "Operations", keys: ["finance", "automations", "insights", "people"] },
  { label: "Personal", keys: ["moments"] },
];
