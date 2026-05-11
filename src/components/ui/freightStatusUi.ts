import type { FreightStatusSlug } from "@/types/freight";
import { FREIGHT_STATUS_SLUGS } from "@/types/freight";

export { FREIGHT_STATUS_SLUGS };

export const FREIGHT_STATUS_LABEL_KEY: Record<FreightStatusSlug, string> = {
  disponivel: "pages.freights.statusDisponivel",
  cancelado: "pages.freights.statusCancelado",
  vinculado: "pages.freights.statusVinculado",
  em_transito: "pages.freights.statusEmTransito",
  em_rota_entrega: "pages.freights.statusEmRotaEntrega",
  entregue: "pages.freights.statusEntregue",
  concluido: "pages.freights.statusConcluido",
};

export function parseStatusSlug(name: string | undefined | null): FreightStatusSlug {
  if (name && FREIGHT_STATUS_SLUGS.includes(name as FreightStatusSlug)) {
    return name as FreightStatusSlug;
  }
  return "disponivel";
}

export function statusBadgeClass(slug: FreightStatusSlug): string {
  switch (slug) {
    case "disponivel":
      return "border-sky-200/80 bg-sky-100 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100";
    case "cancelado":
      return "border-red-200/80 bg-red-100 text-red-950 dark:bg-red-950/35 dark:text-red-100";
    case "vinculado":
      return "border-violet-200/80 bg-violet-100 text-violet-950 dark:bg-violet-950/40 dark:text-violet-100";
    case "em_transito":
      return "border-brand-green/25 bg-brand-green-light text-brand-green-dark";
    case "em_rota_entrega":
      return "border-amber-200/80 bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100";
    case "entregue":
      return "border-border bg-muted text-muted-foreground";
    case "concluido":
      return "border-emerald-200/80 bg-emerald-100 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
