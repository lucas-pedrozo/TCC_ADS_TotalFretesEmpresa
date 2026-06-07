import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NotificationModal } from '@/components/NotificationModal';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  return (
    <>
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative size-9 shrink-0 touch-manipulation"
                aria-label={t('header.notifications')}
                onClick={() => setOpen(true)}
              >
                <Bell className="size-[1.15rem] sm:size-5" />
                {unreadCount > 0 ? (
                  <span
                    className={cn(
                      'absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full',
                      'bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-background',
                    )}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : (
                  <span
                    className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-background bg-brand-green-light"
                    aria-hidden
                  />
                )}
              </Button>
            }
          />
          <TooltipContent>{t('header.notifications')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <NotificationModal
        open={open}
        notifications={notifications}
        onClose={() => setOpen(false)}
        onClear={clearAll}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}
