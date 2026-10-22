import logoOnLight from "@/assets/brand/deg-logo-on-light-transparent.svg";
import logoOnDark from "@/assets/brand/deg-logo-on-dark-transparent.svg";
import nameOnLight from "@/assets/brand/deg-logo-name-on-light.svg";
import nameOnDark from "@/assets/brand/deg-logo-name-on-dark.svg";
import { cn } from "@/lib/utils";

type Props = {
  /** auto follows the light/dark theme; onDark is for permanently dark surfaces (pine sidebar, photos). */
  surface?: "auto" | "onDark";
  tagline?: boolean;
  className?: string;
};

export function Logo({ surface = "auto", tagline = false, className }: Props) {
  const light = tagline ? logoOnLight : nameOnLight;
  const dark = tagline ? logoOnDark : nameOnDark;
  const base = cn("h-auto w-auto select-none", className);

  if (surface === "onDark") {
    return <img src={dark} alt="DEG WorkSuite" className={base} width={1500} height={380} />;
  }
  return (
    <>
      <img src={light} alt="DEG WorkSuite" className={cn(base, "dark:hidden")} width={1500} height={380} />
      <img src={dark} alt="DEG WorkSuite" className={cn(base, "hidden dark:block")} width={1500} height={380} />
    </>
  );
}

/** The triple-arch mark, drawn with theme tokens so it adapts to any surface. */
export function ArchMark({ className, tone = "botanical" }: { className?: string; tone?: "botanical" | "moments" }) {
  return (
    <svg viewBox="96 70 320 356" className={className} aria-hidden="true">
      <path
        d="M126 412V230a130 130 0 0 1 260 0v182"
        fill="none"
        className="stroke-foreground"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <path
        d="M168 412V236a88 88 0 0 1 176 0v176"
        fill="none"
        className={tone === "moments" ? "stroke-rose" : "stroke-ochre"}
        strokeWidth="26"
        strokeLinecap="round"
      />
      <path
        d="M210 412V242a46 46 0 0 1 92 0v170"
        fill="none"
        className="stroke-clay"
        strokeWidth="26"
        strokeLinecap="round"
      />
    </svg>
  );
}
