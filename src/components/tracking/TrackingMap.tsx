import { useEffect, useRef } from 'react';
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl';

import type { TrackingPosition } from '@/hooks/useFreightTracking';

type Coords = {
  latitude: number;
  longitude: number;
};

type TrackingMapProps = {
  accessToken: string;
  trail: Coords[];
  plannedRoute: Coords[];
  currentRoute: Coords[];
  currentPosition: Pick<TrackingPosition, 'latitude' | 'longitude' | 'heading'> | null;
  originCoords: Coords;
  destCoords: Coords;
};

type MapboxGL = (typeof import('mapbox-gl'))['default'];

const TRAIL_SOURCE_ID = 'trail-source';
const TRAIL_LAYER_ID = 'trail-line';
const PLANNED_ROUTE_SOURCE_ID = 'planned-route-source';
const PLANNED_ROUTE_LAYER_ID = 'planned-route-line';
const CURRENT_ROUTE_SOURCE_ID = 'current-route-source';
const CURRENT_ROUTE_LAYER_ID = 'current-route-line';
const ANIMATION_MS = 800;

const ROUTE_LAYERS = [
  { layer: PLANNED_ROUTE_LAYER_ID, source: PLANNED_ROUTE_SOURCE_ID },
  { layer: CURRENT_ROUTE_LAYER_ID, source: CURRENT_ROUTE_SOURCE_ID },
  { layer: TRAIL_LAYER_ID, source: TRAIL_SOURCE_ID },
] as const;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function buildLineGeoJson(points: Coords[]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: points.map((p) => [p.longitude, p.latitude]),
    },
  };
}

function createTruckMarkerElement(heading: number | null): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'tracking-truck-marker';
  el.style.width = '36px';
  el.style.height = '36px';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.transform = `rotate(${heading ?? 0}deg)`;
  el.style.transition = 'transform 300ms linear';
  el.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 6h11v8H3V6zm11 2h3l2 3v3h-5V8z" fill="#1D9E75"/>
      <circle cx="7" cy="17" r="2" fill="#0F6E56"/>
      <circle cx="17" cy="17" r="2" fill="#0F6E56"/>
      <path d="M3 14h18" stroke="#0F6E56" stroke-width="1.5"/>
    </svg>
  `;
  return el;
}

function createDotMarker(color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '14px';
  el.style.height = '14px';
  el.style.borderRadius = '9999px';
  el.style.backgroundColor = color;
  el.style.border = '2px solid #fff';
  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.35)';
  return el;
}

function updateRouteSource(
  map: MapboxMap,
  sourceId: string,
  points: Coords[],
) {
  const source = map.getSource(sourceId) as import('mapbox-gl').GeoJSONSource | undefined;
  if (source) {
    source.setData(buildLineGeoJson(points));
  }
}

function removeRouteLayers(map: MapboxMap) {
  for (const { layer, source } of ROUTE_LAYERS) {
    try {
      if (map.getLayer(layer)) map.removeLayer(layer);
      if (map.getSource(source)) map.removeSource(source);
    } catch {
      /* ignore */
    }
  }
}

export function TrackingMap({
  accessToken,
  trail,
  plannedRoute,
  currentRoute,
  currentPosition,
  originCoords,
  destCoords,
}: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mapboxRef = useRef<MapboxGL | null>(null);
  const truckMarkerRef = useRef<MapboxMarker | null>(null);
  const originMarkerRef = useRef<MapboxMarker | null>(null);
  const destMarkerRef = useRef<MapboxMarker | null>(null);
  const mapLoadedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const initialCenter = currentPosition ?? originCoords;

  useEffect(() => {
    if (!accessToken?.trim() || !containerRef.current) return;

    let mapInstance: MapboxMap | null = null;
    let onLoadHandler: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      try {
        await import('mapbox-gl/dist/mapbox-gl.css');
        const mapboxgl = (await import('mapbox-gl')).default;
        const WorkerCtor = (await import('mapbox-gl/dist/mapbox-gl-csp-worker.js?worker'))
          .default;
        mapboxgl.workerClass = WorkerCtor as typeof mapboxgl.workerClass;
        mapboxgl.accessToken = accessToken.trim();
        mapboxRef.current = mapboxgl;

        if (cancelled || !containerRef.current) return;

        mapInstance = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initialCenter.longitude, initialCenter.latitude],
          zoom: 12,
          antialias: true,
        });
        mapRef.current = mapInstance;

        onLoadHandler = () => {
          if (!mapInstance) return;
          mapLoadedRef.current = true;

          mapInstance.addSource(PLANNED_ROUTE_SOURCE_ID, {
            type: 'geojson',
            data: buildLineGeoJson(plannedRoute),
          });
          mapInstance.addLayer({
            id: PLANNED_ROUTE_LAYER_ID,
            type: 'line',
            source: PLANNED_ROUTE_SOURCE_ID,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#64748B',
              'line-width': 3,
              'line-dasharray': [2, 2],
            },
          });

          mapInstance.addSource(CURRENT_ROUTE_SOURCE_ID, {
            type: 'geojson',
            data: buildLineGeoJson(currentRoute),
          });
          mapInstance.addLayer({
            id: CURRENT_ROUTE_LAYER_ID,
            type: 'line',
            source: CURRENT_ROUTE_SOURCE_ID,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 4,
            },
          });

          mapInstance.addSource(TRAIL_SOURCE_ID, {
            type: 'geojson',
            data: buildLineGeoJson(trail),
          });
          mapInstance.addLayer({
            id: TRAIL_LAYER_ID,
            type: 'line',
            source: TRAIL_SOURCE_ID,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#1D9E75',
              'line-width': 3,
            },
          });

          originMarkerRef.current = new mapboxgl.Marker({
            element: createDotMarker('#0F6E56'),
          })
            .setLngLat([originCoords.longitude, originCoords.latitude])
            .addTo(mapInstance);

          destMarkerRef.current = new mapboxgl.Marker({
            element: createDotMarker('#F97316'),
          })
            .setLngLat([destCoords.longitude, destCoords.latitude])
            .addTo(mapInstance);

          const start = currentPosition ?? originCoords;
          const truckEl = createTruckMarkerElement(currentPosition?.heading ?? null);
          truckMarkerRef.current = new mapboxgl.Marker({ element: truckEl })
            .setLngLat([start.longitude, start.latitude])
            .addTo(mapInstance);

          mapInstance.resize();
        };

        mapInstance.on('load', onLoadHandler);
        mapInstance.once('idle', () => mapInstance?.resize());
      } catch {
        /* init errors surfaced by parent if needed */
      }
    })();

    return () => {
      cancelled = true;
      mapLoadedRef.current = false;

      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      truckMarkerRef.current?.remove();
      originMarkerRef.current?.remove();
      destMarkerRef.current?.remove();
      truckMarkerRef.current = null;
      originMarkerRef.current = null;
      destMarkerRef.current = null;

      if (mapInstance && onLoadHandler) {
        mapInstance.off('load', onLoadHandler);
      }

      if (mapInstance) {
        removeRouteLayers(mapInstance);
        try {
          mapInstance.remove();
        } catch {
          /* ignore */
        }
      }

      mapRef.current = null;
      mapboxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once per mount
  }, [accessToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    updateRouteSource(map, PLANNED_ROUTE_SOURCE_ID, plannedRoute);
  }, [plannedRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    updateRouteSource(map, CURRENT_ROUTE_SOURCE_ID, currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    updateRouteSource(map, TRAIL_SOURCE_ID, trail);
  }, [trail]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = truckMarkerRef.current;
    if (!map || !marker || !mapLoadedRef.current || !currentPosition) return;

    const truckEl = marker.getElement();
    if (currentPosition.heading != null && Number.isFinite(currentPosition.heading)) {
      truckEl.style.transform = `rotate(${currentPosition.heading}deg)`;
    }

    const from = marker.getLngLat();
    const to = {
      lng: currentPosition.longitude,
      lat: currentPosition.latitude,
    };

    if (from.lng === to.lng && from.lat === to.lat) return;

    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / ANIMATION_MS, 1);
      const eased = easeInOut(t);
      const lng = from.lng + (to.lng - from.lng) * eased;
      const lat = from.lat + (to.lat - from.lat) * eased;
      marker.setLngLat([lng, lat]);

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
    map.easeTo({
      center: [to.lng, to.lat],
      duration: ANIMATION_MS,
    });
  }, [currentPosition]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="img"
      aria-label="Mapa de rastreamento do motorista"
    />
  );
}
