import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TrackingMap } from '@/components/tracking/TrackingMap';
import { Button } from '@/components/ui/button';
import { useFreightTracking } from '@/hooks/useFreightTracking';
import { useTrackingRoutes } from '@/hooks/useTrackingRoutes';
import { formatRelativeUpdateTime } from '@/utils/relativeTime';
import { sumTrailDistanceKm } from '@/utils/trailDistanceKm';

type Coords = {
  latitude: number;
  longitude: number;
};

type FreightTrackingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  freightId: string;
  freightName: string;
  originLabel: string;
  destLabel: string;
  originCoords: Coords;
  destCoords: Coords;
  totalDistance: number;
};

const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 py-3 text-center sm:px-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-bold tabular-nums text-foreground sm:text-base">{value}</p>
    </div>
  );
}

export function FreightTrackingModal({
  isOpen,
  onClose,
  freightId,
  freightName,
  originLabel,
  destLabel,
  originCoords,
  destCoords,
  totalDistance,
}: FreightTrackingModalProps) {
  const { t } = useTranslation();
  const { currentPosition, trail, isOnline, isLoading, error, retry } = useFreightTracking({
    freightId,
    enabled: isOpen,
  });

  const { plannedRoute, currentRoute } = useTrackingRoutes({
    enabled: isOpen,
    originLabel,
    destLabel,
    originCoords,
    currentPosition: currentPosition
      ? { latitude: currentPosition.latitude, longitude: currentPosition.longitude }
      : null,
  });

  const traveledKm = useMemo(() => sumTrailDistanceKm(trail), [trail]);
  const remainingKm = Math.max(0, totalDistance - traveledKm);

  const avgSpeedKmh = useMemo(() => {
    if (trail.length < 2 || traveledKm < 0.1) return null;
    
    const firstPoint = trail[0];
    const lastPoint = trail[trail.length - 1];
    
    const startTime = new Date(firstPoint.recordedAt).getTime();
    const endTime = new Date(lastPoint.recordedAt).getTime();
    const elapsedHours = (endTime - startTime) / (1000 * 60 * 60);
    
    if (elapsedHours <= 0) return null;
    
    return traveledKm / elapsedHours;
  }, [trail, traveledKm]);

  const speedLabel =
    currentPosition?.speed != null && Number.isFinite(currentPosition.speed)
      ? `${Math.round(currentPosition.speed)} km/h`
      : '—';

  const avgSpeedLabel = 
    avgSpeedKmh != null && Number.isFinite(avgSpeedKmh)
      ? `${Math.round(avgSpeedKmh)} km/h`
      : '—';

  const traveledLabel = `${traveledKm.toFixed(1)} km`;
  const remainingLabel = `${remainingKm.toFixed(1)} km`;
  const updatedLabel = formatRelativeUpdateTime(currentPosition?.recordedAt);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label={t('pages.freightDetail.trackingClose')}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="freight-tracking-title"
        className="relative z-[101] flex max-h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <MapPin className="size-5 shrink-0 text-brand-green" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 id="freight-tracking-title" className="truncate text-base font-semibold text-foreground">
              {t('pages.freightDetail.trackingTitle', { name: freightName })}
            </h2>
          </div>
          {isOnline ? (
            <span className="relative flex size-2.5 shrink-0" aria-label={t('pages.freightDetail.trackingOnline')}>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-lg"
            onClick={onClose}
            aria-label={t('pages.freightDetail.trackingClose')}
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="h-[520px] w-full shrink-0 border-b border-border bg-muted/30">
          {isLoading ? (
            <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6">
              <div className="h-full w-full max-w-none animate-pulse rounded-none bg-muted" />
              <p className="absolute text-sm text-muted-foreground">
                {t('pages.freightDetail.trackingLoading')}
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => retry()}>
                {t('pages.freightDetail.trackingRetry')}
              </Button>
            </div>
          ) : !MAPBOX_PK ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {t('pages.freightWizard.mapTokenMissing')}
            </div>
          ) : (
            <TrackingMap
              accessToken={MAPBOX_PK}
              trail={trail}
              plannedRoute={plannedRoute}
              currentRoute={currentRoute}
              currentPosition={currentPosition}
              originCoords={originCoords}
              destCoords={destCoords}
            />
          )}
        </div>

        <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-5">
          <StatCell label={t('pages.freightDetail.trackingSpeed')} value={speedLabel} />
          <StatCell label={t('pages.freightDetail.trackingAvgSpeed')} value={avgSpeedLabel} />
          <StatCell label={t('pages.freightDetail.trackingTraveled')} value={traveledLabel} />
          <StatCell label={t('pages.freightDetail.trackingRemaining')} value={remainingLabel} />
          <StatCell
            label={t('pages.freightDetail.trackingLastUpdate')}
            value={updatedLabel}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
