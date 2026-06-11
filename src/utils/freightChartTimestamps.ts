import { resolveFreightStatusSlug } from "@/components/ui/freightStatusUi";
import type { FreightDto, FreightStatusHistoryDto } from "@/types/freight";

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseTimestamp(value?: string) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function isWithinRange(timestamp: number | null, start: Date, endExclusive: Date) {
  if (timestamp == null) return false;
  return timestamp >= start.getTime() && timestamp < endExclusive.getTime();
}

function getFreightStatusSlug(freight: FreightDto) {
  return resolveFreightStatusSlug({
    statusId: freight.status_id,
    statusName: freight.FreightStatusType?.name ?? freight.status?.name,
  });
}

function getHistoryStatusSlug(entry: FreightStatusHistoryDto) {
  return resolveFreightStatusSlug({
    statusId: entry.status_id,
    statusName: entry.FreightStatusType?.name,
  });
}

export function getPublishedTimestamp(freight: FreightDto) {
  return parseTimestamp(freight.createdAt);
}

export function isConcludedFreight(freight: FreightDto) {
  return getFreightStatusSlug(freight) === "concluido";
}

export function getConcludedTimestamp(freight: FreightDto) {
  const historyMatch = [...(freight.FreightStatusHistories ?? [])]
    .reverse()
    .find((entry) => getHistoryStatusSlug(entry) === "concluido");

  if (!isConcludedFreight(freight)) return null;

  return parseTimestamp(
    historyMatch?.occurred_at ?? historyMatch?.occurredAt ?? freight.updatedAt ?? freight.createdAt
  );
}
