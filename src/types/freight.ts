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
  vehicleType?: string;
  imageCargo_id?: number | null;
};

export type FreightStatusTypeDto = {
  id: number;
  name: string;
};

export type FreightDto = {
  id: number;
  company_id: number;
  cargoType_id: number;
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
  FreightStatusType?: FreightStatusTypeDto | null;
};

export type FreightCreateBody = {
  cargoType_id: number;
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
  "cargoType_id" | "originalValue" | "weight" | "daysLimit"
> & { status_id?: number };

export type FreightUpdateBody = Partial<FreightCreateBody>;
