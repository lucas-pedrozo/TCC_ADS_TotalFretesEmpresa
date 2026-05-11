import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { trataErroAxios } from "@/utils/trataErroAxios";

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-6">
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md lg:max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("pages.freights.searchPlaceholder")}
                className="rounded-lg border-border pl-9"
                aria-label={t("pages.freights.searchPlaceholder")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg gap-2"
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
                      <p className="text-xs font-medium text-foreground">
                        {t("pages.freights.filterSectionStatus")}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {chips.map((c) => {
                          const active = chip === c.id;
                          return (
                            <Button
                              key={c.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-9 w-full shrink-0 justify-start rounded-lg font-normal",
                                active &&
                                  "border-brand-green-dark bg-brand-green font-medium text-white hover:bg-brand-green-dark hover:text-white"
                              )}
                              onClick={() => setChip(c.id)}
                            >
                              {c.label}
                            </Button>
                          );
                        })}
                      </div>
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
                      <p className="text-xs font-medium text-foreground">
                        {t("pages.freights.filterSectionDriver")}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {(
                          [
                            ["all", t("pages.freights.filterDriverAll")],
                            ["with", t("pages.freights.filterDriverWith")],
                            ["without", t("pages.freights.filterDriverWithout")],
                          ] as const
                        ).map(([id, label]) => {
                          const active = filterDriver === id;
                          return (
                            <Button
                              key={id}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-9 w-full justify-start rounded-lg font-normal",
                                active &&
                                  "border-brand-green-dark bg-brand-green font-medium text-white hover:bg-brand-green-dark hover:text-white"
                              )}
                              onClick={() => setFilterDriver(id)}
                            >
                              {label}
                            </Button>
                          );
                        })}
                      </div>
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
                className="rounded-lg gap-2 bg-brand-green text-white hover:bg-brand-green-dark"
                onClick={() => navigate("/Freights/new")}
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                {t("pages.freights.newFreight")}
              </Button>
            </div>
          </div>
        </div>

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
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j} className={j === 0 ? "pl-4" : ""}>
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                  {t("pages.freights.emptyTable")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const slug = parseStatusSlug(row.FreightStatusType?.name);
                const distKm = haversineKm(
                  row.origin_lat,
                  row.origin_lng,
                  row.destination_lat,
                  row.destination_lng
                );
                const displayValue = row.finalValue ?? row.originalValue;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="pl-4">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input accent-brand-green"
                        aria-label={t("pages.freights.selectRow")}
                      />
                    </TableCell>
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
                    <TableCell className="pr-4 text-right">
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
                            {t("pages.freights.actionView")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/Freights/${row.id}`)}
                          >
                            {t("pages.freights.actionEdit")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="text-sm text-muted-foreground">
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled
            >
              {t("pages.freights.paginationPrev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
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
