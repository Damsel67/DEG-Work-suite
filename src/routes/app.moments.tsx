import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/ui";
import { journal as seed, reflectionPrompts } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import momentsImg from "@/assets/moments-still.jpg";

export const Route = createFileRoute("/app/moments")({
  head: () => pageHead("DEG Moments", "A private journal and daily reflection. Private by default."),
  component: MomentsPage,
});

const MOODS = ["Calm", "Grateful", "Focused", "Tired", "Hopeful"];

function MomentsPage() {
  const [entries, setEntries] = useState(seed);
  const [promptIdx, setPromptIdx] = useState(0);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState("Calm");

  const save = () => {
    if (!body.trim()) return;
    setEntries((e) => [
      { id: `j${Date.now()}`, date: "Today", prompt: reflectionPrompts[promptIdx] ?? "", body: body.trim(), mood },
      ...e,
    ]);
    setBody("");
    toast.success("Saved to your private journal");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        module="moments"
        title="DEG Moments"
        description="A quiet space to reflect"
        actions={<Badge variant="outline" className="py-1"><Lock className="size-3" /> Private by default · not visible to admins or AI</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="surface p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow">Today’s reflection</p>
            <Button variant="ghost" size="sm" onClick={() => setPromptIdx((i) => (i + 1) % reflectionPrompts.length)}>
              <RefreshCw /> New prompt
            </Button>
          </div>
          <h2 className="mt-4 font-display text-3xl font-light italic md:text-4xl">{reflectionPrompts[promptIdx]}</h2>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write freely. Only you can read this."
            aria-label="Journal entry"
            className="mt-6 min-h-[160px] border-border bg-raised text-base leading-relaxed"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground">Mood</span>
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                aria-pressed={mood === m}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  mood === m ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={save} disabled={!body.trim()}>Save privately</Button>
          </div>
        </section>

        <div className="relative hidden overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-lift lg:block">
          <img src={momentsImg} alt="An open journal on aubergine velvet beside a clay cup" width={1200} height={1408} className="h-full w-full object-cover" />
        </div>
      </div>

      <section>
        <h2 className="eyebrow">My journal</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {entries.map((e) => (
            <article key={e.id} className="surface p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{e.date}</p>
                <Badge variant="highlight">{e.mood}</Badge>
              </div>
              <p className="mt-3 font-display text-lg italic text-muted-foreground">{e.prompt}</p>
              <p className="mt-2 leading-relaxed">{e.body}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Lock className="size-3" /> Only you</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast("Sharing asks you to choose exactly who can see this entry. Nothing is shared automatically.")}
                >
                  <Share2 /> Share…
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
