import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import http from '@/service/http';
import { useWebSocket } from '@/hooks/useWebSocket';
import { buildNotificationsWebSocketUrl } from '@/utils/toWebSocketUrl';

export type WebNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

type ApiNotification = WebNotification & { user_id: number };

function mergeNotification(list: WebNotification[], incoming: WebNotification): WebNotification[] {
  if (list.some((item) => item.id === incoming.id)) return list;
  return [incoming, ...list];
}

export function useNotifications() {
  const { id, token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<WebNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const wsUrl = useMemo(() => {
    if (!token) return null;
    const apiBase = import.meta.env.VITE_API_URL?.trim() || '/api';
    return buildNotificationsWebSocketUrl(apiBase, token);
  }, [token]);

  const fetchUnread = useCallback(async () => {
    if (id == null) return;
    setLoading(true);
    try {
      const { data } = await http.get<ApiNotification[]>(`/notifications/${id}`);
      setNotifications(data);
    } catch {
      /* keep list */
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleWsMessage = useCallback((payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;
    const event = payload as { event?: string; data?: ApiNotification | ApiNotification[] };

    if (event.event === 'NEW_NOTIFICATION' && event.data && !Array.isArray(event.data)) {
      setNotifications((prev) => mergeNotification(prev, event.data as WebNotification));
      return;
    }

    if (event.event === 'UNREAD_NOTIFICATIONS' && Array.isArray(event.data)) {
      setNotifications(event.data as WebNotification[]);
    }
  }, []);

  useWebSocket({
    url: wsUrl,
    enabled: Boolean(isAuthenticated && token && id),
    onMessage: handleWsMessage,
  });

  useEffect(() => {
    if (isAuthenticated && id != null) {
      void fetchUnread();
    } else {
      setNotifications([]);
    }
  }, [fetchUnread, id, isAuthenticated]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.read_at == null).length,
    [notifications],
  );

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await http.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    clearAll,
    refetch: fetchUnread,
  };
}
