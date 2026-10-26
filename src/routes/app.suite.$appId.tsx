import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CircleAlert,
  Cloud,
  FileSpreadsheet,
  FileText,
  ListChecks,
  PenLine,
  Presentation,
} from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

import sheetsIcon from "@/assets/icons/deg-app-sheets.svg";
import wordIcon from "@/assets/icons/deg-app-word.svg";
import powerpointIcon from "@/assets/icons/deg-app-powerpoint.svg";
import formsIcon from "@/assets/icons/deg-app-forms.svg";
import writerIcon from "@/assets/icons/deg-app-writer.svg";
import driveIcon from "@/assets/icons/deg-app-drive.svg";

const SUITE_APPS = {
  sheets: {
    name: "Sheets",
    description: "Organise information in spreadsheets, tables, and calculations.",
    icon: sheetsIcon,
    glyph: FileSpreadsheet,
    capabilities: ["Spreadsheets", "Tables", "Calculations"],
    status: "Spreadsheet editing and cloud saving are not connected yet.",
  },
  word: {
    name: "Word",
    description: "Create and edit polished documents for your work.",
    icon: wordIcon,
    glyph: FileText,
    capabilities: ["Documents", "Text formatting", "Cloud saving"],
    status: "Document editing and cloud saving are not connected yet.",
  },
  powerpoint: {
    name: "PowerPoint",
    description: "Build clear, presentation-ready decks.",
    icon: powerpointIcon,
    glyph: Presentation,
    capabilities: ["Presentations", "Slides", "Charts and visuals"],
    status: "Slide editing and cloud saving are not connected yet.",
  },
  forms: {
    name: "Forms",
    description: "Prepare simple forms and collect responses.",
    icon: formsIcon,
    glyph: ListChecks,
    capabilities: ["Form building", "Response collection", "Results"],
    status: "Form publishing and response storage are not connected yet.",
  },
  writer: {
    name: "Writer",
    description: "Shape ideas into well-crafted writing.",
    icon: writerIcon,
    glyph: PenLine,
    capabilities: ["Writing", "Page layout", "Document sharing"],
    status: "Writing and document saving are not connected yet.",
  },
  drive: {
    name: "Drive",
    description: "Keep work files organised in one place.",
    icon: driveIcon,
    glyph: Cloud,
    capabilities: ["File storage", "Folders", "Sharing"],
    status: "Secure file storage and sharing are not connected yet.",
  },
} as const;

type SuiteAppId = keyof typeof SUITE_APPS;

export const Route = createFileRoute("/app/suite/$appId")({
  head: ({ params }) => {
    const app = SUITE_APPS[params.appId as SuiteAppId];
    return pageHead(
      app ? app.name : "Application",
      app?.description ?? "DEG WorkSuite application.",
    );
  },
  component: SuiteAppPage,
});

function SuiteAppPage() {
  const { appId } = Route.useParams();
  const app = SUITE_APPS[appId as SuiteAppId];

  if (!app) {
    return (
      <section className="surface mx-auto max-w-2xl p-8 text-center">
        <CircleAlert className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl">Application not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose an app from the launcher to continue.
        </p>
        <Button asChild className="mt-6">
          <Link to="/app/dashboard">Return to DEG Workspace</Link>
        </Button>
      </section>
    );
  }

  const Glyph = app.glyph;
  return (
    <div className="space-y-7">
      <PageHeader
        title={app.name}
        description={app.description}
        actions={<Badge variant="outline">App preview</Badge>}
      />

      <section className="surface relative isolate overflow-hidden p-6 md:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 size-64 rounded-full border-[22px] border-primary/5"
        />
        <div className="flex flex-wrap items-center gap-5">
          <img src={app.icon} alt="" className="size-16 rounded-2xl" />
          <div className="min-w-0">
            <p className="eyebrow">DEG WORKSUITE APP</p>
            <h1 className="mt-1 font-display text-3xl md:text-4xl">{app.name}</h1>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          This is the {app.name} app entry in your DEG Workspace. Its editing and storage services
          are still being connected, so this preview does not save files or changes.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {app.capabilities.map((capability) => (
            <div
              key={capability}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/70 p-4"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Glyph className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium">{capability}</span>
            </div>
          ))}
        </div>
        <div
          role="status"
          className="mt-7 flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4"
        >
          <CircleAlert
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm leading-6 text-muted-foreground">{app.status}</p>
        </div>
      </section>

      <Button asChild variant="outline">
        <Link to="/app/dashboard">
          Return to DEG Workspace <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
