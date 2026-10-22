import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, FileText, Paperclip, Pencil, Send, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel } from "@/components/app/ui";
import { proposals as seed } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/command")({
  head: () => pageHead("DEG Command", "Ask DEG about your work, inspect its sources and approve proposed actions."),
  component: CommandPage,
});

type Msg = { role: "you" | "deg"; text: string; sources?: string[] };
type Decision = "pending" | "approved" | "rejected";

const SUGGESTIONS = ["What's at risk this week?", "Summarise SR-1036", "Which invoices are overdue?"];

function answerFor(q: string): Msg {
  const l = q.toLowerCase();
  if (l.includes("invoice"))
    return { role: "deg", text: "One invoice is overdue: INV-0318 for Brightwater Clinics (₦1,450,000, due 16 Oct). INV-0320 for Meridian Foods is half paid.", sources: ["INV-0318", "INV-0320"] };
  if (l.includes("1036"))
    return { role: "deg", text: "SR-1036: Atlas Logistics can't receive portal password resets. It's urgent, owned by Tunde Bakare and 30 minutes past its SLA.", sources: ["SR-1036"] };
  return {
    role: "deg",
    text: "Two things need attention: the Abuja expansion study is blocked on market data, and the Q4 brand refresh is at risk with 55% left and five weeks to go. I'm less certain about the brand refresh — two tasks have no due date.",
    sources: ["Abuja expansion study", "Q4 brand refresh", "Tasks"],
  };
}

function CommandPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "deg", text: "Good afternoon. I can read the projects, tasks and records you have access to. I'll always show my sources and ask before taking any action." },
  ]);
  const [draft, setDraft] = useState("");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "you", text: q }, answerFor(q)]);
    setDraft("");
  };

  const decide = (id: string, d: Decision) => {
    setDecisions((s) => ({ ...s, [id]: d }));
    toast(d === "approved" ? "Approved — action logged" : "Rejected — nothing was run", {
      description: d === "approved" ? "In the live product this runs once on the server and is recorded in the audit log." : "The proposal was declined and will not execute.",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader module="command" title="DEG Command" description="Ask, inspect the evidence, then approve." />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Ask DEG" className="flex flex-col">
          <div className="flex-1 space-y-4 p-5">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "you" ? "flex justify-end" : "flex"}>
                <div
                  className={
                    m.role === "you"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground"
                      : "max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm"
                  }
                >
                  {m.role === "deg" && (
                    <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Sparkles className="size-3 text-highlight" /> DEG
                    </span>
                  )}
                  <p className="leading-relaxed">{m.text}</p>
                  {m.sources && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.sources.map((s) => (
                        <Badge key={s} variant="outline" className="bg-card font-medium">
                          <FileText className="size-3" /> {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {m.role === "deg" && i > 0 && (
                    <div className="mt-2 flex gap-1">
                      <button aria-label="Helpful" className="rounded p-1 text-muted-foreground hover:text-foreground" onClick={() => toast("Thanks for the feedback")}><ThumbsUp className="size-3.5" /></button>
                      <button aria-label="Not helpful" className="rounded p-1 text-muted-foreground hover:text-foreground" onClick={() => toast("Thanks for the feedback")}><ThumbsDown className="size-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-accent">
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex items-end gap-2"
            >
              <Button type="button" variant="ghost" size="icon" aria-label="Attach context" onClick={() => toast("Attach permitted files or records — coming in a later phase.")}>
                <Paperclip />
              </Button>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(draft);
                  }
                }}
                placeholder="Ask DEG about your work…"
                aria-label="Ask DEG"
                className="min-h-[44px] resize-none bg-background"
                rows={1}
              />
              <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()}>
                <Send />
              </Button>
            </form>
          </div>
        </Panel>

        <div className="space-y-5">
          <h2 className="eyebrow">Approval queue</h2>
          {seed.map((p) => {
            const d = decisions[p.id] ?? "pending";
            return (
              <article key={p.id} className="surface p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={p.risk === "External send" ? "warning" : "muted"}>{p.risk}</Badge>
                  {d !== "pending" && <Badge variant={d === "approved" ? "success" : "danger"}>{d === "approved" ? "Approved" : "Rejected"}</Badge>}
                </div>
                <h3 className="mt-3 font-semibold leading-snug">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
                <ol className="mt-4 space-y-1.5 text-sm">
                  {p.steps.map((s, i) => (
                    <li key={s} className="flex gap-2">
                      <span className="font-display text-highlight">{i + 1}</span> {s}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-muted-foreground">Affects: {p.affects}</p>
                <p className="mt-1 text-xs text-muted-foreground">Sources: {p.sources.join(" · ")}</p>
                {d === "pending" && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => decide(p.id, "approved")}><Check /> Approve and run</Button>
                    <Button size="sm" variant="outline" onClick={() => decide(p.id, "rejected")}><X /> Reject</Button>
                    <Button size="sm" variant="ghost" onClick={() => toast("Edited steps are re-checked before approval.")}><Pencil /> Edit steps</Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
