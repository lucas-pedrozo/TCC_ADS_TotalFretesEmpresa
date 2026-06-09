import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import type { AppLanguage } from '@/i18n/resources';
import { cn } from '@/lib/utils';
import { resolveNotificationRoute } from '@/utils/notificationNavigation';
import { getNotificationVisual } from '@/utils/notificationUi';
import { formatRelativeNotificationTime } from '@/utils/relativeTime';
import { selectableItemHoverClassName } from '@/utils/ui';

const RECENT_NOTIFICATION_LIMIT = 4;

export function HomeRecentNotifications() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language as AppLanguage;
  const { notifications, loading, markAsRead } = useNotifications();

  const recentNotifications = useMemo(
    () => notifications.slice(0, RECENT_NOTIFICATION_LIMIT),
    [notifications],
  );

  const handleNotificationClick = async (notificationId: number, route: string) => {
    await markAsRead(notificationId);
    navigate(route);
  };

  return (
    <aside className="min-w-0 rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
      <div className="mb-5 space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          {t('pages.home.notifications.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('pages.home.notifications.description')}
        </p>
      </div>

      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          Array.from({ length: RECENT_NOTIFICATION_LIMIT }).map((_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-2xl" />
          ))
        ) : recentNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            {t('pages.home.notifications.empty')}
          </div>
        ) : (
          recentNotifications.map((notification) => {
            const { icon: Icon, iconClassName } = getNotificationVisual(notification.type);
            const isUnread = notification.read_at == null;

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  void handleNotificationClick(
                    notification.id,
                    resolveNotificationRoute(notification),
                  );
                }}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-all hover:border-brand-green/30 hover:shadow-sm',
                  isUnread
                    ? 'border-brand-green-light/40 bg-muted/20'
                    : 'border-border/80 bg-muted/10',
                  selectableItemHoverClassName,
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-2xl',
                      iconClassName,
                    )}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <p className="text-sm leading-5 text-muted-foreground">{notification.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeNotificationTime(notification.created_at, language)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
