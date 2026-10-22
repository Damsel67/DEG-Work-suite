// Prototype sample data. Nothing here is saved; it resets on reload.

export type Priority = "Urgent" | "High" | "Normal" | "Low";
export type TaskStatus = "To do" | "In progress" | "In review" | "Done";

export const people = [
  { id: "p1", name: "Adaeze Okafor", role: "Owner", title: "Managing Director", initials: "AO", status: "Active" },
  { id: "p2", name: "Tunde Bakare", role: "Admin", title: "Operations Lead", initials: "TB", status: "Active" },
  { id: "p3", name: "Kemi Adeyemi", role: "Member", title: "Project Manager", initials: "KA", status: "Active" },
  { id: "p4", name: "Ifeanyi Eze", role: "Member", title: "Account Manager", initials: "IE", status: "Active" },
  { id: "p5", name: "Zainab Musa", role: "Member", title: "Finance Officer", initials: "ZM", status: "Active" },
  { id: "p6", name: "Chidi Nwosu", role: "Guest", title: "External Designer", initials: "CN", status: "Invited" },
];

export const projects = [
  { id: "pr1", name: "Lekki office fit-out", client: "Harbour & Vale", owner: "Kemi Adeyemi", progress: 72, status: "On track", due: "14 Nov 2026", tasks: 24 },
  { id: "pr2", name: "Q4 brand refresh", client: "Internal", owner: "Adaeze Okafor", progress: 45, status: "At risk", due: "30 Nov 2026", tasks: 18 },
  { id: "pr3", name: "Client portal pilot", client: "Meridian Foods", owner: "Tunde Bakare", progress: 30, status: "On track", due: "12 Dec 2026", tasks: 31 },
  { id: "pr4", name: "Annual report 2026", client: "Internal", owner: "Zainab Musa", progress: 88, status: "On track", due: "05 Nov 2026", tasks: 12 },
  { id: "pr5", name: "Abuja expansion study", client: "Okoye Holdings", owner: "Ifeanyi Eze", progress: 15, status: "Blocked", due: "20 Jan 2027", tasks: 9 },
];

export const tasks: {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  due: string;
}[] = [
  { id: "t1", title: "Confirm joinery measurements with contractor", project: "Lekki office fit-out", assignee: "Kemi Adeyemi", priority: "Urgent", status: "In progress", due: "Today" },
  { id: "t2", title: "Draft weekly status report for Harbour & Vale", project: "Lekki office fit-out", assignee: "Kemi Adeyemi", priority: "High", status: "In review", due: "Tomorrow" },
  { id: "t3", title: "Review logo usage across slide templates", project: "Q4 brand refresh", assignee: "Chidi Nwosu", priority: "Normal", status: "To do", due: "28 Oct" },
  { id: "t4", title: "Set up SLA timers for portal requests", project: "Client portal pilot", assignee: "Tunde Bakare", priority: "High", status: "To do", due: "29 Oct" },
  { id: "t5", title: "Reconcile September supplier payments", project: "Annual report 2026", assignee: "Zainab Musa", priority: "Urgent", status: "In progress", due: "Today" },
  { id: "t6", title: "Collect market data for Abuja study", project: "Abuja expansion study", assignee: "Ifeanyi Eze", priority: "Normal", status: "To do", due: "02 Nov" },
  { id: "t7", title: "Approve final paint palette", project: "Lekki office fit-out", assignee: "Adaeze Okafor", priority: "Low", status: "Done", due: "20 Oct" },
  { id: "t8", title: "Write onboarding guide for pilot users", project: "Client portal pilot", assignee: "Tunde Bakare", priority: "Normal", status: "In progress", due: "31 Oct" },
];

export const contacts = [
  { id: "c1", name: "Folake Adebayo", company: "Harbour & Vale", stage: "Active client", value: 18_500_000, owner: "Ifeanyi Eze", last: "Call · 2 days ago" },
  { id: "c2", name: "Emeka Obi", company: "Meridian Foods", stage: "Proposal", value: 9_200_000, owner: "Ifeanyi Eze", last: "Email · today" },
  { id: "c3", name: "Hauwa Bello", company: "Okoye Holdings", stage: "Discovery", value: 24_000_000, owner: "Adaeze Okafor", last: "Meeting · last week" },
  { id: "c4", name: "Segun Lawal", company: "Brightwater Clinics", stage: "Negotiation", value: 6_750_000, owner: "Ifeanyi Eze", last: "Call · yesterday" },
  { id: "c5", name: "Ngozi Umeh", company: "Atlas Logistics", stage: "Lead", value: 3_100_000, owner: "Tunde Bakare", last: "Form · 3 days ago" },
];

export const pipelineStages = ["Lead", "Discovery", "Proposal", "Negotiation", "Active client"] as const;

export const tickets = [
  { id: "SR-1042", subject: "Cannot access shared project files", requester: "Meridian Foods", priority: "High" as Priority, status: "Open", owner: "Tunde Bakare", sla: "2h left" },
  { id: "SR-1041", subject: "Request for revised fit-out timeline", requester: "Harbour & Vale", priority: "Normal" as Priority, status: "Waiting on client", owner: "Kemi Adeyemi", sla: "Paused" },
  { id: "SR-1039", subject: "Invoice INV-0318 shows wrong address", requester: "Brightwater Clinics", priority: "Normal" as Priority, status: "Open", owner: "Zainab Musa", sla: "6h left" },
  { id: "SR-1036", subject: "Portal password reset not arriving", requester: "Atlas Logistics", priority: "Urgent" as Priority, status: "Open", owner: "Tunde Bakare", sla: "Overdue 30m" },
  { id: "SR-1030", subject: "Add two new client contacts", requester: "Okoye Holdings", priority: "Low" as Priority, status: "Resolved", owner: "Ifeanyi Eze", sla: "Met" },
  { id: "SR-1028", subject: "Clarify scope of phase two", requester: "Harbour & Vale", priority: "High" as Priority, status: "Resolved", owner: "Kemi Adeyemi", sla: "Met" },
];

/** Amounts are stored in kobo (minor units) to avoid rounding errors. */
export const invoices = [
  { id: "INV-0321", customer: "Harbour & Vale", issued: "18 Oct 2026", due: "17 Nov 2026", totalMinor: 650_000_000, paidMinor: 0, status: "Issued" },
  { id: "INV-0320", customer: "Meridian Foods", issued: "12 Oct 2026", due: "11 Nov 2026", totalMinor: 230_000_000, paidMinor: 115_000_000, status: "Part paid" },
  { id: "INV-0318", customer: "Brightwater Clinics", issued: "02 Oct 2026", due: "16 Oct 2026", totalMinor: 145_000_000, paidMinor: 0, status: "Overdue" },
  { id: "INV-0315", customer: "Okoye Holdings", issued: "20 Sep 2026", due: "20 Oct 2026", totalMinor: 480_000_000, paidMinor: 480_000_000, status: "Paid" },
  { id: "INV-0322", customer: "Atlas Logistics", issued: "—", due: "—", totalMinor: 92_500_000, paidMinor: 0, status: "Draft" },
];

export const formatNaira = (minor: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(minor / 100);

export const automations = [
  { id: "a1", name: "New portal request → create ticket", trigger: "Client portal form", lastRun: "4 min ago", runs: 312, success: 99, status: "Healthy" },
  { id: "a2", name: "Overdue invoice reminder", trigger: "Daily · 09:00 WAT", lastRun: "Today 09:00", runs: 58, success: 100, status: "Healthy" },
  { id: "a3", name: "Weekly status digest to clients", trigger: "Fridays · 16:00 WAT", lastRun: "Last Friday", runs: 21, success: 95, status: "Needs approval" },
  { id: "a4", name: "Sync contacts from Google Workspace", trigger: "Every hour", lastRun: "1 hr ago", runs: 740, success: 88, status: "Failing" },
];

export const documents = [
  { id: "d1", name: "Harbour & Vale — scope of works v3.pdf", owner: "Kemi Adeyemi", access: "Project team", updated: "Today", size: "2.4 MB" },
  { id: "d2", name: "Q4 brand guidelines.pdf", owner: "Adaeze Okafor", access: "Whole workspace", updated: "Yesterday", size: "8.1 MB" },
  { id: "d3", name: "Supplier contracts 2026", owner: "Zainab Musa", access: "Finance only", updated: "3 days ago", size: "Folder · 14 files" },
  { id: "d4", name: "Pilot onboarding notes", owner: "Tunde Bakare", access: "Project team", updated: "Last week", size: "Note" },
  { id: "d5", name: "Board meeting minutes — Sept", owner: "Adaeze Okafor", access: "Only me", updated: "Last month", size: "Note" },
];

export const threads = [
  { id: "m1", title: "Lekki fit-out", last: "Kemi: joinery arrives Thursday, I'll confirm by noon.", unread: 3, time: "10:42" },
  { id: "m2", title: "Finance", last: "Zainab: September reconciliation is nearly done.", unread: 1, time: "09:15" },
  { id: "m3", title: "Portal pilot", last: "Tunde: SLA timers are live on staging.", unread: 0, time: "Yesterday" },
  { id: "m4", title: "Leadership", last: "Adaeze: let's review Abuja next Monday.", unread: 0, time: "Mon" },
];

export const threadMessages = [
  { from: "Kemi Adeyemi", initials: "KA", text: "Contractor confirmed the joinery delivery for Thursday morning.", time: "10:31" },
  { from: "Adaeze Okafor", initials: "AO", text: "Great. Can we make sure the client walkthrough is still Friday?", time: "10:36" },
  { from: "Kemi Adeyemi", initials: "KA", text: "Yes — I'll confirm by noon and update the weekly status report.", time: "10:42" },
];

export const journal = [
  { id: "j1", date: "Thursday, 22 October", prompt: "What gave you energy today?", body: "The walkthrough with Folake went better than I expected. Slowing down to listen changed the whole conversation.", mood: "Grateful" },
  { id: "j2", date: "Tuesday, 20 October", prompt: "What would make tomorrow lighter?", body: "Blocking the morning for deep work and leaving messages until 11.", mood: "Calm" },
];

export const reflectionPrompts = [
  "What gave you energy today?",
  "What is one thing you'd like to let go of this week?",
  "Who helped you recently, and how?",
  "What would make tomorrow lighter?",
  "What did you learn about how you work best?",
];

export const proposals = [
  {
    id: "pp1",
    title: "Send weekly status report to Harbour & Vale",
    summary: "Draft compiled from 9 completed tasks, 2 open risks and the latest site photos.",
    steps: [
      "Generate report from Lekki office fit-out (tasks closed since 15 Oct)",
      "Attach scope of works v3.pdf",
      "Email Folake Adebayo from kemi@deg.example",
    ],
    affects: "1 email · 1 document shared externally",
    sources: ["Lekki office fit-out", "Scope of works v3.pdf", "SR-1041"],
    risk: "External send",
  },
  {
    id: "pp2",
    title: "Reassign 3 overdue tasks from Ifeanyi to Tunde",
    summary: "Ifeanyi is on leave until 3 Nov. Tunde has capacity on the portal pilot.",
    steps: ["Reassign t6, t3 and one Abuja task", "Notify both people", "Log change in activity history"],
    affects: "3 tasks · 2 notifications",
    sources: ["Tasks", "People — leave calendar"],
    risk: "Internal change",
  },
];
