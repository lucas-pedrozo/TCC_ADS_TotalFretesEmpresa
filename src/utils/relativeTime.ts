import type { AppLanguage } from '@/i18n/resources';
import { formatDateShortLabel } from '@/utils/dateFormat';

function getLocaleTag(language: AppLanguage) {
  return language === 'en' ? 'en-US' : 'pt-BR';
}

export function formatRelativeNotificationTime(
  recordedAt: string | null | undefined,
  language: AppLanguage,
): string {
  if (!recordedAt) return '—';

  const then = new Date(recordedAt).getTime();
  if (Number.isNaN(then)) return '—';

  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  const locale = getLocaleTag(language);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');

  const thenDate = new Date(then);
  const nowDate = new Date();
  if (thenDate.toDateString() === nowDate.toDateString()) {
    return language === 'en' ? 'Today' : 'Hoje';
  }

  return formatDateShortLabel(recordedAt, language);
}

export function formatRelativeUpdateTime(recordedAt: string | null | undefined): string {
  if (!recordedAt) return '—';

  const then = new Date(recordedAt).getTime();
  if (Number.isNaN(then)) return '—';

  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (diffSec < 5) return 'agora mesmo';
  if (diffSec < 60) return `há ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  return `há ${diffHours}h`;
}
