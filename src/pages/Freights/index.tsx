import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
import { useFreightsListPage } from "@/hooks/useFreightsListPage";
import { cn } from "@/lib/utils";
import type { ChipFilter, DriverFilter } from "@/types/freight";
import { formatDateShortLabel } from "@/utils/dateFormat";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
  formatFreightWeightKg,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";

import {
  FREIGHT_STATUS_LABEL_KEY,
  parseStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";

const FreightsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const navigate = useNavigate();
  const {
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
  } = useFreightsListPage();

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
                            {row.name?.trim()
                              ? row.name.trim()
                              : t("pages.freights.freightTitleFallback", { id: row.id })}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
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
                            {formatDateShortLabel(row.createdAt, lang)}
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
                            {formatDateShortLabel(row.updatedAt, lang)}
                          </dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border pt-3 text-sm">
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatFreightCurrencyAmount(displayValue, lang)}
                        </span>
                        <span className="text-muted-foreground">
                          {row.weight == null ? "—" : formatFreightWeightKg(row.weight, lang)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatFreightDistanceKm(Math.round(distKm), lang)}
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
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground">
                              {row.name?.trim()
                                ? row.name.trim()
                                : t("pages.freights.freightTitleFallback", { id: row.id })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {row.CargoType?.name ?? "—"}
                            </span>
                          </div>
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
                              {formatDateShortLabel(row.createdAt, lang)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">
                              {row.destination_label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateShortLabel(row.updatedAt, lang)}
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
                            {formatFreightCurrencyAmount(displayValue, lang)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {row.weight == null ? "—" : formatFreightWeightKg(row.weight, lang)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatFreightDistanceKm(Math.round(distKm), lang)}
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
