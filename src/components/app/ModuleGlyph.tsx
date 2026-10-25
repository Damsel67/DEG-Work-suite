import type { ModuleKey, ModuleMeta } from "@/lib/modules";
import { moduleByKey } from "@/lib/modules";

export function ModuleGlyph({
  module,
  className,
}: {
  module: ModuleKey | ModuleMeta;
  className?: string;
}) {
  const metadata = typeof module === "string" ? moduleByKey(module) : module;
  const Icon = metadata.Icon;

  return Icon ? (
    <Icon className={className} strokeWidth={1.8} aria-hidden="true" />
  ) : (
    <img className={className} src={metadata.icon} alt="" />
  );
}

