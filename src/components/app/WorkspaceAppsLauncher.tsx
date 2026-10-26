import { AppWindow } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWorkspace } from "@/lib/supabase/workspace-context";
import { MODULES } from "@/lib/modules";
import sheetsIcon from "@/assets/icons/deg-app-sheets.svg";
import wordIcon from "@/assets/icons/deg-app-word.svg";
import powerpointIcon from "@/assets/icons/deg-app-powerpoint.svg";
import formsIcon from "@/assets/icons/deg-app-forms.svg";
import driveIcon from "@/assets/icons/deg-app-drive.svg";
import writerIcon from "@/assets/icons/deg-app-writer.svg";
import documentsIcon from "@/assets/icons/deg-module-documents.svg";

type CatalogEntry = {
  key: string;
  name: string;
  description: string;
  icon: string;
  href?: string;
  permission?: "huddle" | "orbit" | "people";
  personal?: boolean;
  preview?: boolean;
  readiness?: string;
};

const APP_CATALOG: CatalogEntry[] = [
  ...MODULES.filter((module) => module.key !== "tasks").map((module): CatalogEntry => {
    const permission =
      module.key === "huddle"
        ? "huddle"
        : module.key === "projects"
          ? "orbit"
          : module.key === "people"
            ? "people"
            : undefined;
    const href = module.to;
    return {
      key: module.key,
      name: module.key === "projects" ? "Projects" : module.name,
      description: module.short,
      icon: module.key === "documents" ? documentsIcon : module.icon,
      ...(href ? { href } : {}),
      ...(permission ? { permission } : {}),
      ...(module.key === "moments" ? { personal: true } : {}),
      ...(module.status && module.status !== "Live" ? { preview: true } : {}),
      readiness:
        module.status === "Provider needed"
          ? "Provider setup needed"
          : module.status === "Setup needed"
            ? "Setup needed"
            : module.status === "Prototype"
              ? "Preview · sample data only"
              : "Not available yet",
    };
  }),
  {
    key: "sheets",
    name: "Sheets",
    description: "Spreadsheets and calculations",
    icon: sheetsIcon,
    href: "/app/suite/sheets",
    preview: true,
    readiness: "Preview · editing and saving are not connected",
  },
  {
    key: "word",
    name: "Word",
    description: "Document editing",
    icon: wordIcon,
    href: "/app/suite/word",
    preview: true,
    readiness: "Preview · editing and saving are not connected",
  },
  {
    key: "powerpoint",
    name: "PowerPoint",
    description: "Presentations",
    icon: powerpointIcon,
    href: "/app/suite/powerpoint",
    preview: true,
    readiness: "Preview · editing and saving are not connected",
  },
  {
    key: "forms",
    name: "Forms",
    description: "Forms and surveys",
    icon: formsIcon,
    href: "/app/suite/forms",
    preview: true,
    readiness: "Preview · publishing and responses are not connected",
  },
  {
    key: "writer",
    name: "Writer",
    description: "Writing and page layout",
    icon: writerIcon,
    href: "/app/suite/writer",
    preview: true,
    readiness: "Preview · editing and saving are not connected",
  },
  {
    key: "drive",
    name: "Drive",
    description: "Cloud file storage",
    icon: driveIcon,
    href: "/app/suite/drive",
    preview: true,
    readiness: "Preview · file storage is not connected",
  },
];

export function WorkspaceAppsLauncher({ className = "" }: { className?: string }) {
  const { enabledApps } = useWorkspace();
  const { pathname } = useLocation();
  const hasPermission = (app: CatalogEntry) =>
    app.personal === true || !app.permission || enabledApps.includes(app.permission);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open DEG applications"
          title="Applications"
          className={className}
        >
          <svg viewBox="0 0 20 20" className="size-[18px]" fill="currentColor" aria-hidden="true">
            {[3, 8, 13].flatMap((x) =>
              [3, 8, 13].map((y) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.7" />
              )),
            )}
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="max-h-[min(80vh,34rem)] w-[min(94vw,25rem)] overflow-y-auto rounded-xl border-border bg-card p-4 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">DEG applications</p>
            <p className="text-xs text-muted-foreground">
              Available apps open in this signed-in workspace.
            </p>
          </div>
          <AppWindow className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-3 gap-2" aria-label="Application catalog">
          {APP_CATALOG.map((app) => {
            const available = hasPermission(app);
            const disabledReason =
              app.permission && !enabledApps.includes(app.permission)
                ? "Not enabled for this account"
                : (app.readiness ?? "Not enabled for this account");
            const active =
              app.href === "/app"
                ? pathname === "/app" || pathname.startsWith("/app/huddle/")
                : pathname === app.href;
            const content = (
              <>
                <img src={app.icon} alt="" className="size-12 rounded-xl" />
                <span className="mt-1 line-clamp-1 text-[0.7rem] font-medium">{app.name}</span>
                {(!available || app.preview) && (
                  <span className="mt-0.5 line-clamp-1 text-[0.57rem] text-muted-foreground">
                    {available ? (app.readiness ?? "Preview") : disabledReason}
                  </span>
                )}
                {active && <span className="sr-only">Current application</span>}
              </>
            );
            return (
              <Link
                key={app.key}
                to={app.href as never}
                aria-current={active ? "page" : undefined}
                aria-label={`${app.name}${active ? ", current application" : ""}${available ? "" : `, ${disabledReason}`}`}
                title={`${app.description}${available ? "" : ` · ${disabledReason}`}`}
                className={`flex min-h-[6.7rem] flex-col items-center justify-center rounded-lg p-2 text-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-accent/70" : ""}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
