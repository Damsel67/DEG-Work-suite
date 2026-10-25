import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/modules", label: "Modules" },
  { to: "/trust", label: "Privacy & trust" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
          <Link to="/" aria-label="DEG WorkSuite home" className="shrink-0">
            <Logo className="h-8 md:h-9" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Product
            </a>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/app" className="hidden px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              Sign in
            </Link>
            <Button asChild variant="hero" size="default" className="hidden sm:inline-flex">
              <Link to="/app">
                Get started <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
        <nav className="flex items-center gap-6 border-t border-border/50 px-5 py-2 md:hidden">
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground">Product</a>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium text-muted-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/app" className="ml-auto text-sm font-semibold text-foreground">
            Get started →
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <Logo tagline className="h-14" />
          <p className="mt-5 max-w-sm text-sm text-muted-foreground">
            A focused workspace for the projects and tasks that move your work forward.
          </p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/modules" className="hover:underline">Modules</Link></li>
            <li><Link to="/trust" className="hover:underline">Privacy & trust</Link></li>
            <li><Link to="/app" className="hover:underline">Create your workspace</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Your work</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/app/projects" className="hover:underline">Projects</Link></li>
            <li><Link to="/app/tasks" className="hover:underline">Tasks</Link></li>
            <li><Link to="/app" className="hover:underline">Workspace</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted-foreground md:px-8">
          © {new Date().getFullYear()} DEG WorkSuite. Your office, powered by intelligence.
        </p>
      </div>
    </footer>
  );
}

