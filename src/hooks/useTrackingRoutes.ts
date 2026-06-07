import { useCallback, useEffect, useState } from 'react';

import http from '@/service/http';

type Coords = {
  latitude: number;
  longitude: number;
};

type RouteApiResponse = {
  geometria?: {
    coordinates?: [number, number][];
  };
};

function coordsFromGeometry(data: RouteApiResponse | null | undefined): Coords[] {
  const raw = data?.geometria?.coordinates;
  if (!Array.isArray(raw) || raw.length < 2) return [];
  return raw.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

type UseTrackingRoutesParams = {
  enabled: boolean;
  originLabel: string;
  destLabel: string;
  originCoords: Coords;
  currentPosition: Coords | null;
};

export function useTrackingRoutes({
  enabled,
  originLabel,
  destLabel,
  originCoords,
  currentPosition,
}: UseTrackingRoutesParams) {
  const [plannedRoute, setPlannedRoute] = useState<Coords[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Coords[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  const fetchPlannedRoute = useCallback(async () => {
    const { data } = await http.get<RouteApiResponse>('/mapbox/rota-frete', {
      params: {
        coordenadasOrigem: `${originCoords.longitude},${originCoords.latitude}`,
        moradaCarga: originLabel.trim() || `${originCoords.latitude},${originCoords.longitude}`,
        moradaDestino: destLabel.trim(),
      },
    });
    return coordsFromGeometry(data);
  }, [destLabel, originCoords.latitude, originCoords.longitude, originLabel]);

  const fetchCurrentRoute = useCallback(
    async (from: Coords) => {
      const { data } = await http.get<RouteApiResponse>('/mapbox/rota-frete', {
        params: {
          coordenadasOrigem: `${from.longitude},${from.latitude}`,
          moradaDestino: destLabel.trim(),
        },
      });
      return coordsFromGeometry(data);
    },
    [destLabel],
  );

  useEffect(() => {
    if (!enabled || !destLabel.trim()) {
      setPlannedRoute([]);
      setCurrentRoute([]);
      return;
    }

    let cancelled = false;
    setRoutesLoading(true);

    void (async () => {
      try {
        const planned = await fetchPlannedRoute();
        if (!cancelled) setPlannedRoute(planned);
      } catch {
        if (!cancelled) setPlannedRoute([]);
      } finally {
        if (!cancelled) setRoutesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, destLabel, fetchPlannedRoute]);

  useEffect(() => {
    if (!enabled || !destLabel.trim() || !currentPosition) {
      setCurrentRoute([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const route = await fetchCurrentRoute(currentPosition);
        if (!cancelled) setCurrentRoute(route);
      } catch {
        if (!cancelled) setCurrentRoute([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    destLabel,
    currentPosition?.latitude,
    currentPosition?.longitude,
    fetchCurrentRoute,
  ]);

  return { plannedRoute, currentRoute, routesLoading };
}
