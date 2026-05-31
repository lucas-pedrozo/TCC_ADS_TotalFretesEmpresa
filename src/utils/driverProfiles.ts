import http from "@/service/http";
import type { ProposalDto } from "@/types/proposal";
import type { UserDto } from "@/types/user";

export type DriverProfile = {
  name: string | null;
  vehicle: string | null;
  imageUrl: string | null;
};

const emptyDriverProfile = (): DriverProfile => ({
  name: null,
  vehicle: null,
  imageUrl: null,
});

export async function fetchDriverProfilesMap(
  driverIds: number[],
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
        return [
          driverId,
          {
            name: data.name?.trim() || null,
            vehicle,
            imageUrl: data.UserImage?.url?.trim() || null,
          },
        ] as const;
      } catch {
        return [driverId, emptyDriverProfile()] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

export function mergeProposalDriversIntoProfiles(
  profiles: Record<number, DriverProfile>,
  proposals: ProposalDto[],
): Record<number, DriverProfile> {
  const next = { ...profiles };

  for (const proposal of proposals) {
    const driverId = proposal.driver_id;
    const driver = proposal.Driver;
    if (!driverId) continue;

    const existing = next[driverId] ?? emptyDriverProfile();
    next[driverId] = {
      name: driver?.name?.trim() || existing.name,
      vehicle: existing.vehicle,
      imageUrl: driver?.UserImage?.url?.trim() || existing.imageUrl,
    };
  }

  return next;
}

export async function resolveDriverProfilesFromProposals(
  proposals: ProposalDto[],
): Promise<Record<number, DriverProfile>> {
  const driverIds = proposals.map((proposal) => proposal.driver_id).filter(Boolean);
  const fromUsers = await fetchDriverProfilesMap(driverIds);
  return mergeProposalDriversIntoProfiles(fromUsers, proposals);
}
