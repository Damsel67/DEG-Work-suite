import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel } from "@/components/app/ui";
import { useTheme } from "@/lib/theme";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => pageHead("Settings", "Workspace, appearance and privacy preferences."),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Workspace and personal preferences" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Appearance">
          <div className="grid grid-cols-2 gap-3 p-5">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={cn("overflow-hidden rounded-xl border-2 text-left transition-colors", theme === t ? "border-primary" : "border-border")}
              >
                <div className={cn("flex h-24 gap-1.5 p-2", t === "dark" ? "bg-bark" : "bg-stone")}>
                  <div className="w-1/4 rounded-md bg-pine" />
                  <div className="flex-1 space-y-1.5">
                    <div className={cn("h-3 w-2/3 rounded", t === "dark" ? "bg-stone/30" : "bg-bark/20")} />
                    <div className={cn("h-8 rounded", t === "dark" ? "bg-stone/10" : "bg-cream")} />
                  </div>
                </div>
                <p className="px-3 py-2 text-sm font-semibold">{t === "light" ? "Light · warm stone" : "Dark · dark bark"}</p>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Workspace">
          <form
            className="space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Saved for this session");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="ws">Workspace name</Label>
              <Input id="ws" defaultValue="DEG Studio Lagos" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tz">Time zone</Label>
              <Input id="tz" defaultValue="Africa/Lagos (WAT, UTC+1)" className="bg-background" />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Panel>
        <Panel title="Privacy & AI" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {[
              { id: "ai-approval", label: "Require approval for every DEG Command action", desc: "Locked on — AI never acts silently.", on: true, locked: true },
              { id: "journal-ai", label: "Let DEG Command read my journal", desc: "Off by default. Moments stay private unless you share.", on: false },
              { id: "push", label: "Show message content in push notifications", desc: "Off by default to protect sensitive information.", on: false },
            ].map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-6 px-5 py-4">
                <div>
                  <Label htmlFor={s.id} className="font-semibold">{s.label}</Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.desc}</p>
                </div>
                <Switch id={s.id} defaultChecked={s.on} disabled={s.locked} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
