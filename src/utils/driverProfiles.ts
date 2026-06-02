import http from "@/service/http";
import type { UserDto } from "@/types/user";

export type DriverProfile = {
  name: string | null;
  vehicle: string | null;
};

export async function fetchDriverProfilesMap(
  driverIds: number[]
): Promise<Record<number, DriverProfile>> {
  const uniqueIds = [...new Set(driverIds.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const entries = await Promise.all(
    uniqueIds.map(async (driverId) => {
      try {
        const { data } = await http.get<UserDto>(`/user/${driverId}`);
        const vehicleTypeName = data.Vehicle?.VehicleType?.nome ?? data.Vehicle?.VehicleType?.name;
        const markModel = [data.Vehicle?.mark, data.Vehicle?.model].filter(Boolean).join(" ");
        const vehicle = vehicleTypeName || markModel || null;
        return [driverId, { name: data.name?.trim() || null, vehicle }] as const;
      } catch {
        return [driverId, { name: null, vehicle: null }] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}
