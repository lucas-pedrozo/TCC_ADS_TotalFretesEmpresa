import { useCallback, useEffect, useRef, useState } from 'react';

import http from '@/service/http';
import { buildTrackingWebSocketUrl } from '@/utils/toWebSocketUrl';

export type TrackingPosition = {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recordedAt: string;
};

export type TrailPoint = {
  latitude: number;
  longitude: number;
  recordedAt: string;
};

type UseFreightTrackingParams = {
  freightId: string;
  enabled: boolean;
};

type TrailResponse = {
  freightId: number;
  points: TrailPoint[];
  latest?: TrackingPosition | null;
};

const BACKOFF_STEPS_MS = [2000, 4000, 8000, 30000];

function normalizePosition(data: Record<string, unknown>): TrackingPosition | null {
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const speedRaw = data.speed;
  const headingRaw = data.heading;
  const recordedAt =
    typeof data.recordedAt === 'string' && data.recordedAt.trim()
      ? data.recordedAt
      : new Date().toISOString();

  return {
    latitude,
    longitude,
    speed: speedRaw == null ? null : Number(speedRaw),
    heading: headingRaw == null ? null : Number(headingRaw),
    recordedAt,
  };
}

export function useFreightTracking({ freightId, enabled }: UseFreightTrackingParams) {
  const [currentPosition, setCurrentPosition] = useState<TrackingPosition | null>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  const freightIdRef = useRef(freightId);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    freightIdRef.current = freightId;
  }, [freightId]);

  const cleanupSocket = useCallback(() => {
    if (reconnectTimerRef.current != null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsOnline(false);
  }, []);

  const handleDriverLocation = useCallback((payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;
    const envelope = payload as { event?: string; data?: Record<string, unknown> };
    if (envelope.event !== 'DRIVER_LOCATION' || !envelope.data) return;

    const data = envelope.data;
    const eventFreightId = Number(data.freightId);
    if (Number(freightIdRef.current) !== eventFreightId) return;

    const position = normalizePosition(data);
    if (!position) return;

    setCurrentPosition(position);
    setTrail((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.latitude === position.latitude &&
        last.longitude === position.longitude &&
        last.recordedAt === position.recordedAt
      ) {
        return prev;
      }
      return [
        ...prev,
        {
          latitude: position.latitude,
          longitude: position.longitude,
          recordedAt: position.recordedAt,
        },
      ];
    });
    setIsOnline(true);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!enabledRef.current) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const attempt = reconnectAttemptRef.current;
    const delay = BACKOFF_STEPS_MS[Math.min(attempt, BACKOFF_STEPS_MS.length - 1)];
    reconnectAttemptRef.current += 1;

    reconnectTimerRef.current = window.setTimeout(() => {
      connectRef.current();
    }, delay);
  }, []);

  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!enabledRef.current) {
      cleanupSocket();
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    cleanupSocket();

    const apiBase = import.meta.env.VITE_API_URL?.trim() || '/api';
    const url = buildTrackingWebSocketUrl(apiBase, token);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setIsOnline(true);
        setError(null);
        ws.send(
          JSON.stringify({
            action: 'WATCH_FREIGHT',
            freightId: Number(freightIdRef.current),
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(String(event.data));
          handleDriverLocation(parsed);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => {
        setError('Erro na conexão de rastreamento');
        setIsOnline(false);
      };

      ws.onclose = () => {
        wsRef.current = null;
        setIsOnline(false);
        scheduleReconnect();
      };
    } catch {
      setError('Não foi possível iniciar o rastreamento');
      scheduleReconnect();
    }
  }, [cleanupSocket, handleDriverLocation, scheduleReconnect]);

  connectRef.current = connect;

  const loadTrail = useCallback(async () => {
    if (!freightId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await http.get<TrailResponse>(
        `/mapbox/telemetry/trail/${encodeURIComponent(freightId)}`,
      );

      const points = Array.isArray(data.points) ? data.points : [];
      setTrail(points);

      if (data.latest) {
        const latest = normalizePosition(data.latest as Record<string, unknown>);
        if (latest) setCurrentPosition(latest);
      } else if (points.length > 0) {
        const last = points[points.length - 1];
        setCurrentPosition({
          latitude: last.latitude,
          longitude: last.longitude,
          speed: null,
          heading: null,
          recordedAt: last.recordedAt,
        });
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
          : '';
      setError(message.trim() || 'Não foi possível carregar a trilha do frete');
    } finally {
      setIsLoading(false);
    }
  }, [freightId]);

  useEffect(() => {
    if (!enabled) {
      cleanupSocket();
      return;
    }

    void loadTrail();
    connect();

    return () => {
      cleanupSocket();
    };
  }, [enabled, freightId, connect, cleanupSocket, loadTrail]);

  const retry = useCallback(() => {
    setError(null);
    void loadTrail();
    connect();
  }, [loadTrail, connect]);

  return {
    currentPosition,
    trail,
    isOnline,
    isLoading,
    error,
    retry,
  };
}
