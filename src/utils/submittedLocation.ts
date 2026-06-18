import http from "@/service/http";

const cityCache = new Map<string, string | null>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/** Extrai nome da cidade a partir do `place_name` retornado pelo Mapbox. */
export function extractCityFromMapboxPlaceName(placeName: string): string {
  const parts = placeName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return placeName.trim();

  const last = (parts[parts.length - 1]?.toLowerCase() ?? "");
  const isBrazil = last.includes("brazil") || last.includes("brasil");

  if (isBrazil) {
    if (parts.length >= 3) return parts[parts.length - 3]!;
    if (parts.length >= 2) return parts[parts.length - 2]!;
  }

  if (parts.length >= 2) return parts[parts.length - 2]!;
  return parts[0]!;
}

export async function resolveSubmittedLocationCity(
  lat: number,
  lng: number,
): Promise<string | null> {
  const key = cacheKey(lat, lng);
  if (cityCache.has(key)) return cityCache.get(key) ?? null;

  try {
    const { data } = await http.get<{ place_name?: string }>("/mapbox/geocode-reverse", {
      params: { lng, lat },
    });
    const placeName = data.place_name?.trim();
    if (!placeName) {
      cityCache.set(key, null);
      return null;
    }

    const city = extractCityFromMapboxPlaceName(placeName);
    cityCache.set(key, city);
    return city;
  } catch {
    cityCache.set(key, null);
    return null;
  }
}

export function formatSubmittedCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
