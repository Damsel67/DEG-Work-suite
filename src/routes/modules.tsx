import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { MODULES, NAV_GROUPS, moduleByKey } from "@/lib/modules";

export const Route = createFileRoute("/modules")({
  head: () => ({
    meta: [
      { title: "Modules — DEG WorkSuite" },
      {
        name: "description",
        content:
          "Twelve connected modules: DEG Command, Projects, Tasks, Relations, Support, Finance, Automations, People, Documents, Messages, Insights and DEG Moments.",
      },
      { property: "og:title", content: "Modules — DEG WorkSuite" },
      { property: "og:description", content: "Every DEG WorkSuite module, from projects and CRM to finance and a private journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-24">
        <p className="eyebrow">Modules</p>
        <h1 className="mt-5 max-w-3xl font-display text-5xl font-light leading-tight md:text-6xl">
          One family of tools, sharing one arch.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {MODULES.length} modules built on the same navigation, permissions and audit trail — so adding one never means
          learning a new product.
        </p>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-5 pb-24 md:px-8">
        {NAV_GROUPS.map((g) => (
          <section key={g.label} className={g.label === "Personal" ? "moments rounded-3xl bg-background p-6 md:p-10" : ""}>
            <h2 className="eyebrow">{g.label}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {g.keys.map((k) => {
                const m = moduleByKey(k);
                return (
                  <Link
                    key={k}
                    to={m.to}
                    className="surface group flex items-start gap-5 p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <img src={m.icon} alt="" width={512} height={512} loading="lazy" className="size-16 shrink-0 rounded-[26%]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">{m.name}</h3>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{m.short}</p>
                      <p className="mt-3 text-sm leading-relaxed">{m.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
