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
  weight?: number | null;
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
  daysLimit?: number;
  /** Incluso só na edição (empresa), não no primeiro POST. */
  status_id?: number;
};

export type FreightUpdateBody = Partial<FreightCreateBody>;
