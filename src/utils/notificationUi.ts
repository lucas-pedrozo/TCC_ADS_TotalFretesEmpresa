import {
  BadgeCheck,
  BellRing,
  FileClock,
  Route,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

type NotificationVisual = {
  icon: LucideIcon;
  iconClassName: string;
};

export function getNotificationVisual(type: string): NotificationVisual {
  switch (type) {
    case 'PROPOSTA_ENVIADA':
      return {
        icon: BellRing,
        iconClassName: 'bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100',
      };
    case 'PROPOSTA_ACEITA':
      return {
        icon: BadgeCheck,
        iconClassName:
          'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
      };
    case 'FRETE_EM_TRANSITO':
      return {
        icon: Route,
        iconClassName:
          'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
      };
    case 'FRETE_ENTREGUE':
      return {
        icon: BadgeCheck,
        iconClassName:
          'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
      };
    case 'FRETE_CANCELADO':
      return {
        icon: TriangleAlert,
        iconClassName:
          'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100',
      };
    default:
      return {
        icon: FileClock,
        iconClassName:
          'bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100',
      };
  }
}
