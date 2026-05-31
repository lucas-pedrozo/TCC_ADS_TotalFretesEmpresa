export type VehicleTypeDto = {
  id?: number;
  nome?: string;
  name?: string;
};

export type VehicleDto = {
  id?: number;
  model?: string | null;
  mark?: string | null;
  VehicleType?: VehicleTypeDto | null;
};

export type UserImageDto = {
  url?: string | null;
};

export type UserDto = {
  id: number;
  name?: string | null;
  vehicle_id?: number | null;
  Vehicle?: VehicleDto | null;
  UserImage?: UserImageDto | null;
};
