import { Filter, Plus, Search } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { FreightCard } from "@/components/freights/FreightCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { AppLanguage } from "@/i18n/resources";
import { useFreightsListPage } from "@/hooks/useFreightsListPage";
import type { ChipFilter, DriverFilter } from "@/types/freight";

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
    clearAllFilters,
    filtered,
    total,
    from,
    to,
    freightToDelete,
    setFreightToDelete,
    handleConfirmDelete,
  } = useFreightsListPage();

  const activeStatusLabel = useMemo(
    () => chips.find((item) => item.id === chip)?.label ?? t("pages.freights.chipAll"),
    [chip, chips, t]
  );

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
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-full shrink-0 justify-center gap-2 rounded-lg touch-manipulation sm:min-h-9 sm:w-auto"
                      aria-label={t("pages.freights.filterActiveStatus", {
                        status: activeStatusLabel,
                      })}
                    >
                      <Filter className="size-4 shrink-0" aria-hidden />
                      {t("pages.freights.filters")}
                      <span className="ml-0.5 max-w-[8rem] truncate rounded-full bg-brand-green-light px-2 py-0.5 text-center text-xs font-semibold text-brand-green-dark">
                        {activeStatusLabel}
                      </span>
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
                            placeholder="0,00"
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
                            placeholder="0,00"
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
                            placeholder="0.000 kg"
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
                            placeholder="0.000 kg"
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
                            placeholder="0 km"
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
                            placeholder="0 km"
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

        <div className="p-3 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[320px] rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {t("pages.freights.emptyTable")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filtered.map((freight) => (
                <FreightCard
                  key={freight.id}
                  freight={freight}
                  lang={lang}
                  onDelete={setFreightToDelete}
                />
              ))}
            </div>
          )}
        </div>
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
            <span className="text-muted-foreground"> - </span>
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
