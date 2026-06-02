import type { FreightDto } from "@/types/freight";
import type { AppLanguage } from "@/i18n/resources";
import type { ProposalDto, ProposalListKpis } from "@/types/proposal";
import { formatFreightCurrencyAmount } from "@/utils/freightFormat";

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isPendingProposalStatus(name: string | null | undefined): boolean {
  return (name ?? "").toLowerCase() === "enviada";
}

export function isAcceptedProposalStatus(name: string | null | undefined): boolean {
  const normalized = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return (
    normalized === "aceita" ||
    normalized === "accepted" ||
    normalized === "aceito" ||
    normalized === "esperando_caminhoneiro"
  );
}

export function isRejectedProposalStatus(name: string | null | undefined): boolean {
  const normalized = (name ?? "").toLowerCase();
  return normalized === "recusada" || normalized === "rejected" || normalized === "recusado";
}

export function proposalStatusBadgeClass(statusName: string | null | undefined): string {
  if (isPendingProposalStatus(statusName)) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
  if (isAcceptedProposalStatus(statusName)) {
    return "border-brand-green/40 bg-brand-green/10 text-brand-green-dark dark:text-brand-green-light";
  }
  if (isRejectedProposalStatus(statusName)) {
    return "border-red-200/80 bg-red-100 text-red-950 dark:bg-red-950/35 dark:text-red-100";
  }
  return "";
}

export function computeProposalListKpis(items: ProposalDto[]): ProposalListKpis {
  const uniqueFreightIds = new Set<number>();
  let pending = 0;
  let accepted = 0;

  for (const item of items) {
    uniqueFreightIds.add(item.freight_id);
    const statusName = item.ProposalStatusType?.name;
    if (isPendingProposalStatus(statusName)) pending += 1;
    if (isAcceptedProposalStatus(statusName)) accepted += 1;
  }

  return {
    totalProposals: items.length,
    pendingProposals: pending,
    acceptedProposals: accepted,
    uniqueFreights: uniqueFreightIds.size,
  };
}

/** Corrige KPIs quando o backend retorna total > 0 mas pendentes/aceitas zerados. */
export function resolveProposalSummary(
  summary: ProposalListKpis,
  items: ProposalDto[]
): ProposalListKpis {
  const hasBreakdown = summary.pendingProposals > 0 || summary.acceptedProposals > 0;

  if (summary.totalProposals > 0 && hasBreakdown) {
    return summary;
  }

  if (items.length === 0) {
    return summary;
  }

  const computed = computeProposalListKpis(items);

  if (summary.totalProposals === 0) {
    return computed;
  }

  return {
    ...summary,
    pendingProposals: summary.pendingProposals > 0 ? summary.pendingProposals : computed.pendingProposals,
    acceptedProposals: summary.acceptedProposals > 0 ? summary.acceptedProposals : computed.acceptedProposals,
  };
}

export function getFreightFromProposal(proposal: ProposalDto): FreightDto | null {
  return proposal.Freight ?? null;
}

export function matchesProposalSearch(
  proposal: ProposalDto,
  query: string,
  driverName: string | null | undefined,
  lang: AppLanguage
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const freight = getFreightFromProposal(proposal);
  const statusName = proposal.ProposalStatusType?.name ?? "";
  const referenceValue = freight?.finalValue ?? freight?.originalValue;

  const blob = [
    String(proposal.id),
    String(proposal.driver_id),
    driverName,
    freight?.name,
    freight?.CargoType?.name,
    freight?.origin_label,
    freight?.destination_label,
    statusName,
    String(proposal.value),
    referenceValue != null ? String(referenceValue) : "",
    formatFreightCurrencyAmount(proposal.value, lang),
    referenceValue != null ? formatFreightCurrencyAmount(referenceValue, lang) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeSearchText(blob).includes(normalizedQuery);
}

/** Maior proposta até o valor original; fallback: mais próxima do original, desempate menor valor. */
export function pickBestProposal<T extends { value: number }>(
  proposals: T[],
  originalValue: number | null | undefined
): T | undefined {
  if (proposals.length === 0) return undefined;

  if (!Number.isFinite(originalValue) || originalValue == null || originalValue <= 0) {
    return [...proposals].sort((a, b) => a.value - b.value)[0];
  }

  const atOrBelow = proposals.filter((p) => p.value <= originalValue);
  if (atOrBelow.length > 0) {
    return atOrBelow.reduce((best, p) => (p.value > best.value ? p : best));
  }

  return [...proposals].sort((a, b) => {
    const distA = Math.abs(a.value - originalValue);
    const distB = Math.abs(b.value - originalValue);
    if (distA !== distB) return distA - distB;
    return a.value - b.value;
  })[0];
}