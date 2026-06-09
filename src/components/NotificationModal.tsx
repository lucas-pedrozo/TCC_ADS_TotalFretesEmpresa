import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { WebNotification } from '@/hooks/useNotifications';
import { resolveNotificationRoute } from '@/utils/notificationNavigation';

type NotificationModalProps = {
  open: boolean;
  notifications: WebNotification[];
  onClose: () => void;
  onClear: () => void;
  onMarkAsRead: (id: number) => void | Promise<void>;
};

export function NotificationModal({
  open,
  notifications,
  onClose,
  onClear,
  onMarkAsRead,
}: NotificationModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = async (notification: WebNotification) => {
    await onMarkAsRead(notification.id);

    navigate(resolveNotificationRoute(notification));

    onClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4">
          <SheetTitle className="text-lg">
            {t('header.notifications', { defaultValue: 'Notificações' })}
          </SheetTitle>
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-red-500 hover:text-red-600"
          >
            {t('notifications.clear', { defaultValue: 'Limpar' })}
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('notifications.empty', { defaultValue: 'Nenhuma notificação disponível.' })}
            </p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => {
                const isUnread = notification.read_at == null;
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => { void handleClick(notification); }}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50',
                        isUnread
                          ? 'border-brand-green-light/40 bg-muted/40'
                          : 'border-border bg-background',
                      )}
                    >
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
