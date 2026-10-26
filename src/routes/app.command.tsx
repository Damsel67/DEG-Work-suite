import { createFileRoute, Navigate } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/command")({
  head: () => pageHead("Nexa", "Your intelligence, amplified."),
  component: RedirectToNexa,
});

function RedirectToNexa() {
  return <Navigate to="/app/nexa" replace />;
}
