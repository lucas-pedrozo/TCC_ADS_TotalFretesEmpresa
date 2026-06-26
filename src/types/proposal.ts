import type { FreightDto } from "@/types/freight";

export type ProposalStatusTypeDto = {
  id: number;
  name: string;
};

export type UserImageDto = {
  url?: string | null;
};

export type DriverSummaryDto = {
  id: number;
  name?: string | null;
  UserImage?: UserImageDto | null;
};

export type ProposalDto = {
  id: number;
  freight_id: number;
  driver_id: number;
  status_id?: number | null;
  value: number;
  rejection_comment?: string | null;
  submitted_lat?: number | null;
  submitted_lng?: number | null;
  createdAt?: string;
  updatedAt?: string;
  ProposalStatusType?: ProposalStatusTypeDto | null;
  Freight?: FreightDto | null;
  Driver?: DriverSummaryDto | null;
};

export type ProposalAcceptResponse = {
  message?: string;
  proposal: ProposalDto;
};

export type ProposalRejectResponse = {
  message?: string;
  proposal: ProposalDto;
};

export type ProposalListPaginatedResponse = {
  items: ProposalDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  summary?: ProposalListKpis;
};

export type ProposalStatusFilter =
  | "enviada"
  | "esperando_caminhoneiro"
  | "aceita"
  | "recusada"
  | "nao_selecionada"
  | "todas";

export type ProposalListKpis = {
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  uniqueFreights: number;
};

/** Legado: agregação por frete (`GET /proposal/freight-summary`). */
export type ProposalFreightSummaryItem = {
  freight: import("@/types/freight").FreightDto;
  proposalCount: number;
  pendingCount: number;
  bestValue: number;
  averageValue: number;
  referenceValue: number;
};

export type ProposalFreightSummaryResponse = {
  items: ProposalFreightSummaryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
