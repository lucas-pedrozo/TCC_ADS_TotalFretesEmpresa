import { haversineKm } from '@/utils/haversineKm';

type LatLngPoint = {
  latitude: number;
  longitude: number;
};

export function sumTrailDistanceKm(points: LatLngPoint[]): number {
  if (points.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    total += haversineKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
  }
  return total;
}
