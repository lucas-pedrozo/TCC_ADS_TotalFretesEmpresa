import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  FREIGHT_STATUS_LABEL_KEY,
  FREIGHT_STATUS_SLUGS,
  parseStatusSlug,
} from "@/components/ui/freightStatusUi";
import http from "@/service/http";
import type {
  ChipFilter,
  DriverFilter,
  FreightDeleteResponse,
  FreightDto,
  FreightListResponse,
} from "@/types/freight";
import { haversineKm } from "@/utils/haversineKm";
import { parseBound } from "@/utils/number";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

export function useFreightsListPage() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [chip, setChip] = useState<ChipFilter>("all");
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");
  const [filterMinWeight, setFilterMinWeight] = useState("");
  const [filterMaxWeight, setFilterMaxWeight] = useState("");
  const [filterMinDistance, setFilterMinDistance] = useState("");
  const [filterMaxDistance, setFilterMaxDistance] = useState("");
  const [filterDriver, setFilterDriver] = useState<DriverFilter>("all");
  const [rows, setRows] = useState<FreightDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [freightToDelete, setFreightToDelete] = useState<FreightDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadFreights = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await http.get<FreightListResponse>("/freight");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFreights();
  }, [loadFreights]);

  const handleConfirmDelete = useCallback(async () => {
    if (!freightToDelete) return;
    const id = freightToDelete.id;
    try {
      setDeleting(true);
      const { data } = await http.delete<FreightDeleteResponse>(`/freight/${id}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.deletedOk"));
      setFreightToDelete(null);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setDeleting(false);
    }
  }, [freightToDelete, t]);

  const chips: { id: ChipFilter; label: string }[] = useMemo(
    () => [
      { id: "all", label: t("pages.freights.chipAll") },
      ...FREIGHT_STATUS_SLUGS.map((slug) => ({
        id: slug,
        label: t(FREIGHT_STATUS_LABEL_KEY[slug]),
      })),
    ],
    [t]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (chip !== "all") n += 1;
    if (
      parseBound(filterMinValue) !== undefined ||
      parseBound(filterMaxValue) !== undefined
    ) {
      n += 1;
    }
    if (
      parseBound(filterMinWeight) !== undefined ||
      parseBound(filterMaxWeight) !== undefined
    ) {
      n += 1;
    }
    if (
      parseBound(filterMinDistance) !== undefined ||
      parseBound(filterMaxDistance) !== undefined
    ) {
      n += 1;
    }
    if (filterDriver !== "all") n += 1;
    return n;
  }, [
    chip,
    filterMinValue,
    filterMaxValue,
    filterMinWeight,
    filterMaxWeight,
    filterMinDistance,
    filterMaxDistance,
    filterDriver,
  ]);

  const clearAllFilters = useCallback(() => {
    setChip("all");
    setFilterMinValue("");
    setFilterMaxValue("");
    setFilterMinWeight("");
    setFilterMaxWeight("");
    setFilterMinDistance("");
    setFilterMaxDistance("");
    setFilterDriver("all");
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minV = parseBound(filterMinValue);
    const maxV = parseBound(filterMaxValue);
    const minW = parseBound(filterMinWeight);
    const maxW = parseBound(filterMaxWeight);
    const minD = parseBound(filterMinDistance);
    const maxD = parseBound(filterMaxDistance);

    return rows.filter((row) => {
      const statusName = row.FreightStatusType?.name;
      const slug = parseStatusSlug(statusName);
      if (chip !== "all" && slug !== chip) return false;

      const displayValue = row.finalValue ?? row.originalValue;
      if (minV !== undefined && displayValue < minV) return false;
      if (maxV !== undefined && displayValue > maxV) return false;

      const weightKg = row.weight;
      if (minW !== undefined || maxW !== undefined) {
        if (weightKg == null || Number.isNaN(Number(weightKg))) return false;
        const w = Number(weightKg);
        if (minW !== undefined && w < minW) return false;
        if (maxW !== undefined && w > maxW) return false;
      }

      const distKm = haversineKm(
        row.origin_lat,
        row.origin_lng,
        row.destination_lat,
        row.destination_lng
      );
      if (minD !== undefined && distKm < minD) return false;
      if (maxD !== undefined && distKm > maxD) return false;

      if (filterDriver === "with" && row.assignedDriver_id == null) {
        return false;
      }
      if (filterDriver === "without" && row.assignedDriver_id != null) {
        return false;
      }

      if (!q) return true;
      const driverBit =
        row.assignedDriver_id != null
          ? String(row.assignedDriver_id)
          : "";
      const blob = [
        row.name,
        row.CargoType?.name,
        driverBit,
        row.origin_label,
        row.destination_label,
        statusName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [
    rows,
    search,
    chip,
    filterMinValue,
    filterMaxValue,
    filterMinWeight,
    filterMaxWeight,
    filterMinDistance,
    filterMaxDistance,
    filterDriver,
  ]);

  const total = filtered.length;
  const page = 1;
  const pageSize = 10;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  return {
    search,
    setSearch,
    chip,
    setChip,
    filterMinValue,
    setFilterMinValue,
    filterMaxValue,
    setFilterMaxValue,
    filterMinWeight,
    setFilterMinWeight,
    filterMaxWeight,
    setFilterMaxWeight,
    filterMinDistance,
    setFilterMinDistance,
    filterMaxDistance,
    setFilterMaxDistance,
    filterDriver,
    setFilterDriver,
    rows,
    loading,
    deleting,
    chips,
    activeFilterCount,
    clearAllFilters,
    filtered,
    total,
    from,
    to,
    freightToDelete,
    setFreightToDelete,
    handleConfirmDelete,
  };
}
