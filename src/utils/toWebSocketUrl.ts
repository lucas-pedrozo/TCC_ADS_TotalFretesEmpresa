export function toWebSocketUrl(baseUrl: string, token: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  const wsBase = trimmed.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
  const root = wsBase.replace(/\/api$/i, '');
  return `${root}/api/ws?token=${encodeURIComponent(token)}`;
}

export function buildNotificationsWebSocketUrl(apiBaseUrl: string, token: string): string {
  return toWebSocketUrl(apiBaseUrl, token);
}

/** WebSocket de telemetria/rastreamento (mapbox-service). */
export function buildTrackingWebSocketUrl(apiBaseUrl: string, token: string): string {
  const trimmed = apiBaseUrl.trim().replace(/\/+$/, '');
  const wsBase = trimmed.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
  const root = wsBase.replace(/\/api$/i, '');
  return `${root}/api/mapbox/ws?token=${encodeURIComponent(token)}`;
}
