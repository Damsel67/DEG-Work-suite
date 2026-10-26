import { describe, expect, it } from "vitest";
import { getPostAuthenticationPath } from "@/lib/auth-routing";

describe("post-authentication destination", () => {
  it("uses the central DEG dashboard for the public sign-in entry", () => {
    expect(getPostAuthenticationPath("/app", "?returnTo=%2Fapp%2Fdashboard")).toBe(
      "/app/dashboard",
    );
    expect(getPostAuthenticationPath("/app", "")).toBe("/app/dashboard");
  });

  it("returns users to a same-site application they opened directly", () => {
    expect(getPostAuthenticationPath("/app/projects", "")).toBe("/app/projects");
    expect(getPostAuthenticationPath("/app", "?returnTo=%2Fapp%2Ftasks%3Fview%3Dtoday")).toBe(
      "/app/tasks?view=today",
    );
  });

  it("rejects untrusted external return destinations", () => {
    expect(getPostAuthenticationPath("/app", "?returnTo=%2F%2Fevil.example%2Flogin")).toBe(
      "/app/dashboard",
    );
    expect(getPostAuthenticationPath("/app", "?returnTo=https%3A%2F%2Fevil.example")).toBe(
      "/app/dashboard",
    );
  });
});
