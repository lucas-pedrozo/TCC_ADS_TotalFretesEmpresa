export type ProposalStatusTypeDto = {
  id: number;
  name: string;
};

export type ProposalDto = {
  id: number;
  freight_id: number;
  driver_id: number;
  status_id?: number | null;
  value: number;
  createdAt?: string;
  updatedAt?: string;
  ProposalStatusType?: ProposalStatusTypeDto | null;
};

export type ProposalAcceptResponse = {
  message?: string;
  proposal: ProposalDto;
};

export type ProposalRejectResponse = {
  message?: string;
  proposal: ProposalDto;
};
