import { useEffect, useState } from "react";

import {
  formatSubmittedCoordinates,
  resolveSubmittedLocationCity,
} from "@/utils/submittedLocation";

type UseSubmittedLocationCityResult = {
  hasCoords: boolean;
  loading: boolean;
  city: string | null;
  coordinatesLabel: string | null;
};

export function useSubmittedLocationCity(
  lat: number | null | undefined,
  lng: number | null | undefined,
): UseSubmittedLocationCityResult {
  const hasCoords =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCoords) {
      setCity(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void resolveSubmittedLocationCity(lat!, lng!).then((resolved) => {
      if (!cancelled) {
        setCity(resolved);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasCoords, lat, lng]);

  return {
    hasCoords,
    loading,
    city,
    coordinatesLabel: hasCoords ? formatSubmittedCoordinates(lat!, lng!) : null,
  };
}
