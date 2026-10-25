import type { ReactNode } from "react";
import { Logo, ArchMark } from "@/components/brand/Logo";

export function AuthResidence({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="flex min-h-[250px] flex-col justify-between overflow-hidden bg-pine px-6 py-7 text-stone sm:px-10 sm:py-9 lg:min-h-screen lg:px-[7.5vw] lg:py-12">
        <Logo
          surface="onDark"
          className="block h-auto w-[min(100%,20rem)] sm:w-[min(100%,23rem)]"
        />
        <div className="mt-10 max-w-xl lg:mt-20">
          <h1 className="max-w-[14ch] font-display text-[2.35rem] font-light leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[clamp(3.3rem,5vw,5.6rem)]">
            Clarity for the work that matters.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-stone/75 sm:text-base">
            Your projects and next steps, together in one private workspace.
          </p>
        </div>
      </section>
      <section className="flex min-h-[calc(100vh-250px)] items-center justify-center px-5 py-12 sm:px-10 lg:min-h-screen lg:px-12 xl:px-20">
        <div className="w-full max-w-[27rem]">{children}</div>
      </section>
    </main>
  );
}

export function IntelligenceLoading() {
  return (
    <main
      className="workspace-loading relative flex min-h-screen items-center justify-center overflow-hidden bg-pine px-6 text-stone"
      aria-busy="true"
    >
      <div className="flex flex-col items-center">
        <ArchMark className="loading-arch-mark h-20 w-20 text-stone [&_.stroke-foreground]:stroke-stone" />
        <p className="mt-8 text-sm tracking-wide text-stone/75" role="status">
          Preparing your workspace.
        </p>
      </div>
      <div className="loading-progress" aria-hidden="true">
        <span />
      </div>
    </main>
  );
}

