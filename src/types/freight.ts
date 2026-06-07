export const FREIGHT_STATUS_SLUGS = [
  "disponivel",
  "cancelado",
  "vinculado",
  "em_transito",
  "em_rota_entrega",
  "entregue",
  "concluido",
] as const;

export type FreightStatusSlug = (typeof FREIGHT_STATUS_SLUGS)[number];

export type CargoTypeDto = {
  id: number;
  name: string;
  imageCargo_id?: number | null;
};

export type FreightStatusTypeDto = {
  id: number;
  name: string;
};

export type CompanySummaryDto = {
  id: number;
  name: string;
  city?: string | null;
};

/** Uma entrada do histórico de status (API `FreightStatusHistories`). */
export type FreightStatusHistoryDto = {
  id: number;
  freight_id: number;
  status_id: number;
  occurred_at?: string;
  occurredAt?: string;
  FreightStatusType?: FreightStatusTypeDto | null;
};

export type FreightDto = {
  id: number;
  company_id: number;
  cargoType_id: number;
  /** Nome identificador do frete (listagem e cabeçalho do detalhe). */
  name?: string | null;
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  destination_label: string;
  destination_lat: number;
  destination_lng: number;
  status_id?: number | null;
  assignedDriver_id?: number | null;
  daysLimit?: number | null;
  originalValue: number;
  finalValue?: number | null;
  /** Peso da carga do frete (kg). */
  weight?: number | null;
  createdAt?: string;
  updatedAt?: string;
  CargoType?: CargoTypeDto;
  cargo?: CargoTypeDto;
  status?: FreightStatusTypeDto | null;
  FreightStatusType?: FreightStatusTypeDto | null;
  /** Ordem cronológica (mais antigo primeiro), quando a API envia o histórico. */
  FreightStatusHistories?: FreightStatusHistoryDto[];
  Company?: CompanySummaryDto | null;
};

export type FreightListResponse = FreightDto[];

export type FreightCreateResponse = {
  message?: string;
  freight: FreightDto;
};

export type FreightUpdateResponse = {
  message?: string;
  freight: FreightDto;
};

export type FreightCompleteResponse = FreightUpdateResponse;

export type FreightDeleteResponse = {
  message?: string;
};

export type FreightCreateBody = {
  cargoType_id: number;
  /** Nome do frete (obrigatório na API). */
  name: string;
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  destination_label: string;
  destination_lat: number;
  destination_lng: number;
  originalValue: number;
  /** Peso da carga (kg), obrigatório na criação. */
  weight: number;
  daysLimit?: number;
  /** Incluso só na edição (empresa), não no primeiro POST. */
  status_id?: number;
};

/** Etapa final do wizard de novo frete (sem origem/destino). */
export type FreightCargoStepBody = Pick<
  FreightCreateBody,
  "cargoType_id" | "name" | "originalValue" | "weight" | "daysLimit"
> & { status_id?: number };

export type FreightUpdateBody = Partial<FreightCreateBody>;

export type ChipFilter = "all" | FreightStatusSlug;
export type DriverFilter = "all" | "with" | "without";
export type FreightWizardStep = 1 | 2 | 3;
