import { createFileRoute, Navigate } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/messages")({
  head: () => pageHead("Huddle", "Your team's office, everywhere."),
  component: RedirectToHuddle,
});

function RedirectToHuddle() {
  return <Navigate to="/app" replace />;
}
