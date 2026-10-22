import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, Lock, ShieldCheck, Sparkles, X } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArchMark } from "@/components/brand/Logo";
import { MODULES } from "@/lib/modules";
import heroImg from "@/assets/hero-residence.jpg";
import momentsImg from "@/assets/moments-still.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEG WorkSuite — Your office, powered by intelligence" },
      {
        name: "description",
        content:
          "Projects, clients, support, finance and an AI assistant that asks before it acts — in one calm, private workspace.",
      },
      { property: "og:title", content: "DEG WorkSuite — Your office, powered by intelligence" },
      {
        property: "og:description",
        content: "One calm, private workspace for your whole office — with AI that asks before it acts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <Expressions />
      <ModulesGrid />
      <CommandSection />
      <MomentsSection />
      <ClosingCta />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="animate-rise">
          <p className="eyebrow">Your office, powered by intelligence</p>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.02] text-foreground md:text-7xl">
            A private residence <br className="hidden md:block" />
            for <em className="font-normal italic text-primary">your whole office.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Projects, clients, support, finance and documents in one calm workspace — with an AI assistant
            that shows its sources and waits for your approval before it does anything.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/app">
                Walk through the prototype <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <Link to="/modules">See every module</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Approval before every AI action</li>
            <li className="flex items-center gap-2"><Lock className="size-4 text-primary" /> Journals private by default</li>
          </ul>
        </div>

        <div className="relative animate-fade">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-lift">
            <img
              src={heroImg}
              alt="A deep green study with an arched doorway, a wooden desk and olive branches in a clay vase"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="surface absolute -bottom-6 left-0 w-[290px] p-5 md:-left-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-highlight" /> DEG Command · proposal
            </div>
            <p className="mt-2 font-semibold leading-snug">Send weekly status report to Harbour &amp; Vale</p>
            <p className="mt-1 text-xs text-muted-foreground">Draft ready · 3 sources · review before sending</p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <Check className="size-3" /> Approve
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold">
                <X className="size-3" /> Reject
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Expressions() {
  return (
    <section className="border-y border-border bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">One brand. Two expressions.</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-light md:text-5xl">
              Grounded for the work. Warm for the person doing it.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            The same navigation, type and privacy standards everywhere — with a different atmosphere for operations and
            for reflection.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <ExpressionCard
            className="bg-pine text-stone"
            label="Botanical Estate"
            use="Core workspace — projects, clients, finance, automation"
            swatches={["bg-pine ring-1 ring-stone/30", "bg-olive", "bg-stone", "bg-ochre", "bg-bark"]}
          />
          <ExpressionCard
            className="bg-aubergine text-cream"
            label="Modern Art Residence"
            use="DEG Moments — reflection, journal, inspiration"
            swatches={["bg-aubergine ring-1 ring-cream/30", "bg-clay", "bg-claybeige", "bg-rose", "bg-espresso"]}
            tone="moments"
          />
        </div>
      </div>
    </section>
  );
}

function ExpressionCard({
  className,
  label,
  use,
  swatches,
  tone = "botanical",
}: {
  className: string;
  label: string;
  use: string;
  swatches: string[];
  tone?: "botanical" | "moments";
}) {
  return (
    <div className={`grain relative overflow-hidden rounded-3xl p-8 md:p-10 ${className}`}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Expression</p>
          <h3 className="mt-3 font-display text-3xl">{label}</h3>
          <p className="mt-2 max-w-xs text-sm opacity-80">{use}</p>
        </div>
        <ArchMark tone={tone} className="dark h-20 w-20 shrink-0 [&_.stroke-foreground]:stroke-current" />
      </div>
      <div className="mt-10 flex gap-2">
        {swatches.map((s) => (
          <span key={s} className={`h-10 flex-1 rounded-full ${s}`} />
        ))}
      </div>
    </div>
  );
}

function ModulesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow">Twelve modules, one family</p>
        <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">Everything the office runs on.</h2>
        <p className="mt-4 text-muted-foreground">
          Start with the work you do every day, then switch on clients, support, finance and automation as you grow.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        {MODULES.map((m) => (
          <Link key={m.key} to={m.to} className="group">
            <img
              src={m.icon}
              alt=""
              width={512}
              height={512}
              loading="lazy"
              className="aspect-square w-full max-w-[120px] rounded-[26%] shadow-soft transition-transform duration-300 group-hover:-translate-y-1"
            />
            <p className="mt-4 font-semibold">{m.name}</p>
            <p className="text-sm text-muted-foreground">{m.short}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

const FLOW = [
  { k: "Ask", d: "Ask DEG in plain language — it only sees what you are allowed to see." },
  { k: "Sources", d: "Every answer cites the projects, files and records it used." },
  { k: "Proposal", d: "Actions arrive as a reviewable plan with exact changes and recipients." },
  { k: "Approve", d: "Nothing runs until you approve. Reject, edit or let it expire." },
  { k: "Logged", d: "Who approved what, and the outcome, is recorded for audit." },
];

function CommandSection() {
  return (
    <section className="bg-pine text-stone">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre">DEG Command</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            AI that asks <em className="italic">before</em> it acts.
          </h2>
          <p className="mt-5 max-w-md text-stone/80">
            No silent actions. DEG Command reads, cites and proposes — you stay the one who decides.
          </p>
          <Button asChild variant="onImage" size="lg" className="mt-9">
            <Link to="/app/command">
              Try DEG Command <ArrowRight />
            </Link>
          </Button>
        </div>
        <ol className="space-y-px overflow-hidden rounded-3xl border border-stone/15">
          {FLOW.map((f, i) => (
            <li key={f.k} className="flex gap-5 bg-stone/[0.04] p-5 md:p-6">
              <span className="font-display text-2xl text-ochre">0{i + 1}</span>
              <div>
                <p className="font-semibold">{f.k}</p>
                <p className="mt-1 text-sm text-stone/75">{f.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MomentsSection() {
  return (
    <section className="moments bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 md:px-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">DEG Moments</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            A quiet room inside a busy office.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            A private journal, daily reflection and saved inspiration. Your entries are excluded from admin views and AI
            unless you choose to share them.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge variant="outline"><Lock className="size-3" /> Private by default</Badge>
            <Badge variant="outline"><FileText className="size-3" /> Daily prompts</Badge>
            <Badge variant="outline"><Sparkles className="size-3" /> Explicit sharing only</Badge>
          </div>
          <Button asChild variant="hero" size="lg" className="mt-9">
            <Link to="/app/moments">
              Open DEG Moments <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="order-1 lg:order-2">
          <div className="mx-auto aspect-[6/7] max-w-[480px] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-lift">
            <img
              src={momentsImg}
              alt="An open journal on aubergine velvet beside a clay cup and dried roses"
              width={1200}
              height={1408}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 text-center md:px-8">
      <ArchMark className="mx-auto h-16 w-16" />
      <h2 className="mx-auto mt-8 max-w-3xl font-display text-4xl font-light md:text-6xl">
        Step inside the workspace.
      </h2>
      <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
        The prototype uses sample data so you can click through every module. Nothing you do there is saved.
      </p>
      <div className="mt-9 flex justify-center">
        <Button asChild variant="hero" size="xl">
          <Link to="/app">
            Open the prototype <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
