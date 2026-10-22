import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/ui";
import { threadMessages, threads } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/messages")({
  head: () => pageHead("Messages", "Team conversations tied to the work they are about."),
  component: MessagesPage,
});

function MessagesPage() {
  const [active, setActive] = useState(threads[0].id);
  const [msgs, setMsgs] = useState(threadMessages);
  const [text, setText] = useState("");

  return (
    <div className="space-y-8">
      <PageHeader module="messages" title="Messages" description="Conversations" />
      <div className="surface grid overflow-hidden md:grid-cols-[280px_1fr]">
        <ul className="divide-y divide-border border-b border-border md:border-b-0 md:border-r">
          {threads.map((t) => (
            <li key={t.id}>
              <button onClick={() => setActive(t.id)} className={cn("w-full px-4 py-3.5 text-left hover:bg-muted/60", active === t.id && "bg-muted")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold"># {t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.time}</span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{t.last}</p>
                {t.unread > 0 && <span className="mt-1 inline-block rounded-full bg-highlight px-2 text-xs font-semibold text-highlight-foreground">{t.unread} new</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex min-h-[460px] flex-col">
          <div className="border-b border-border px-5 py-3.5 font-semibold"># {threads.find((t) => t.id === active)?.title}</div>
          <div className="flex-1 space-y-4 p-5">
            {msgs.map((m, i) => (
              <div key={i} className="flex gap-3">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{m.initials}</span>
                <div>
                  <p className="text-sm"><span className="font-semibold">{m.from}</span> <span className="text-xs text-muted-foreground">{m.time}</span></p>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              setMsgs((m) => [...m, { from: "Adaeze Okafor", initials: "AO", text: text.trim(), time: "Now" }]);
              setText("");
            }}
            className="flex gap-2 border-t border-border p-4"
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" className="bg-background" />
            <Button type="submit" size="icon" aria-label="Send" disabled={!text.trim()}><Send /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
