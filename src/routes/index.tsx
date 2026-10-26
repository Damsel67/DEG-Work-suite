import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Orbit,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { WorkspaceProvider, useWorkspace } from "@/lib/supabase/workspace-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEG WorkSuite — Your office, handled." },
      { name: "description", content: "One calm workspace for your projects and tasks, with a clear next step." },
      { property: "og:title", content: "DEG WorkSuite" },
      { property: "og:description",
        content: "" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "DEG WorkSuite" },
      { property: "og:url", content: "https://deg-work-suite.vercel.app/" },
      { property: "og:image", content: "https://deg-work-suite.vercel.app/og-image-v4.png" },
      { property: "og:image:secure_url", content: "https://deg-work-suite.vercel.app/og-image-v4.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "DEG WorkSuite arch logo with name below" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://deg-work-suite.vercel.app/og-image-v4.png" },
    ],
  }),
  component: LandingPage,
});

type LandingModule = { name: string; desc: string; src?: string; Icon?: LucideIcon };
const definedModules = (items: (LandingModule | undefined)[]): LandingModule[] =>
  items.filter((item): item is LandingModule => item !== undefined);

const moduleItems: LandingModule[] = [
  { name: "Nexa", desc: "AI assistance, planning, and automation with human approval.", Icon: Orbit },
  { name: "Projects", desc: "Plan delivery with clear owners, members and permissions.", src: "ef51e44ac287d9931172bf849f70f8cf.svg" },
  { name: "Tasks", desc: "Capture work, set priorities and keep due dates in view.", src: "898a5ff99d514a3c12f431ea02a2ffa0.svg" },
  { name: "Relations", desc: "Contacts, companies and every interaction in one record.", src: "f3b5223f87e03604a146fdc4844083ea.svg" },
  { name: "Support", desc: "Tickets, with internal notes kept apart from client replies.", src: "42e9db5826d48089d034eb0bcd93d953.svg" },
  { name: "Finance", desc: "Draft invoices with explicit currency, tax and due dates.", src: "06e90d2270f9198be07f7a3b7f1eb450.svg" },
  { name: "Automations", desc: "Flowline workflows, tested safely before they go live.", src: "d3b42609e5831102a5479ea903722483.svg" },
  { name: "People", desc: "Your team, their roles and who can see what.", src: "defdfdef76382dea83a158f3b011e0a5.svg" },
  { name: "Documents", desc: "Files in private storage, shared only with who you choose.", src: "4343debd56bc220aa75a0d3070ecd4c2.svg" },
  { name: "Huddle", desc: "Your team's office, everywhere.", Icon: MessagesSquare },
  { name: "Insights", desc: "Priorities, risk and automation health at a glance.", src: "c352e1099b2a47ac0c489901146b27e1.svg" },
  { name: "DEG Moments", desc: "A private journal and a quiet space to reflect.", src: "6c9b86dec83cc54ae4dccc6c7b8316ca.svg" },
];

const problems = [
  { n: "01", title: "Scattered tools", body: "Projects, email, chat, customer records, finance and files all live in different places." },
  { n: "02", title: "Manual coordination", body: "Status reports, follow-ups, handovers and reminders get repeated by hand, week after week." },
  { n: "03", title: "AI that cannot safely act", body: "Assistants answer questions, but cannot be trusted to carry out work across your tools." },
  { n: "04", title: "No single view", body: "Priorities, risk, client work and automation health are hard to see in one place." },
];

const commandSteps = [
  { n: "01", title: "Ask in plain language", body: "When connected, Nexa will help turn a question into a clear next step." },
  { n: "02", title: "Work within your access", body: "Nexa is designed to respect the records and workspace permissions you already have." },
  { n: "03", title: "Review before action", body: "Consequential changes will require your confirmation before anything is saved or sent." },
  { n: "04", title: "Keep a clear record", body: "Approved actions should be traceable to the person who confirmed them." },
];

const audiences = [
  { title: "Freelancers and solo professionals", need: "Spend less time switching tools and doing admin.", use: "tasks, client records, AI summaries and follow-ups." },
  { title: "Small agencies and service businesses", need: "Coordinate clients, projects and delivery in one place.", use: "CRM, project execution, support and automated reporting." },
  { title: "Operations and support teams", need: "Respond more consistently and hand work over cleanly.", use: "shared tickets, SOP memory and SLA alerts." },
  { title: "Growing teams", need: "Govern AI use and standardise how work gets done.", use: "roles, approvals, audit trails and reporting." },
];

const trustItems = [
  { title: "Approval first", body: "The assistant drafts and proposes. Nothing runs until you say so." },
  { title: "Permission-aware", body: "Search and AI only reach what each person is already allowed to see." },
  { title: "Private by default", body: "DEG Moments stays yours, out of reach of employers and admins." },
  { title: "Clearly labelled tests", body: "Test runs are marked, so they never look like the real thing." },
];

const trustChecks = [
  "Each organisation’s data isolated at the database layer.",
  "Permissions checked on the server for every consequential action.",
  "AI provider keys and secrets never exposed in the browser.",
  "An audit log for approvals, permission changes and financial actions.",
  "Private journal kept out of admin reporting and company-wide search.",
  "Backups and recovery tested before launch.",
];

type Project = { id: string; name: string };
type WorkspaceTask = { id: string; title: string; project_id: string; is_completed: boolean; created_at: string };

const asset = (name: string) => `/landing-v2/assets/${name}`;

function LandingModuleMark({ module, className }: { module: LandingModule; className?: string }) {
  const Icon = module.Icon;
  if (Icon) return <Icon className={className} strokeWidth={1.8} aria-hidden="true" />;
  return module.src ? <img className={className} src={asset(module.src)} alt="" /> : null;
}

function LandingPage() {
  return (
    <div className="landing-v2 min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="landing-v2__glow" aria-hidden="true" />
      <div className="landing-v2__aura" aria-hidden="true">
        <svg viewBox="0 0 1200 900" role="presentation">
          <path className="landing-v2__aura-glow" d="M200 900 V600 A400 400 0 0 1 1000 600 V900" />
          <path className="landing-v2__aura-line landing-v2__aura-line--pale" d="M40 900 V600 A560 560 0 0 1 1160 600 V900" />
          <path className="landing-v2__aura-line landing-v2__aura-line--gold" d="M160 900 V600 A440 440 0 0 1 1040 600 V900" />
          <path className="landing-v2__aura-line landing-v2__aura-line--clay" d="M280 900 V600 A320 320 0 0 1 920 600 V900" />
          <path className="landing-v2__aura-line landing-v2__aura-line--inner" d="M400 900 V600 A200 200 0 0 1 800 600 V900" />
        </svg>
      </div>

      <AnnouncementBar />
      <Header />
      <main id="top" className="relative z-10">
        <Hero />
        <ModuleMarquee />
        <ProblemSection />
        <PillarsSection />
        <MeetNexaSection />
        <CommandStepsSection />
        <ModulesSection />
        <ExpressionsSection />
        <AudienceSection />
        <TrustSection />
        <StartSection />
      </main>
      <Footer />
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="landing-v2__announcement">
      <span className="landing-v2__announcement-badge">FIRST RELEASE</span>
      <span>Workspaces, projects, and tasks: a focused start to your work.</span>
      <a href="#platform">Explore the platform <ArrowRight aria-hidden="true" /></a>
    </div>
  );
}

function Header() {
  return (
    <header className="landing-v2__header">
      <Link to="/" aria-label="DEG WorkSuite home" className="landing-v2__brand"><Logo surface="onDark" className="h-[42px]" /></Link>
      <nav className="landing-v2__nav" aria-label="Primary navigation">
        <a href="#platform">Platform <ChevronDown aria-hidden="true" /></a>
        <a href="#modules">Modules <ChevronDown aria-hidden="true" /></a>
        <a href="#who">Who it’s for <ChevronDown aria-hidden="true" /></a>
        <a href="#trust">Privacy and trust</a>
      </nav>
      <div className="landing-v2__header-actions">
        <Link to="/app" className="landing-v2__text-link">Sign in</Link>
        <Link to="/app" className="landing-v2__button landing-v2__button--clay">Get started</Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="landing-v2__hero" aria-labelledby="landing-title">
      <div className="landing-v2__eyebrow-pill"><img src={asset("ebdefcb52570a1bad6e2c73edc95f9e8.svg")} alt="" /> <span>Your office powered by intelligence</span></div>
      <h1 id="landing-title">Your office,<br /><span className="landing-v2__shine">handled.</span></h1>
      <p className="landing-v2__hero-copy">Keep your projects and daily tasks together in one calm workspace, with a clear next step whenever you return.</p>
      <LiveWorkspacePanel />
    </section>
  );
}

function LiveWorkspacePanel() {
  return <WorkspaceProvider><LiveWorkspaceTasks /></WorkspaceProvider>;
}

function LiveWorkspaceTasks() {
  const { user, workspace, loading, loadError, refresh } = useWorkspace();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [panelError, setPanelError] = useState("");

  const loadProjects = useCallback(async () => {
    if (!workspace) {
      setProjects([]);
      setProjectId("");
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const nextProjects = (data ?? []) as Project[];
    setProjects(nextProjects);
    setPanelError("");
    setProjectId((current) => nextProjects.some((project) => project.id === current) ? current : (nextProjects[0]?.id ?? ""));
  }, [supabase, workspace]);

  useEffect(() => {
    let active = true;
    void loadProjects().catch((error: unknown) => {
      if (active) setPanelError(error instanceof Error ? error.message : "Could not load your projects.");
    });
    return () => { active = false; };
  }, [loadProjects]);

  useEffect(() => {
    let active = true;
    if (!projectId) {
      setTasks([]);
      return () => { active = false; };
    }
    const taskRequest = (supabase
      .from("tasks")
      .select("id, title, project_id, is_completed, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      ) as unknown as Promise<{ data: WorkspaceTask[] | null; error: Error | null }>;
    void taskRequest.then(({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        setTasks((data ?? []) as WorkspaceTask[]);
        setPanelError("");
      })
      .catch((error: unknown) => {
        if (active) setPanelError(error instanceof Error ? error.message : "Could not load your tasks.");
      });
    return () => { active = false; };
  }, [projectId, supabase]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId || !title.trim()) return;
    setBusy(true);
    setPanelError("");
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ project_id: projectId, title: title.trim() })
        .select("id, title, project_id, is_completed, created_at")
        .single();
      if (error) throw error;
      setTasks((current) => [data as WorkspaceTask, ...current]);
      setTitle("");
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : "Could not save your task.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(task: WorkspaceTask) {
    setSavingTaskId(task.id);
    setPanelError("");
    const completed = !task.is_completed;
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null })
        .eq("id", task.id);
      if (error) throw error;
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, is_completed: completed } : item));
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : "Could not update this task.");
    } finally {
      setSavingTaskId(null);
    }
  }

  const completedCount = tasks.filter((task) => task.is_completed).length;
  const content = loading ? (
    <div className="landing-v2__live-message" aria-busy="true"><span className="landing-v2__live-dot" />Preparing your workspace.</div>
  ) : loadError ? (
    <div className="landing-v2__live-message"><p>We couldn’t connect to your workspace.</p><button type="button" className="landing-v2__button landing-v2__button--outline" onClick={() => void refresh().catch(() => undefined)}>Try again</button></div>
  ) : !user ? (
    <div className="landing-v2__live-empty"><h3>Sign in to work on your projects.</h3><p>Your saved projects and tasks will appear here.</p><Link to="/app" className="landing-v2__button landing-v2__button--clay">Sign in to your workspace <ArrowRight aria-hidden="true" /></Link></div>
  ) : !workspace ? (
    <div className="landing-v2__live-empty"><h3>Create your workspace to get started.</h3><p>Your work will be saved to your private account.</p><Link to="/app" className="landing-v2__button landing-v2__button--clay">Create workspace <ArrowRight aria-hidden="true" /></Link></div>
  ) : projects.length === 0 ? (
    <div className="landing-v2__live-empty"><h3>Your workspace is ready for a project.</h3><p>Create a project, then add and complete its tasks here.</p><Link to="/app/projects" className="landing-v2__button landing-v2__button--clay">Create your first project <ArrowRight aria-hidden="true" /></Link></div>
  ) : (
    <>
      <div className="landing-v2__live-controls">
        <label htmlFor="landing-project">Project</label>
        <select id="landing-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <span>{completedCount} of {tasks.length} complete</span>
      </div>
      <ul className="landing-v2__task-list" aria-label="Tasks in selected project">
        {tasks.length === 0 && <li className="landing-v2__task-empty">No tasks yet. Add the next step below.</li>}
        {tasks.map((task) => <li key={task.id}>
          <input className="landing-v2__task-checkbox" type="checkbox" checked={task.is_completed} disabled={savingTaskId === task.id} onChange={() => void toggleTask(task)} aria-label={`${task.is_completed ? "Reopen" : "Complete"} ${task.title}`} />
          <span className={task.is_completed ? "is-complete" : ""}>{task.title}</span>
        </li>)}
      </ul>
      <form className="landing-v2__task-form" onSubmit={addTask}>
        <input required maxLength={240} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task to this project" aria-label="New task title" />
        <button type="submit" disabled={busy || !title.trim()} className="landing-v2__button landing-v2__button--clay">{busy ? "Saving…" : "Add task"} <ArrowRight aria-hidden="true" /></button>
      </form>
      <p className="landing-v2__live-footnote">Changes are saved to your signed-in workspace.</p>
    </>
  );

  return (
    <section id="how" className="landing-v2__live" aria-labelledby="live-title">
      <div className="landing-v2__live-header">
        <div><p className="landing-v2__live-kicker">Your workspace</p><h2 id="live-title">Projects and tasks</h2></div>
        {user && workspace && <span className="landing-v2__live-connected"><i />Connected</span>}
      </div>
      {panelError && <p className="landing-v2__live-error" role="alert">{panelError}</p>}
      {content}
    </section>
  );
}

function ModuleMarquee() {
  return (
    <section className="landing-v2__marquee" aria-label="DEG WorkSuite modules">
      <div className="landing-v2__marquee-track" aria-hidden="true">
        {[...moduleItems, ...moduleItems].map((module, index) => <div className="landing-v2__marquee-item" key={`${module.name}-${index}`}><LandingModuleMark module={module} className="size-5" /><span>{module.name}</span></div>)}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <div className="landing-v2__section-heading"><p className="landing-v2__eyebrow">{eyebrow}</p><h2>{title}</h2>{body && <p className="landing-v2__section-copy">{body}</p>}</div>;
}

function ProblemSection() {
  return (
    <section className="landing-v2__section">
      <SectionHeading eyebrow="The problem" title="Work is scattered across too many places." body="Every tool does its own job well enough. The cost is in the gaps between them." />
      <div className="landing-v2__problem-grid">{problems.map((problem) => <article className="landing-v2__card" key={problem.n}><span className="landing-v2__number">{problem.n}</span><h3>{problem.title}</h3><p>{problem.body}</p></article>)}</div>
    </section>
  );
}

function PillarsSection() {
  const workIcons = definedModules([moduleItems[1], moduleItems[2], moduleItems[9], moduleItems[3], moduleItems[4], moduleItems[5], moduleItems[7], moduleItems[8]]);
  const intelligenceIcons = definedModules([moduleItems[0], moduleItems[6], moduleItems[10]]);
  const momentsModule = moduleItems[11];
  return (
    <section id="platform" className="landing-v2__section">
      <SectionHeading eyebrow="One workspace" title="Run your work. Let intelligence help. Keep room for people." />
      <div className="landing-v2__pillars">
        <article className="landing-v2__pillar landing-v2__pillar--pine"><span className="landing-v2__number">01</span><h3>Run your work</h3><p>Manage work and operations in one place, with the same navigation and permissions everywhere.</p><div className="landing-v2__pillar-icons">{workIcons.map((item) => <LandingModuleMark key={item.name} module={item} className="size-8" />)}</div></article>
        <article className="landing-v2__pillar"><span className="landing-v2__number">02</span><h3>Let intelligence help</h3><p>Nexa is being prepared for permission-aware assistance with a human approval step.</p><div className="landing-v2__tags"><span>Nexa setup required</span><span>Human approval</span><span>Permission-aware</span></div><div className="landing-v2__pillar-icons">{intelligenceIcons.map((item) => <LandingModuleMark key={item.name} module={item} className="size-8" />)}</div></article>
        <article className="landing-v2__pillar landing-v2__pillar--aubergine"><span className="landing-v2__number">03</span><h3>Make room for people</h3><p>Protect the human and creative side of work, in a space that is yours alone.</p><div className="landing-v2__tags"><span>Private journal</span><span>Reflection</span><span>Inspiration</span><span>Creative studio</span></div><div className="landing-v2__pillar-icons">{momentsModule && <LandingModuleMark module={momentsModule} className="size-8" />}</div></article>
      </div>
    </section>
  );
}

function MeetNexaSection() {
  return (
    <section id="nexa" className="landing-v2__section">
      <div className="grid items-center gap-7 border-y border-border py-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14 md:py-16">
        <div className="flex items-center gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-pine text-stone md:size-20">
            <Orbit className="size-9" strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div>
            <p className="landing-v2__eyebrow">Meet Nexa</p>
            <p className="mt-1 text-sm text-muted-foreground">AI assistance · Planning · Automation</p>
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl font-light leading-tight tracking-[-0.025em] md:text-5xl">
            Meet Nexa. Your intelligence, amplified.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Meet the AI assistant built to help you think clearly, move faster, and get more from every workday. From organizing ideas to turning conversations into actionable next steps, Nexa brings intelligence closer to the work that matters.
          </p>
          <p className="mt-4 text-sm font-medium text-olive">
            Nexa is not connected to an AI provider yet, so it will not generate or send anything.
          </p>
          <Link to="/app/nexa" className="landing-v2__button landing-v2__button--clay mt-6 inline-flex">
            Meet Nexa <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CommandStepsSection() {
  return (
    <section className="landing-v2__steps-section">
      <div className="landing-v2__section">
        <SectionHeading eyebrow="Nexa, by design" title="Helpful intelligence, with you in the loop." body="Nexa is not connected to an AI provider yet. These are the safeguards that will shape its experience when setup is complete." />
        <div className="landing-v2__steps">{commandSteps.map((step) => <article key={step.n}><span>{step.n}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section id="modules" className="landing-v2__section">
      <SectionHeading eyebrow="The modules" title="Everything your office runs on, in one place." />
      <div className="landing-v2__modules">{moduleItems.map((module) => <article className="landing-v2__module-card" key={module.name}><LandingModuleMark module={module} className="size-10" /><div><h3>{module.name}</h3><p>{module.desc}</p></div></article>)}</div>
    </section>
  );
}

function ExpressionsSection() {
  const botanical = ["#203B32", "#77764B", "#E8E0D2", "#B99553", "#302C25"];
  const moments = ["#503047", "#B76E52", "#D8C2AE", "#C18D91", "#302724"];
  return (
    <section className="landing-v2__section">
      <SectionHeading eyebrow="One brand. Two expressions." title="Serious at work. Personal where it counts." />
      <div className="landing-v2__expressions">
        <article className="landing-v2__expression landing-v2__expression--pine"><p className="landing-v2__eyebrow">Botanical Estate</p><h3>The core workspace</h3><p>Grounded, calm and capable. Projects, clients, support, finance and automation, with a quiet hierarchy that keeps the work in front.</p><div className="landing-v2__swatches" aria-label="Botanical Estate palette">{botanical.map((color) => <span key={color} style={{ backgroundColor: color }} />)}</div></article>
        <article className="landing-v2__expression landing-v2__expression--aubergine"><p className="landing-v2__eyebrow">Modern Art Residence</p><h3>DEG Moments</h3><p>Warm, expressive and personal. A private journal, reflection, inspiration and a creative studio. Private by default, and kept out of admin reporting and company search.</p><div className="landing-v2__swatches" aria-label="Modern Art Residence palette">{moments.map((color) => <span key={color} style={{ backgroundColor: color }} />)}</div></article>
      </div>
      <p className="landing-v2__expression-note">Shared typography, navigation, accessibility and privacy standards keep the two expressions one coherent product.</p>
    </section>
  );
}

function AudienceSection() {
  return (
    <section id="who" className="landing-v2__section">
      <SectionHeading eyebrow="Who it’s for" title="Built for people who run the work themselves." />
      <div className="landing-v2__audiences">{audiences.map((audience) => <article className="landing-v2__card landing-v2__audience" key={audience.title}><h3>{audience.title}</h3><p>{audience.need}</p><div><strong>Starts with: </strong>{audience.use}</div></article>)}</div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="trust" className="landing-v2__section">
      <SectionHeading eyebrow="Privacy and trust" title="Designed so you stay in charge." />
      <div className="landing-v2__trust-grid">{trustItems.map((item) => <article className="landing-v2__card" key={item.title}><ShieldCheck aria-hidden="true" /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      <div className="landing-v2__trust-checks">{trustChecks.map((text) => <div key={text}><Check aria-hidden="true" /><span>{text}</span></div>)}</div>
      <p className="landing-v2__trust-note">These are design requirements for the build. DEG WorkSuite does not claim any security or compliance certification, and none will be claimed until it is independently verified.</p>
    </section>
  );
}

function StartSection() {
  return (
    <section className="landing-v2__section landing-v2__start-section">
      <div className="landing-v2__start-card">
        <div className="landing-v2__start-arches" aria-hidden="true"><svg viewBox="0 0 512 512"><path d="M40 512 V300 A216 216 0 0 1 472 300 V512" /><path d="M110 512 V300 A146 146 0 0 1 402 300 V512" /><path d="M180 512 V300 A76 76 0 0 1 332 300 V512" /></svg></div>
        <div className="landing-v2__start-copy"><p className="landing-v2__eyebrow">Start here</p><h2>Start with one workflow.</h2><p>The first release focuses on workspaces, projects and tasks. Sign in, create your workspace, and take your next task from open to done.</p></div>
        <Link to="/app" className="landing-v2__button landing-v2__button--clay landing-v2__start-button">Create your workspace <ArrowRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="landing-v2__footer">
      <div className="landing-v2__footer-main">
        <div className="landing-v2__footer-brand"><Link to="/" aria-label="DEG WorkSuite home"><Logo surface="onDark" className="h-10" /></Link><p>Your Office Powered by Intelligence.</p></div>
        <div className="landing-v2__footer-links">
          <nav aria-label="Product links"><h2>Product</h2><Link to="/app">Huddle</Link><Link to="/app/nexa">Nexa</Link><a href="#modules">Modules</a><a href="#platform">DEG Moments</a></nav>
          <nav aria-label="Company links"><h2>Company</h2><a href="#who">Who it’s for</a><Link to="/app">Create workspace</Link></nav>
          <nav aria-label="Trust links"><h2>Trust</h2><a href="#trust">Privacy and trust</a><a href="#trust">Security approach</a></nav>
        </div>
      </div>
      <div className="landing-v2__footer-bottom"><span>© {new Date().getFullYear()} DEG WorkSuite. The first release focuses on workspaces, projects and tasks.</span><Link to="/app">Sign in <ArrowRight aria-hidden="true" /></Link></div>
    </footer>
  );
}

