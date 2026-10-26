import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ModuleKey } from "@/lib/modules";
import { moduleByKey } from "@/lib/modules";
import { ModuleGlyph } from "@/components/app/ModuleGlyph";

export function PageHeader({
  module,
  title,
  description,
  actions,
}: {
  module?: ModuleKey;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const m = module ? moduleByKey(module) : undefined;
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="flex items-center gap-4">
        {m && <ModuleGlyph module={m} className="size-14 text-primary" />}
        <div>
          <h1 className="font-display text-3xl font-normal md:text-4xl">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, className }: { label: string; value: ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("surface p-5", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  "On track": "success",
  "At risk": "warning",
  Blocked: "danger",
  Done: "success",
  "In progress": "secondary",
  "In review": "warning",
  "To do": "muted",
  Open: "secondary",
  "Waiting on client": "muted",
  Resolved: "success",
  Issued: "secondary",
  "Part paid": "warning",
  Overdue: "danger",
  Paid: "success",
  Draft: "muted",
  Healthy: "success",
  "Needs approval": "warning",
  Failing: "danger",
  Active: "success",
  Invited: "muted",
  Urgent: "danger",
  High: "warning",
  Normal: "secondary",
  Low: "muted",
};

const STATUS_MARK: Record<string, string> = {
  Urgent: "▲▲",
  High: "▲",
  Normal: "■",
  Low: "▽",
};

/** Status uses text label + colour (+ a shape for priority) so colour is never the only signal. */
export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant={STATUS_VARIANT[value] ?? "outline"}>
      {STATUS_MARK[value] && <span aria-hidden className="text-[0.6rem]">{STATUS_MARK[value]}</span>}
      {value}
    </Badge>
  );
}

export function PrototypeNote() {
  return (
    <p className="text-xs text-muted-foreground">
      Prototype · sample data · changes reset when you reload
    </p>
  );
}

export function Initials({ name }: { name: string }) {
  const i = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.68rem] font-semibold text-secondary-foreground">
      {i}
    </span>
  );
}
