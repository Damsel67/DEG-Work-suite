import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatusBadge } from "@/components/app/ui";
import { formatNaira, invoices } from "@/lib/sample-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/finance")({
  head: () => pageHead("Finance", "Invoices and payments that reconcile to the records underneath."),
  component: FinancePage,
});

function FinancePage() {
  const issued = invoices.filter((i) => i.status !== "Draft");
  const outstanding = issued.reduce((s, i) => s + (i.totalMinor - i.paidMinor), 0);
  const received = issued.reduce((s, i) => s + i.paidMinor, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.totalMinor - i.paidMinor, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        module="finance"
        title="Finance"
        description="All amounts in Nigerian naira"
        actions={<Button onClick={() => toast("New invoice", { description: "Currency, line items, tax, due date and customer are required." })}><Plus /> New invoice</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding" value={formatNaira(outstanding)} hint="Issued, not yet paid" />
        <StatCard label="Received" value={formatNaira(received)} hint="Recorded payments" />
        <StatCard label="Overdue" value={formatNaira(overdue)} hint="Past due date" />
      </div>
      <div className="surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">Invoice</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Due</th>
              <th className="px-5 py-3 text-right font-semibold">Total</th>
              <th className="px-5 py-3 text-right font-semibold">Balance</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((i) => (
              <tr key={i.id} className="hover:bg-muted/50">
                <td className="px-5 py-3.5 font-semibold">{i.id}</td>
                <td className="px-5 py-3.5">{i.customer}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{i.due}</td>
                <td className="px-5 py-3.5 text-right tabular-nums">{formatNaira(i.totalMinor)}</td>
                <td className="px-5 py-3.5 text-right tabular-nums">{formatNaira(i.totalMinor - i.paidMinor)}</td>
                <td className="px-5 py-3.5"><StatusBadge value={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">“Paid” is worked out from recorded payments — it can’t be switched on by hand.</p>
    </div>
  );
}
