import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import { useTheme } from "next-themes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";

export type MapPinValue = {
  label: string;
  lat: number;
  lng: number;
};

type GeocodeFeature = {
  id: string;
  place_name: string;
  center: [number, number];
};

type AddressMapPickerProps = {
  accessToken: string;
  initialSearchQuery?: string | null;
  value?: MapPinValue | null;
  onChange: (v: MapPinValue | null) => void;
};

type MapboxGL = (typeof import("mapbox-gl"))["default"];

const BR_CENTER: [number, number] = [-51.9253, -14.235];

async function fetchForward(q: string): Promise<GeocodeFeature[]> {
  const { data } = await http.get<{ features: GeocodeFeature[] }>(
    "/mapbox/geocode-forward",
    { params: { q } }
  );
  return Array.isArray(data.features) ? data.features : [];
}

async function fetchReverse(lng: number, lat: number): Promise<MapPinValue> {
  const { data } = await http.get<{ place_name: string; center: [number, number] }>(
    "/mapbox/geocode-reverse",
    { params: { lng, lat } }
  );
  const [dlng, dlat] = data.center;
  return { label: data.place_name, lat: dlat, lng: dlng };
}

export function AddressMapPicker({
  accessToken,
  initialSearchQuery,
  value,
  onChange,
}: AddressMapPickerProps) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const mapboxRef = useRef<MapboxGL | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSearchDoneRef = useRef(false);
  const labelInputRef = useRef("");
  const searchTextLiveRef = useRef("");
  const valuePinRef = useRef({ label: "", lng: null as number | null, lat: null as number | null });
  const onChangeRef = useRef(onChange);
  const lastExternalValueKeyRef = useRef<string | null>(null);
  const lastSeededInitialQueryRef = useRef<string | null>(null);
  const placeMarkerAndEmitRef = useRef<
    (map: MapboxMap, lng: number, lat: number, label: string) => void
  >(() => {});

  const valueLng = value?.lng;
  const valueLat = value?.lat;
  const valueLabel = value?.label ?? "";
  const mapStyle =
    resolvedTheme === "dark"
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeFeature[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [reverseBusy, setReverseBusy] = useState(false);
  const [searchCompletedFor, setSearchCompletedFor] = useState("");
  const [hasPlacedPin, setHasPlacedPin] = useState(false);

  searchTextLiveRef.current = searchText;
  valuePinRef.current = { label: valueLabel, lng: valueLng ?? null, lat: valueLat ?? null };

  useEffect(() => {
    labelInputRef.current = labelInput;
  }, [labelInput]);

  /** Preenche a busca com o endereço da empresa */
  useEffect(() => {
    const q = initialSearchQuery?.trim();
    if (!q) return;
    if (lastSeededInitialQueryRef.current === q) return;
    lastSeededInitialQueryRef.current = q;
    setSearchText((prev) => (prev.trim() === "" ? q : prev));
  }, [initialSearchQuery]);

  const removeMarker = useCallback(() => {
    markerRef.current?.remove();
    markerRef.current = null;
  }, []);

  const placeMarkerAndEmit = useCallback(
    (map: MapboxMap, lng: number, lat: number, label: string) => {
      const mb = mapboxRef.current;
      if (!mb) return;
      removeMarker();
      const trimmed = label.trim();
      setLabelInput(trimmed);
      labelInputRef.current = trimmed;

      const marker = new mb.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);
      markerRef.current = marker;

      const push = (lngN: number, latN: number, lab: string) => {
        const tlab = lab.trim();
        setLabelInput(tlab);
        labelInputRef.current = tlab;
        setHasPlacedPin(Boolean(tlab));
        onChangeRef.current(tlab ? { label: tlab, lat: latN, lng: lngN } : null);
      };

      marker.on("dragend", () => {
        const ll = marker.getLngLat();
        void (async () => {
          try {
            setReverseBusy(true);
            const next = await fetchReverse(ll.lng, ll.lat);
            push(next.lng, next.lat, next.label);
          } catch (e) {
            push(ll.lng, ll.lat, labelInputRef.current);
            console.warn(trataErroAxios(e));
          } finally {
            setReverseBusy(false);
          }
        })();
      });

      push(lng, lat, trimmed);
      map.flyTo({ center: [lng, lat], zoom: 14 });
    },
    [removeMarker]
  );

  placeMarkerAndEmitRef.current = placeMarkerAndEmit;

  useEffect(() => {
    if (!accessToken?.trim() || !containerRef.current) return;

    setMapInitError(null);
    autoSearchDoneRef.current = false;
    let mapInstance: MapboxMap | null = null;
    let onLoadHandler: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      try {
        await import("mapbox-gl/dist/mapbox-gl.css");
        const mapboxgl = (await import("mapbox-gl")).default;
        const WorkerCtor = (await import("mapbox-gl/dist/mapbox-gl-csp-worker.js?worker"))
          .default;
        mapboxgl.workerClass = WorkerCtor as typeof mapboxgl.workerClass;
        mapboxgl.accessToken = accessToken.trim();
        mapboxRef.current = mapboxgl;

        if (cancelled || !containerRef.current) return;

        mapInstance = new mapboxgl.Map({
          container: containerRef.current,
          style: mapStyle,
          center: BR_CENTER,
          zoom: 4,
          antialias: true,
        });
        mapRef.current = mapInstance;

        onLoadHandler = () => {
          mapInstance?.resize();
          setMapLoaded(true);
        };
        mapInstance.on("load", onLoadHandler);
        mapInstance.once("idle", () => {
          mapInstance?.resize();
        });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setMapInitError(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
      mapboxRef.current = null;
      if (mapInstance && onLoadHandler) {
        mapInstance.off("load", onLoadHandler);
      }
      removeMarker();
      setHasPlacedPin(false);
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch {
        }
      }
      mapRef.current = null;
      setMapLoaded(false);
      autoSearchDoneRef.current = false;
    };
  }, [accessToken, mapStyle, removeMarker]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if (valueLng == null || valueLat == null || !valueLabel.trim()) {
      lastExternalValueKeyRef.current = null;
      return;
    }

    const key = `${valueLng.toFixed(6)},${valueLat.toFixed(6)},${valueLabel.trim()}`;
    if (lastExternalValueKeyRef.current === key) return;
    lastExternalValueKeyRef.current = key;

    const map = mapRef.current;
    setSearchText(valueLabel.trim());
    placeMarkerAndEmitRef.current(map, valueLng, valueLat, valueLabel);
  }, [mapLoaded, valueLng, valueLat, valueLabel]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || autoSearchDoneRef.current) return;
    if (valueLng != null && valueLat != null) {
      autoSearchDoneRef.current = true;
      return;
    }

    const q = initialSearchQuery?.trim();
    if (!q) return;
    autoSearchDoneRef.current = true;

    void (async () => {
      try {
        setSearching(true);
        setSearchError(null);
        const feats = await fetchForward(q);
        setSuggestions([]);
        if (feats.length > 0 && mapRef.current) {
          const f = feats[0];
          placeMarkerAndEmitRef.current(
            mapRef.current,
            f.center[0],
            f.center[1],
            f.place_name
          );
        }
      } catch (e) {
        setSuggestions([]);
        setSearchError(trataErroAxios(e));
      } finally {
        setSearching(false);
      }
    })();
  }, [mapLoaded, initialSearchQuery, valueLng, valueLat]);

  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    const committed = valueLabel.trim();
    if (
      committed &&
      q === committed &&
      valueLng != null &&
      valueLat != null
    ) {
      setSuggestions([]);
      setSearchError(null);
      setSearchCompletedFor(q);
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const queryAtFire = q;
      void (async () => {
        try {
          setSearching(true);
          setSearchError(null);
          const feats = await fetchForward(queryAtFire);
          if (searchTextLiveRef.current.trim() !== queryAtFire) return;

          const snap = valuePinRef.current;
          const committedAfter = snap.label.trim();
          if (
            committedAfter &&
            queryAtFire === committedAfter &&
            snap.lng != null &&
            snap.lat != null
          ) {
            setSuggestions([]);
            setSearchError(null);
            setSearchCompletedFor(queryAtFire);
            return;
          }

          setSuggestions(feats);
          setSearchError(null);
          setSearchCompletedFor(queryAtFire);
        } catch (e) {
          if (searchTextLiveRef.current.trim() !== queryAtFire) return;
          setSuggestions([]);
          setSearchError(trataErroAxios(e));
          setSearchCompletedFor(queryAtFire);
        } finally {
          if (searchTextLiveRef.current.trim() === queryAtFire) {
            setSearching(false);
          }
        }
      })();
    }, 420);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchText, valueLabel, valueLng, valueLat]);

  function handlePickSuggestion(f: GeocodeFeature) {
    if (!mapRef.current) return;
    setSuggestions([]);
    setSearchError(null);
    setSearchText(f.place_name);
    placeMarkerAndEmitRef.current(
      mapRef.current,
      f.center[0],
      f.center[1],
      f.place_name
    );
  }

  if (!accessToken?.trim()) {
    return (
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
        {t("pages.freightWizard.mapTokenMissing")}
      </p>
    );
  }

  if (mapInitError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {t("pages.freightWizard.mapInitError", { message: mapInitError })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-search">{t("pages.freightWizard.searchAddress")}</Label>
        <Input
          id="addr-search"
          autoComplete="off"
          className="min-h-11 touch-manipulation md:min-h-9"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t("pages.freightWizard.searchPlaceholder")}
        />
        {searching && searchText.trim().length >= 2 ? (
          <p className="text-xs text-muted-foreground">{t("pages.freightWizard.searching")}</p>
        ) : searchError ? (
          <p className="text-xs text-destructive">{searchError}</p>
        ) : null}
        {suggestions.length > 0 ? (
          <ul className="max-h-44 overflow-auto rounded-lg border border-border bg-card text-sm shadow-sm">
            {suggestions.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="min-h-11 w-full px-3 py-2.5 text-left text-sm touch-manipulation hover:bg-muted/80 md:min-h-0 md:py-2"
                  onClick={() => handlePickSuggestion(f)}
                >
                  {f.place_name}
                </button>
              </li>
            ))}
          </ul>
        ) : !hasPlacedPin &&
          searchText.trim().length >= 2 &&
          !searching &&
          !searchError &&
          suggestions.length === 0 &&
          searchCompletedFor === searchText.trim() ? (
          <p className="text-xs text-muted-foreground">{t("pages.freightWizard.noResults")}</p>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="h-[min(52dvh,400px)] w-full min-h-[260px] overflow-hidden rounded-lg border border-border [&_.mapboxgl-canvas]:block [&_.mapboxgl-canvas]:h-full [&_.mapboxgl-canvas]:w-full [&_.mapboxgl-map]:h-full [&_.mapboxgl-map]:min-h-[inherit] md:h-[min(360px,55vh)] md:min-h-[240px]"
        aria-label={t("pages.freightWizard.mapAria")}
      />

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">
          {reverseBusy ? t("pages.freightWizard.reverseLoading") : t("pages.freightWizard.dragHint")}
        </p>
      </div>
    </div>
  );
}
