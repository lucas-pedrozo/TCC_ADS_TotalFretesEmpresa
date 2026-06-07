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
