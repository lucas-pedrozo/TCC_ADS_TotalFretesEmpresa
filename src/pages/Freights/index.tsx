import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import http from "@/service/http";
import type { FreightDto, FreightStatusSlug } from "@/types/freight";
import { haversineKm } from "@/utils/haversineKm";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

import {
  FREIGHT_STATUS_LABEL_KEY,
  FREIGHT_STATUS_SLUGS,
  parseStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";

type ChipFilter = "all" | FreightStatusSlug;
type DriverFilter = "all" | "with" | "without";

function parseBound(s: string): number | undefined {
  const t = s.trim().replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function formatDate(iso: string | undefined, locale: AppLanguage): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const tag = locale === "en" ? "en-US" : "pt-BR";
  return d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number, locale: AppLanguage): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const currency = locale === "en" ? "USD" : "BRL";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatWeightKg(kg: number | null | undefined, locale: AppLanguage) {
  if (kg == null || Number.isNaN(kg)) return "—";
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const n = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(kg);
  return `${n} kg`;
}

function formatDistanceKm(km: number, locale: AppLanguage): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  const n = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(km);
  return `${n} km`;
}

const FreightsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const navigate = useNavigate();
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
      const { data } = await http.get<FreightDto[]>("/freight");
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

  async function handleConfirmDelete() {
    if (!freightToDelete) return;
    const id = freightToDelete.id;
    try {
      setDeleting(true);
      const { data } = await http.delete<{ message?: string }>(`/freight/${id}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.deletedOk"));
      setFreightToDelete(null);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setDeleting(false);
    }
  }

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

  function clearAllFilters() {
    setChip("all");
    setFilterMinValue("");
    setFilterMaxValue("");
    setFilterMinWeight("");
    setFilterMaxWeight("");
    setFilterMinDistance("");
    setFilterMaxDistance("");
    setFilterDriver("all");
  }

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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-3 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("pages.freights.searchPlaceholder")}
                className="min-h-11 rounded-lg border-border pl-9 touch-manipulation md:min-h-9"
                aria-label={t("pages.freights.searchPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch lg:justify-end">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-full shrink-0 justify-center gap-2 rounded-lg touch-manipulation sm:min-h-9 sm:w-auto"
                      aria-label={t("pages.freights.filters")}
                    >
                      <Filter className="size-4 shrink-0" aria-hidden />
                      {t("pages.freights.filters")}
                      {activeFilterCount > 0 ? (
                        <span className="ml-0.5 min-w-5 rounded-full bg-brand-green-light px-1.5 py-0.5 text-center text-xs font-semibold text-brand-green-dark">
                          {activeFilterCount}
                        </span>
                      ) : null}
                    </Button>
                  }
                />
                <PopoverContent
                  className="w-[min(calc(100vw-2rem),22rem)] max-w-none sm:w-96"
                  align="end"
                  sideOffset={8}
                >
                  <PopoverHeader>
                    <PopoverTitle>{t("pages.freights.filterPanelTitle")}</PopoverTitle>
                    <PopoverDescription>
                      {t("pages.freights.filterPanelHint")}
                    </PopoverDescription>
                  </PopoverHeader>
                  <div className="scrollbar-brand flex max-h-[min(32rem,calc(100vh-6rem))] flex-col gap-4 overflow-y-auto overscroll-y-contain pr-1">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-foreground" htmlFor="ff-status">
                        {t("pages.freights.filterSectionStatus")}
                      </Label>
                      <select
                        id="ff-status"
                        value={chip}
                        onChange={(e) => setChip(e.target.value as ChipFilter)}
                        className="flex h-9 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                      >
                        {chips.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("pages.freights.filterSectionValue")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("pages.freights.filterValueHelp")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="ff-min-val">
                            {t("pages.freights.filterMin")}
                          </Label>
                          <Input
                            id="ff-min-val"
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            placeholder="—"
                            className="rounded-lg"
                            value={filterMinValue}
                            onChange={(e) => setFilterMinValue(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="ff-max-val">
                            {t("pages.freights.filterMax")}
                          </Label>
                          <Input
                            id="ff-max-val"
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            placeholder="—"
                            className="rounded-lg"
                            value={filterMaxValue}
                            onChange={(e) => setFilterMaxValue(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("pages.freights.filterSectionWeight")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("pages.freights.filterWeightHelp")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="ff-min-w">
                            {t("pages.freights.filterMin")}
                          </Label>
                          <Input
                            id="ff-min-w"
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            placeholder="—"
                            className="rounded-lg"
                            value={filterMinWeight}
                            onChange={(e) => setFilterMinWeight(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="ff-max-w">
                            {t("pages.freights.filterMax")}
                          </Label>
                          <Input
                            id="ff-max-w"
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            placeholder="—"
                            className="rounded-lg"
                            value={filterMaxWeight}
                            onChange={(e) => setFilterMaxWeight(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        {t("pages.freights.filterSectionDistance")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("pages.freights.filterDistanceHelp")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="ff-min-d">
                            {t("pages.freights.filterMin")}
                          </Label>
                          <Input
                            id="ff-min-d"
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            placeholder="—"
                            className="rounded-lg"
                            value={filterMinDistance}
                            onChange={(e) => setFilterMinDistance(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs" htmlFor="ff-max-d">
                            {t("pages.freights.filterMax")}
                          </Label>
                          <Input
                            id="ff-max-d"
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            placeholder="—"
                            className="rounded-lg"
                            value={filterMaxDistance}
                            onChange={(e) => setFilterMaxDistance(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-foreground" htmlFor="ff-driver">
                        {t("pages.freights.filterSectionDriver")}
                      </Label>
                      <select
                        id="ff-driver"
                        value={filterDriver}
                        onChange={(e) => setFilterDriver(e.target.value as DriverFilter)}
                        className="flex h-9 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                      >
                        <option value="all">{t("pages.freights.filterDriverAll")}</option>
                        <option value="with">{t("pages.freights.filterDriverWith")}</option>
                        <option value="without">{t("pages.freights.filterDriverWithout")}</option>
                      </select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-lg"
                      onClick={clearAllFilters}
                    >
                      {t("pages.freights.filterClear")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                className="min-h-11 w-full shrink-0 gap-2 rounded-lg bg-brand-green text-white touch-manipulation hover:bg-brand-green-dark sm:min-h-9 sm:w-auto"
                onClick={() => navigate("/Freights/new")}
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                {t("pages.freights.newFreight")}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <>
            <div className="flex flex-col gap-3 p-3 md:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border-2 border-border bg-muted/20 p-4 shadow-sm"
                >
                  <Skeleton className="h-5 w-4/5 max-w-[14rem]" />
                  <Skeleton className="mt-3 h-6 w-28 rounded-full" />
                  <Skeleton className="mt-3 h-4 w-full max-w-md" />
                  <Skeleton className="mt-2 h-4 w-full max-w-md" />
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-border/80 pt-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-10 pl-4 text-muted-foreground" />
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnCargo")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnName")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnDeparture")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnDestination")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnStatus")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnValue")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnWeight")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnDistance")}
                    </TableHead>
                    <TableHead className="w-12 pr-4 text-right text-muted-foreground">
                      {t("pages.freights.columnAction")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <TableCell key={j} className={j === 0 ? "pl-4" : ""}>
                          <Skeleton className="h-4 w-full max-w-[8rem]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground md:py-10">
            {t("pages.freights.emptyTable")}
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-3 p-3 md:hidden" role="list">
              {filtered.map((row) => {
                const slug = parseStatusSlug(row.FreightStatusType?.name);
                const distKm = haversineKm(
                  row.origin_lat,
                  row.origin_lng,
                  row.destination_lat,
                  row.destination_lng
                );
                const displayValue = row.finalValue ?? row.originalValue;
                const openFreight = () => {
                  void navigate(`/Freights/${row.id}`);
                };

                return (
                  <li key={row.id} className="list-none">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={t("pages.freights.openFreightAria")}
                      className="flex w-full cursor-pointer flex-col gap-3 rounded-xl border-2 border-border bg-card p-4 text-left shadow-sm touch-manipulation outline-none ring-offset-2 ring-offset-background transition-[border-color,box-shadow,background-color,transform] hover:border-brand-green/50 hover:bg-brand-green/[0.06] hover:shadow-md active:scale-[0.99] active:bg-muted/40 focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      onClick={openFreight}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openFreight();
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-snug text-foreground">
                            {row.CargoType?.name ?? "—"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {row.assignedDriver_id != null
                              ? t("pages.freightDetail.driverId", {
                                  id: row.assignedDriver_id,
                                })
                              : "—"}
                          </p>
                          <p className="mt-1.5 text-[11px] font-medium text-brand-green-dark/90 dark:text-brand-green-light">
                            {t("pages.freights.tapToOpenHint")}
                          </p>
                        </div>
                        <div
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                                "size-11 min-h-11 min-w-11 md:size-8 md:min-h-8 md:min-w-8"
                              )}
                              aria-label={t("pages.freights.actionMenuLabel")}
                            >
                              <MoreHorizontal className="size-5 md:size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-40">
                              <DropdownMenuItem
                                onClick={() => navigate(`/Freights/${row.id}`)}
                              >
                                {t("pages.freights.actionEdit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setFreightToDelete(row)}
                              >
                                {t("pages.freightDetail.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit rounded-full font-medium",
                          statusBadgeClass(slug)
                        )}
                      >
                        {t(FREIGHT_STATUS_LABEL_KEY[slug])}
                      </Badge>
                      <dl className="grid gap-3 text-sm">
                        <div className="min-w-0">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("pages.freights.columnDeparture")}
                          </dt>
                          <dd className="mt-0.5 break-words font-medium text-foreground">
                            {row.origin_label}
                          </dd>
                          <dd className="text-xs text-muted-foreground">
                            {formatDate(row.createdAt, lang)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("pages.freights.columnDestination")}
                          </dt>
                          <dd className="mt-0.5 break-words font-medium text-foreground">
                            {row.destination_label}
                          </dd>
                          <dd className="text-xs text-muted-foreground">
                            {formatDate(row.updatedAt, lang)}
                          </dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border pt-3 text-sm">
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatCurrency(displayValue, lang)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatWeightKg(row.weight, lang)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceKm(Math.round(distKm), lang)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-10 pl-4 text-muted-foreground" />
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnCargo")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnName")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnDeparture")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnDestination")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnStatus")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnValue")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnWeight")}
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      {t("pages.freights.columnDistance")}
                    </TableHead>
                    <TableHead className="w-12 pr-4 text-right text-muted-foreground">
                      {t("pages.freights.columnAction")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const slug = parseStatusSlug(row.FreightStatusType?.name);
                    const distKm = haversineKm(
                      row.origin_lat,
                      row.origin_lng,
                      row.destination_lat,
                      row.destination_lng
                    );
                    const displayValue = row.finalValue ?? row.originalValue;
                    const openFreight = () => {
                      void navigate(`/Freights/${row.id}`);
                    };

                    return (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        tabIndex={0}
                        onClick={openFreight}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openFreight();
                          }
                        }}
                      >
                        <TableCell className="pl-4" />
                        <TableCell>
                          <span className="font-semibold text-foreground">
                            {row.CargoType?.name ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground">
                            {row.assignedDriver_id != null
                              ? t("pages.freightDetail.driverId", {
                                  id: row.assignedDriver_id,
                                })
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">
                              {row.origin_label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(row.createdAt, lang)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">
                              {row.destination_label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(row.updatedAt, lang)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full font-medium",
                              statusBadgeClass(slug)
                            )}
                          >
                            {t(FREIGHT_STATUS_LABEL_KEY[slug])}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold tabular-nums text-foreground">
                            {formatCurrency(displayValue, lang)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatWeightKg(row.weight, lang)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceKm(Math.round(distKm), lang)}
                          </span>
                        </TableCell>
                        <TableCell
                          className="pr-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                                "size-8"
                              )}
                              aria-label={t("pages.freights.actionMenuLabel")}
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-40">
                              <DropdownMenuItem
                                onClick={() => navigate(`/Freights/${row.id}`)}
                              >
                                {t("pages.freights.actionEdit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setFreightToDelete(row)}
                              >
                                {t("pages.freightDetail.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <Dialog
          open={freightToDelete != null}
          onOpenChange={(open) => {
            if (!open && !deleting) setFreightToDelete(null);
          }}
        >
          <DialogContent showCloseButton={!deleting}>
            <DialogHeader>
              <DialogTitle>{t("pages.freightDetail.deleteConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("pages.freightDetail.deleteConfirmBody")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                disabled={deleting}
                onClick={() => setFreightToDelete(null)}
              >
                {t("pages.freightDetail.cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-lg"
                disabled={deleting}
                onClick={() => void handleConfirmDelete()}
              >
                {t("pages.freightDetail.confirmDelete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            {t("pages.freights.paginationShowing")}{" "}
            <strong className="font-semibold tabular-nums text-foreground">
              {from}
            </strong>
            <span className="text-muted-foreground">–</span>
            <strong className="font-semibold tabular-nums text-foreground">
              {to}
            </strong>{" "}
            {t("pages.freights.paginationOf")}{" "}
            <strong className="font-semibold tabular-nums text-foreground">
              {total}
            </strong>{" "}
            {t("pages.freights.paginationFreights")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 rounded-lg sm:min-h-9"
              disabled
            >
              {t("pages.freights.paginationPrev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 rounded-lg sm:min-h-9"
              disabled
            >
              {t("pages.freights.paginationNext")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightsPage;
