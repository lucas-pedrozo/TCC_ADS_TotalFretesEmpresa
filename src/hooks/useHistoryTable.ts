import { useCallback, useEffect, useMemo, useState } from "react";

import type { FreightStatusSlug } from "@/types/freight";
import { parseBound } from "@/utils/number";

export type HistoryTableRow = {
  id: number;
  code: string;
  route: string;
  cargo: string;
  value: string;
  valueNumeric: number;
  statusLabel: string;
  statusSlug: FreightStatusSlug;
  finalizedAt: string;
  distance: string;
  distanceNumeric: number;
  statusClassName: string;
};

const PAGE_SIZE = 10;
const ALL_CARGO = "__all__";

type UseHistoryTableOptions = {
  rows: HistoryTableRow[];
  pageSize?: number;
  resetKey?: string;
};

export function useHistoryTable({ rows, pageSize = PAGE_SIZE, resetKey }: UseHistoryTableOptions) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCargo, setFilterCargo] = useState(ALL_CARGO);
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");
  const [filterMinDistance, setFilterMinDistance] = useState("");
  const [filterMaxDistance, setFilterMaxDistance] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterCargo, filterMinValue, filterMaxValue, filterMinDistance, filterMaxDistance, resetKey]);

  const cargoOptions = useMemo(() => {
    const labels = new Set<string>();
    for (const row of rows) {
      labels.add(row.cargo);
    }
    return [...labels].sort((left, right) => left.localeCompare(right));
  }, [rows]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCargo !== ALL_CARGO) count += 1;
    if (parseBound(filterMinValue) !== undefined || parseBound(filterMaxValue) !== undefined) {
      count += 1;
    }
    if (parseBound(filterMinDistance) !== undefined || parseBound(filterMaxDistance) !== undefined) {
      count += 1;
    }
    return count;
  }, [filterCargo, filterMinValue, filterMaxValue, filterMinDistance, filterMaxDistance]);

  const clearAllFilters = useCallback(() => {
    setFilterCargo(ALL_CARGO);
    setFilterMinValue("");
    setFilterMaxValue("");
    setFilterMinDistance("");
    setFilterMaxDistance("");
  }, []);

  const filtered = useMemo(() => {
    const minV = parseBound(filterMinValue);
    const maxV = parseBound(filterMaxValue);
    const minD = parseBound(filterMinDistance);
    const maxD = parseBound(filterMaxDistance);

    return rows.filter((row) => {
      if (filterCargo !== ALL_CARGO && row.cargo !== filterCargo) return false;
      if (minV !== undefined && row.valueNumeric < minV) return false;
      if (maxV !== undefined && row.valueNumeric > maxV) return false;
      if (minD !== undefined && row.distanceNumeric < minD) return false;
      if (maxD !== undefined && row.distanceNumeric > maxD) return false;

      if (!debouncedSearch) return true;

      const blob = [row.code, row.route, row.cargo, row.value, row.statusLabel, row.finalizedAt, row.distance]
        .join(" ")
        .toLowerCase();

      return blob.includes(debouncedSearch);
    });
  }, [
    debouncedSearch,
    filterCargo,
    filterMaxDistance,
    filterMaxValue,
    filterMinDistance,
    filterMinValue,
    rows,
  ]);

  const total = filtered.length;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);
  const canGoPrev = page > 1;
  const canGoNext = page * pageSize < total;

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const goPrev = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((current) => {
      const maxPage = Math.max(1, Math.ceil(total / pageSize));
      return Math.min(maxPage, current + 1);
    });
  }, [pageSize, total]);

  return {
    search,
    setSearch,
    filterCargo,
    setFilterCargo,
    filterMinValue,
    setFilterMinValue,
    filterMaxValue,
    setFilterMaxValue,
    filterMinDistance,
    setFilterMinDistance,
    filterMaxDistance,
    setFilterMaxDistance,
    cargoOptions,
    allCargoValue: ALL_CARGO,
    activeFilterCount,
    clearAllFilters,
    filtered,
    paginatedRows,
    total,
    from,
    to,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
  };
}
