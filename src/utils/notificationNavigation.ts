import type { WebNotification } from '@/hooks/useNotifications';

export function resolveNotificationRoute(notification: WebNotification): string {
  const freightId = notification.metadata?.freightId;

  switch (notification.type) {
    case 'PROPOSTA_ENVIADA':
    case 'PROPOSTA_ACEITA':
      return '/Proposals';
    case 'FRETE_EM_TRANSITO':
    case 'FRETE_ENTREGUE':
    case 'FRETE_CANCELADO':
      if (typeof freightId === 'number') {
        return `/Freights/${freightId}`;
      }
      return '/Freights';
    default:
      return '/Proposals';
  }
}
