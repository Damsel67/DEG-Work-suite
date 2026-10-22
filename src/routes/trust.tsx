import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, FileClock, KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Privacy & trust — DEG WorkSuite" },
      {
        name: "description",
        content:
          "How DEG WorkSuite is designed to protect your data: approval-first AI, workspace isolation, audit logs and journals private by default.",
      },
      { property: "og:title", content: "Privacy & trust — DEG WorkSuite" },
      { property: "og:description", content: "Approval-first AI, workspace isolation, audit trails and private journals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrustPage,
});

const PRINCIPLES = [
  { icon: ShieldCheck, title: "No silent AI actions", body: "DEG Command proposes. A person with the right permission approves. Rejected or expired proposals never run." },
  { icon: Eye, title: "Answers show their sources", body: "Every AI answer links to the exact records and files it used — and only ones you are allowed to open." },
  { icon: KeyRound, title: "Workspaces never mix", body: "Each organisation's data is kept separate, and switching workspace reloads only what you are authorised to see." },
  { icon: FileClock, title: "Everything important is logged", body: "Approvals, exports, role changes and sensitive edits record who did what, and when." },
  { icon: Lock, title: "Journals stay yours", body: "DEG Moments entries are excluded from admin views and AI unless you explicitly share them." },
  { icon: UserCheck, title: "Clear roles", body: "Owners, admins, members and guests each see a defined set of controls — no unexplained buttons." },
];

function TrustPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pt-24">
        <p className="eyebrow">Privacy & trust</p>
        <h1 className="mt-5 max-w-3xl font-display text-5xl font-light leading-tight md:text-6xl">
          Capable, and careful with what it’s trusted with.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          These are the design commitments the product is being built to. They describe how DEG WorkSuite is intended to
          work, and will be verified before launch.
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-24 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="surface p-7">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <p.icon className="size-5" />
            </span>
            <h2 className="mt-6 text-lg font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </section>
      <section className="bg-pine text-stone">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-16 md:flex-row md:items-center md:px-8">
          <h2 className="max-w-xl font-display text-3xl font-light md:text-4xl">See the approval flow for yourself.</h2>
          <Button asChild variant="onImage" size="lg">
            <Link to="/app/command">
              Open DEG Command <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
