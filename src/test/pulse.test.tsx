import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HUDDLE_SECTIONS } from "@/lib/huddle-sections";
import { RemoteWork } from "@/components/app/RemoteWork";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode;
    to: string;
    "aria-label"?: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/supabase/workspace-context", () => ({
  useWorkspace: () => ({
    user: { id: "user-test", email: "member@example.test", user_metadata: {} },
    workspace: { id: "workspace-test", name: "Damsel" },
  }),
}));

describe("Huddle naming", () => {
  it("renames the existing Chats and Remote Work entries without changing their routes", () => {
    expect(HUDDLE_SECTIONS.find((item) => item.key === "chats")?.label).toBe("Hive");
    expect(HUDDLE_SECTIONS.find((item) => item.key === "availability")?.label).toBe("Pulse");
  });
});

describe("Pulse", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("persists a timed short break for the current user and workspace", async () => {
    render(<RemoteWork />);
    const statusButton = await screen.findByRole("button", {
      name: /available for collaboration/i,
    });
    fireEvent.keyDown(statusButton, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("menuitem", { name: /short break · 30 minutes/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /short break/i })).toBeInTheDocument();
    });
    const saved = JSON.parse(localStorage.getItem("deg-pulse:workspace-test:user-test") ?? "{}");
    expect(saved.status).toBe("Short Break");
    expect(saved.expiresAt).toBeGreaterThan(Date.now());
  });

  it("checks in without requiring a meeting or leave provider", async () => {
    render(<RemoteWork />);
    fireEvent.click(await screen.findByRole("button", { name: /^check in$/i }));
    await waitFor(() => expect(screen.getByText(/checked in/i)).toBeInTheDocument());
    const saved = JSON.parse(localStorage.getItem("deg-pulse:workspace-test:user-test") ?? "{}");
    expect(saved.checkedInAt).toBeGreaterThan(0);
  });

  it("keeps a checked-in session when Pulse sign-out status arrives from the sidebar", async () => {
    render(<RemoteWork />);
    fireEvent.click(await screen.findByRole("button", { name: /^check in$/i }));
    const key = "deg-pulse:workspace-test:user-test";
    const saved = JSON.parse(localStorage.getItem(key) ?? "{}");
    localStorage.setItem(key, JSON.stringify({ ...saved, status: "Offline", expiresAt: null }));
    window.dispatchEvent(new Event("deg-pulse-change"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /offline/i })).toBeDisabled();
      const persisted = JSON.parse(localStorage.getItem(key) ?? "{}");
      expect(persisted.checkedInAt).toBeGreaterThan(0);
    });
  });
});
