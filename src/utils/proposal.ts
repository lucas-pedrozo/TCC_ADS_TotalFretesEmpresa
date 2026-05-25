import type { FreightDto } from "@/types/freight";
import type { ProposalDto, ProposalListKpis } from "@/types/proposal";

export function isPendingProposalStatus(name: string | null | undefined): boolean {
  return (name ?? "").toLowerCase() === "enviada";
}

export function isAcceptedProposalStatus(name: string | null | undefined): boolean {
  const normalized = (name ?? "").toLowerCase();
  return normalized === "aceita" || normalized === "accepted" || normalized === "aceito";
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

export function getFreightFromProposal(proposal: ProposalDto): FreightDto | null {
  return proposal.Freight ?? null;
}