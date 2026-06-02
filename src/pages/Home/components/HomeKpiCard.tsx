import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type HomeKpiCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: "brand" | "sky" | "amber" | "emerald" | "slate";
};

const toneClasses: Record<NonNullable<HomeKpiCardProps["tone"]>, string> = {
  brand: "bg-brand-green-light/60 text-brand-green-dark",
  sky: "bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  emerald: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  slate: "bg-muted text-foreground",
};

export function HomeKpiCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "brand",
}: HomeKpiCardProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="text-[clamp(1.4rem,1.2vw+0.95rem,1.9rem)] min-[800px]:text-[clamp(0.55rem,0.5vw+0.85rem,1.9rem)] leading-tight font-bold tracking-tight text-foreground [overflow-wrap:anywhere]">
            {value}
          </p>
        </div>

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            toneClasses[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </section>
  );
}
