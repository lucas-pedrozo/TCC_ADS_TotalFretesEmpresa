export type AdminAccountType = {
  id: number;
  name: string;
};

export type AdminAccount = {
  id: number;
  email: string;
  account_type_id: number;
  subject_id: number;
  AccountType?: AdminAccountType | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminAccountListResponse = {
  items: AdminAccount[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  cpf?: string;
  userImage_id?: number | null;
  UserImage?: { id: number; url?: string | null } | null;
};

export type AdminCompany = {
  id: number;
  name: string;
  email: string;
  cnpj?: string;
  birthFundation?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  company_image_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
  CompanyImage?: { id: number; url?: string | null; originalName?: string | null } | null;
  CompanyAddress?: {
    id?: number;
    country?: string;
    cep?: string;
    street?: string;
    district?: string;
    number?: string;
    city?: string;
    state?: string;
  } | null;
};

export type AdminCargoType = {
  id: number;
  name: string;
  imageCargo_id?: number | null;
};

export type AdminNamedEntity = {
  id: number;
  name: string;
};

export type AdminCnhType = {
  id: number;
  name: string;
  description: string;
};

export type AdminGroupVehicleType = {
  id: number;
  nome: string;
  cnhType_id: number;
  CnhType?: Pick<AdminCnhType, "id" | "name"> | null;
};

export type AdminVehicleType = {
  id: number;
  nome: string;
  axes: number;
  weight: number;
  capacityWeight: number;
  length: number;
  imageVehicle_id?: number | null;
  groupVehicleType_id?: number | null;
  GroupVehicleType?: Pick<AdminGroupVehicleType, "id" | "nome"> | null;
};

export type AdminVehicle = {
  id: number;
  plateNumber?: string;
  chassisNumber?: string;
  model?: string;
  mark?: string;
  city?: string;
  stateUF?: string;
  country?: string;
  vehicleType_id?: number;
  VehicleType?: { id?: number; nome?: string; name?: string } | null;
};
