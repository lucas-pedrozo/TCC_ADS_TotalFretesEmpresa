import type { ReactNode } from 'react';
import { Compass, LocateFixed, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type TrackingMapControlsProps = {
  alignBearing: boolean;
  hasPosition: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterVehicle: () => void;
  onToggleBearing: () => void;
};

function ControlButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'pointer-events-auto flex size-10 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground shadow-sm transition-colors',
        'hover:bg-muted disabled:pointer-events-none disabled:opacity-40',
        active && 'border-brand-green/50 bg-brand-green-light/30 ring-1 ring-brand-green/40',
      )}
    >
      {children}
    </button>
  );
}

export function TrackingMapControls({
  alignBearing,
  hasPosition,
  onZoomIn,
  onZoomOut,
  onCenterVehicle,
  onToggleBearing,
}: TrackingMapControlsProps) {
  const { t } = useTranslation();

  return (
    <div
      className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col gap-2"
      aria-hidden={false}
    >
      <ControlButton label={t('pages.freightDetail.trackingZoomIn')} onClick={onZoomIn}>
        <Plus className="size-5" aria-hidden />
      </ControlButton>
      <ControlButton label={t('pages.freightDetail.trackingZoomOut')} onClick={onZoomOut}>
        <Minus className="size-5" aria-hidden />
      </ControlButton>
      <ControlButton
        label={t('pages.freightDetail.trackingCenterVehicle')}
        onClick={onCenterVehicle}
        disabled={!hasPosition}
      >
        <LocateFixed className="size-5" aria-hidden />
      </ControlButton>
      <ControlButton
        label={
          alignBearing
            ? t('pages.freightDetail.trackingNorthUp')
            : t('pages.freightDetail.trackingHeadingUp')
        }
        onClick={onToggleBearing}
        disabled={!hasPosition}
        active={alignBearing}
      >
        <Compass className="size-5" aria-hidden />
      </ControlButton>
    </div>
  );
}
