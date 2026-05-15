import type { FreightDto } from "@/types/freight";

export type MockProposalRow = {
  id: string;
  /** Valor em reais (mesma unidade que `FreightDto.originalValue`). */
  amount: number;
  deadlineDays: number;
  isBest: boolean;
};

export type FreightDetailProposalsMock = {
  proposals: MockProposalRow[];
  tollsAmount: number;
  insuranceAmount: number;
};

/**
 * Dados de propostas / custos extras só para UI até existir API.
 * Valores de proposta são derivados do frete para parecerem coerentes.
 */
export function getFreightDetailProposalsMock(freight: FreightDto): FreightDetailProposalsMock {
  const estimated = freight.finalValue ?? freight.originalValue;
  const best = Math.max(0, Math.round(estimated * 0.964 * 100) / 100);

  return {
    proposals: [{ id: "mock-1", amount: best, deadlineDays: 1, isBest: true }],
    tollsAmount: 380,
    insuranceAmount: 240,
  };
}

export function pickBestProposal(mock: FreightDetailProposalsMock): MockProposalRow | undefined {
  return mock.proposals.find((p) => p.isBest) ?? mock.proposals[0];
}
