import { createFileRoute } from "@tanstack/react-router";
import { FileText, Folder, Lock, StickyNote, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/ui";
import { documents } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/documents")({
  head: () => pageHead("Documents", "Private files and shared notes, with access checked on every file."),
  component: DocumentsPage,
});

function iconFor(size: string) {
  if (size.startsWith("Folder")) return Folder;
  if (size === "Note") return StickyNote;
  return FileText;
}

function DocumentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        module="documents"
        title="Documents"
        description="Files & notes"
        actions={<Button onClick={() => toast("Uploads are part of phase 4.")}><Upload /> Upload</Button>}
      />
      <ul className="surface divide-y divide-border overflow-hidden">
        {documents.map((d) => {
          const Icon = iconFor(d.size);
          return (
            <li key={d.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="size-5" /></span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.owner} · {d.size} · updated {d.updated}</p>
                </div>
              </div>
              <Badge variant={d.access === "Only me" ? "highlight" : "outline"}>
                {d.access === "Only me" && <Lock className="size-3" />}
                {d.access}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
