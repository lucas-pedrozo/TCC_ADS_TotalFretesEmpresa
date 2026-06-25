import type { FreightStatusSlug } from "@/types/freight";
import { FREIGHT_STATUS_SLUGS } from "@/types/freight";

export { FREIGHT_STATUS_SLUGS };

/** Ordem exibida nos filtros da listagem (fluxo principal + cancelado). */
export const FREIGHT_FILTER_STATUS_SLUGS = [
  "disponivel",
  "esperando_caminhoneiro",
  "vinculado",
  "em_transito",
  "em_rota_entrega",
  "entregue",
  "concluido",
  "cancelado",
] as const satisfies readonly FreightStatusSlug[];

export const FREIGHT_STATUS_LABEL_KEY: Record<FreightStatusSlug, string> = {
  disponivel: "pages.freights.statusDisponivel",
  cancelado: "pages.freights.statusCancelado",
  esperando_caminhoneiro: "pages.freights.statusEsperandoCaminhoneiro",
  vinculado: "pages.freights.statusVinculado",
  em_transito: "pages.freights.statusEmTransito",
  em_rota_entrega: "pages.freights.statusEmRotaEntrega",
  entregue: "pages.freights.statusEntregue",
  concluido: "pages.freights.statusConcluido",
};

const STATUS_SLUG_BY_ID: Record<number, FreightStatusSlug> = {
  1: "disponivel",
  2: "cancelado",
  3: "vinculado",
  4: "em_transito",
  5: "em_rota_entrega",
  6: "entregue",
  7: "concluido",
};

function normalizeStatusName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function parseStatusSlug(name: string | undefined | null): FreightStatusSlug {
  if (!name) return "disponivel";

  const normalized = normalizeStatusName(name);
  const aliasMap: Record<string, FreightStatusSlug> = {
    disponivel: "disponivel",
    cancelado: "cancelado",
    esperando_caminhoneiro: "esperando_caminhoneiro",
    vinculado: "vinculado",
    em_transito: "em_transito",
    em_rota_entrega: "em_rota_entrega",
    entregue: "entregue",
    concluido: "concluido",
  };

  const resolved = aliasMap[normalized];
  if (resolved && FREIGHT_STATUS_SLUGS.includes(resolved)) {
    return resolved;
  }

  return "disponivel";
}

export function resolveFreightStatusSlug(params: {
  statusId?: number | null;
  statusName?: string | null;
}): FreightStatusSlug {
  if (params.statusId != null) {
    const fromId = STATUS_SLUG_BY_ID[params.statusId];
    if (fromId) return fromId;
  }
  if (params.statusName) {
    return parseStatusSlug(params.statusName);
  }
  return "disponivel";
}

const PIPELINE_INDEX: Record<FreightStatusSlug, number> = {
  disponivel: 0,
  cancelado: -1,
  esperando_caminhoneiro: 1,
  vinculado: 2,
  em_transito: 3,
  em_rota_entrega: 4,
  entregue: 5,
  concluido: 6,
};

function pipelineProgress(slug: FreightStatusSlug): number {
  return PIPELINE_INDEX[slug] ?? 0;
}

/** Usa status_id/nome da API e avança conforme o histórico (corrige status_id desatualizado no banco). */
export function resolveEffectiveFreightStatusSlug(params: {
  statusId?: number | null;
  statusName?: string | null;
  history?: ReadonlyArray<{ slug: FreightStatusSlug; occurredAt: string }>;
  /** Quando a empresa aceitou proposta e aguarda confirmação do motorista (status virtual). */
  awaitingDriverSince?: string | null;
}): FreightStatusSlug {
  const fromApi = resolveFreightStatusSlug({
    statusId: params.statusId,
    statusName: params.statusName,
  });

  if (fromApi === "disponivel" && params.awaitingDriverSince) {
    return "esperando_caminhoneiro";
  }

  if (!params.history?.length) return fromApi;

  let best = fromApi;
  let bestProgress = pipelineProgress(fromApi);

  for (const entry of params.history) {
    if (entry.slug === "cancelado") continue;
    const progress = pipelineProgress(entry.slug);
    if (progress > bestProgress) {
      bestProgress = progress;
      best = entry.slug;
    }
  }

  return best;
}

export function statusBadgeClass(slug: FreightStatusSlug): string {
  switch (slug) {
    case "disponivel":
      return "border-sky-200/80 bg-sky-100 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100";
    case "cancelado":
      return "border-red-200/80 bg-red-100 text-red-950 dark:bg-red-950/35 dark:text-red-100";
    case "esperando_caminhoneiro":
      return "border-amber-200/80 bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100";
    case "vinculado":
      return "border-violet-200/80 bg-violet-100 text-violet-950 dark:bg-violet-950/40 dark:text-violet-100";
    case "em_transito":
      return "border-orange-200/80 bg-orange-100 text-orange-950 dark:bg-orange-950/40 dark:text-orange-100";
    case "em_rota_entrega":
      return "border-yellow-200/80 bg-yellow-100 text-yellow-950 dark:bg-yellow-950/40 dark:text-yellow-100";
    case "entregue":
      return "border-emerald-200/80 bg-emerald-100 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100";
    case "concluido":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
