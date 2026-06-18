import {
  CalendarDays,
  CircleDollarSign,
  Download,
  PackageCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import { Skeleton } from "@/components/ui/skeleton";
import { useFreightsListPage } from "@/hooks/useFreightsListPage";
import { useHistoryTable, type HistoryTableRow } from "@/hooks/useHistoryTable";
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import { HomeKpiCard } from "@/pages/Home/components/HomeKpiCard";
import { HistoryBarChart } from "@/pages/History/components/HistoryBarChart";
import { HistoryCompletedTable } from "@/pages/History/components/HistoryCompletedTable";
import { HistoryDonutChart } from "@/pages/History/components/HistoryDonutChart";
import type { FreightDto, FreightStatusHistoryDto, FreightStatusSlug } from "@/types/freight";
import { formatDateShortLabel } from "@/utils/dateFormat";
import { exportHistoryPdf } from "@/utils/exportHistoryPdf";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";

type PeriodFilter = "7d" | "30d" | "90d" | "12m";

type CargoDistributionItem = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
};

type HistoryAnalytics = {
  completedCount: number;
  cancelledCount: number;
  revenueTotal: number;
  completionRate: number | null;
  averageTicket: number | null;
  tableRows: HistoryTableRow[];
  performanceSeries: {
    labels: string[];
    completed: number[];
    cancelled: number[];
  };
  cargoDistribution: CargoDistributionItem[];
};

const DONUT_COLORS = ["#115339", "#66dd66", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseTimestamp(value?: string) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getLocaleTag(language: AppLanguage) {
  return language === "en" ? "en-US" : "pt-BR";
}

function getPeriodStart(period: PeriodFilter, endDate: Date) {
  if (period === "12m") {
    return new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);
  }

  const dayMap: Record<Exclude<PeriodFilter, "12m">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  return addDays(endDate, -(dayMap[period] - 1));
}

function getPeriodLabel(period: PeriodFilter, t: (key: string) => string) {
  const labels: Record<PeriodFilter, string> = {
    "7d": t("pages.history.periods.last7Days"),
    "30d": t("pages.history.periods.last30Days"),
    "90d": t("pages.history.periods.last90Days"),
    "12m": t("pages.history.periods.last12Months"),
  };
  return labels[period];
}

function isWithinRange(timestamp: number | null, start: Date, endExclusive: Date) {
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

function getDisplayValue(freight: FreightDto) {
  return freight.finalValue ?? freight.originalValue;
}

function getDistanceKm(freight: FreightDto) {
  const distance = haversineKm(
    freight.origin_lat,
    freight.origin_lng,
    freight.destination_lat,
    freight.destination_lng
  );

  return Number.isFinite(distance) ? Math.round(distance) : 0;
}

function getFinalizedTimestamp(freight: FreightDto, targetStatus: FreightStatusSlug) {
  const historyMatch = [...(freight.FreightStatusHistories ?? [])]
    .reverse()
    .find((entry) => getHistoryStatusSlug(entry) === targetStatus);

  return parseTimestamp(
    historyMatch?.occurred_at ?? historyMatch?.occurredAt ?? freight.updatedAt ?? freight.createdAt
  );
}

function getConcludedTimestamp(freight: FreightDto) {
  const historyMatch = [...(freight.FreightStatusHistories ?? [])]
    .reverse()
    .find((entry) => getHistoryStatusSlug(entry) === "concluido");

  const status = getFreightStatusSlug(freight);
  if (status !== "concluido") return null;

  return parseTimestamp(
    historyMatch?.occurred_at ?? historyMatch?.occurredAt ?? freight.updatedAt ?? freight.createdAt
  );
}

function isFinalizedFreight(freight: FreightDto) {
  return getFreightStatusSlug(freight) === "concluido";
}

function isCancelledFreight(freight: FreightDto) {
  return getFreightStatusSlug(freight) === "cancelado";
}

function getHistoryTimestamp(freight: FreightDto) {
  if (isFinalizedFreight(freight)) {
    return getConcludedTimestamp(freight);
  }
  if (isCancelledFreight(freight)) {
    return getFinalizedTimestamp(freight, "cancelado");
  }
  return null;
}

function percentage(part: number, total: number) {
  if (!total) return null;
  return (part / total) * 100;
}

function buildFreightCode(freight: FreightDto, finalizedTimestamp: number | null) {
  const baseDate = finalizedTimestamp != null ? new Date(finalizedTimestamp) : new Date();
  const year = Number.isNaN(baseDate.getTime()) ? new Date().getFullYear() : baseDate.getFullYear();
  return `TF-${year}-${String(freight.id).padStart(4, "0")}`;
}

function formatRangeBucketLabel(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function formatMonthBucketLabel(date: Date, language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function buildPerformanceSeries(
  rows: FreightDto[],
  period: PeriodFilter,
  language: AppLanguage
) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  if (period === "12m") {
    const labels: string[] = [];
    const completed: number[] = [];
    const cancelled: number[] = [];

    for (let index = 11; index >= 0; index -= 1) {
      const start = new Date(today.getFullYear(), today.getMonth() - index, 1);
      const end =
        index === 0
          ? tomorrow
          : new Date(today.getFullYear(), today.getMonth() - index + 1, 1);

      labels.push(formatMonthBucketLabel(start, language));
      completed.push(
        rows.filter(
          (freight) =>
            isFinalizedFreight(freight) &&
            isWithinRange(getConcludedTimestamp(freight), start, end)
        ).length
      );
      cancelled.push(
        rows.filter(
          (freight) =>
            getFreightStatusSlug(freight) === "cancelado" &&
            isWithinRange(getFinalizedTimestamp(freight, "cancelado"), start, end)
        ).length
      );
    }

    return { labels, completed, cancelled };
  }

  const bucketCount = period === "7d" ? 7 : 6;
  const totalDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const bucketSize = Math.ceil(totalDays / bucketCount);
  const rangeStart = addDays(today, -(totalDays - 1));
  const labels: string[] = [];
  const completed: number[] = [];
  const cancelled: number[] = [];

  for (let index = 0; index < bucketCount; index += 1) {
    const start = addDays(rangeStart, index * bucketSize);
    const end = index === bucketCount - 1 ? tomorrow : addDays(start, bucketSize);

    labels.push(formatRangeBucketLabel(start, language));
    completed.push(
      rows.filter(
        (freight) =>
          isFinalizedFreight(freight) &&
          isWithinRange(getConcludedTimestamp(freight), start, end)
      ).length
    );
    cancelled.push(
      rows.filter(
        (freight) =>
          getFreightStatusSlug(freight) === "cancelado" &&
          isWithinRange(getFinalizedTimestamp(freight, "cancelado"), start, end)
      ).length
    );
  }

  return { labels, completed, cancelled };
}

function HistoryPageSkeleton() {
  return (
    <div
      data-testid="history-page"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-muted/20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[154px] rounded-2xl" />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <Skeleton className="h-[420px] rounded-[28px]" />
          <Skeleton className="h-[420px] rounded-[28px]" />
        </section>

        <Skeleton className="h-[320px] rounded-[28px]" />
      </div>
    </div>
  );
}

const HistoryPage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const { rows, loading } = useFreightsListPage();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("30d");

  const periodOptions = [
    { id: "7d" as const, label: t("pages.history.periods.last7Days") },
    { id: "30d" as const, label: t("pages.history.periods.last30Days") },
    { id: "90d" as const, label: t("pages.history.periods.last90Days") },
    { id: "12m" as const, label: t("pages.history.periods.last12Months") },
  ];

  const analytics = useMemo<HistoryAnalytics>(() => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const periodStart = getPeriodStart(selectedPeriod, today);

    const completedRows = rows.filter((freight) => {
      if (!isFinalizedFreight(freight)) return false;
      return isWithinRange(getConcludedTimestamp(freight), periodStart, tomorrow);
    });

    const cancelledRows = rows.filter((freight) => {
      if (!isCancelledFreight(freight)) return false;
      return isWithinRange(getFinalizedTimestamp(freight, "cancelado"), periodStart, tomorrow);
    });

    const revenueTotal = completedRows.reduce((sum, freight) => sum + getDisplayValue(freight), 0);
    const finalizedCount = completedRows.length + cancelledRows.length;

    const cargoGroups = completedRows.reduce<Map<string, number>>((map, freight) => {
      const label =
        freight.CargoType?.name?.trim() ||
        freight.cargo?.name?.trim() ||
        t("pages.history.uncategorizedCargo");
      map.set(label, (map.get(label) ?? 0) + getDisplayValue(freight));
      return map;
    }, new Map());

    const sortedCargoGroups = [...cargoGroups.entries()].sort((left, right) => right[1] - left[1]);
    const prominentCargoGroups = sortedCargoGroups.slice(0, 5);
    const otherCargoRevenue = sortedCargoGroups
      .slice(5)
      .reduce((sum, [, revenue]) => sum + revenue, 0);

    const cargoDistribution: CargoDistributionItem[] = prominentCargoGroups.map(
      ([label, revenue], index) => ({
        label,
        value: revenue,
        displayValue: formatFreightCurrencyAmount(revenue, language),
        color: DONUT_COLORS[index % DONUT_COLORS.length],
      })
    );

    if (otherCargoRevenue > 0) {
      cargoDistribution.push({
        label: t("pages.history.otherCargoTypes"),
        value: otherCargoRevenue,
        displayValue: formatFreightCurrencyAmount(otherCargoRevenue, language),
        color: DONUT_COLORS[cargoDistribution.length % DONUT_COLORS.length],
      });
    }

    const tableRows = [...completedRows, ...cancelledRows]
      .sort((left, right) => {
        const leftTimestamp = getHistoryTimestamp(left) ?? 0;
        const rightTimestamp = getHistoryTimestamp(right) ?? 0;
        return rightTimestamp - leftTimestamp;
      })
      .map<HistoryTableRow>((freight) => {
        const finalizedTimestamp = getHistoryTimestamp(freight);
        const statusSlug = getFreightStatusSlug(freight);
        const distanceNumeric = getDistanceKm(freight);
        const valueNumeric = getDisplayValue(freight);

        return {
          id: freight.id,
          code: buildFreightCode(freight, finalizedTimestamp),
          route: `${freight.origin_label} - ${freight.destination_label}`,
          cargo:
            freight.CargoType?.name?.trim() ||
            freight.cargo?.name?.trim() ||
            t("pages.history.uncategorizedCargo"),
          value: formatFreightCurrencyAmount(valueNumeric, language),
          valueNumeric,
          statusLabel: t(FREIGHT_STATUS_LABEL_KEY[statusSlug]),
          statusSlug,
          finalizedAt: formatDateShortLabel(
            finalizedTimestamp != null ? new Date(finalizedTimestamp).toISOString() : undefined,
            language
          ),
          distance: formatFreightDistanceKm(distanceNumeric, language),
          distanceNumeric,
          statusClassName: statusBadgeClass(statusSlug),
        };
      });

    return {
      completedCount: completedRows.length,
      cancelledCount: cancelledRows.length,
      revenueTotal,
      completionRate: percentage(completedRows.length, finalizedCount),
      averageTicket: completedRows.length > 0 ? revenueTotal / completedRows.length : null,
      tableRows,
      performanceSeries: buildPerformanceSeries(rows, selectedPeriod, language),
      cargoDistribution,
    };
  }, [language, rows, selectedPeriod, t]);

  const historyTable = useHistoryTable({
    rows: analytics.tableRows,
    resetKey: selectedPeriod,
  });

  const historyFilterActiveLabel = useMemo(() => {
    if (historyTable.filterCargo !== historyTable.allCargoValue) {
      return historyTable.filterCargo;
    }
    if (historyTable.activeFilterCount > 0) {
      return t("pages.history.table.filterActiveCustom");
    }
    return t("pages.history.table.filterAllCargo");
  }, [
    historyTable.activeFilterCount,
    historyTable.allCargoValue,
    historyTable.filterCargo,
    t,
  ]);

  const formatRate = (rate: number | null) => {
    if (rate == null) return "—";
    return `${Math.round(rate)}%`;
  };

  const formatAverageTicket = (value: number | null) => {
    if (value == null) return "—";
    return formatFreightCurrencyAmount(value, language);
  };

  const handleExport = () => {
    if (historyTable.filtered.length === 0) {
      toast.error(t("pages.history.exportEmpty"));
      return;
    }

    try {
      const generatedAt = new Intl.DateTimeFormat(getLocaleTag(language), {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date());

      exportHistoryPdf(
        {
          title: t("pages.history.title"),
          periodLabel: getPeriodLabel(selectedPeriod, t),
          generatedAt,
          kpis: [
            {
              label: t("pages.history.kpis.completed"),
              value: analytics.completedCount.toLocaleString(getLocaleTag(language)),
            },
            {
              label: t("pages.history.kpis.revenue"),
              value: formatFreightCurrencyAmount(analytics.revenueTotal, language),
            },
            {
              label: t("pages.history.kpis.completionRate"),
              value: formatRate(analytics.completionRate),
            },
            {
              label: t("pages.history.kpis.averageTicket"),
              value: formatAverageTicket(analytics.averageTicket),
            },
          ],
          columns: [
            t("pages.history.table.columns.code"),
            t("pages.history.table.columns.route"),
            t("pages.history.table.columns.cargo"),
            t("pages.history.table.columns.value"),
            t("pages.history.table.columns.status"),
            t("pages.history.table.columns.finalized"),
            t("pages.history.table.columns.distance"),
          ],
          rows: historyTable.filtered.map((row) => ({
            code: row.code,
            route: row.route,
            cargo: row.cargo,
            value: row.value,
            status: row.statusLabel,
            finalized: row.finalizedAt,
            distance: row.distance,
          })),
          footerLabel: t("pages.history.exportFooter", { count: historyTable.filtered.length }),
        },
        `historico-fretes-${selectedPeriod}.pdf`
      );

      toast.success(
        t("pages.history.exportSuccess", { count: historyTable.filtered.length })
      );
    } catch {
      toast.error(t("pages.history.exportError"));
    }
  };

  if (loading && rows.length === 0) {
    return <HistoryPageSkeleton />;
  }

  return (
    <div
      data-testid="history-page"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-muted/20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("pages.history.eyebrow")}
              </p>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {t("pages.history.title")}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  {t("pages.history.description")}
                </p>
              </div>
            </div>

            <Button
              type="button"
              data-testid="history-export-button"
              variant="outline"
              className="min-h-11 w-full rounded-full px-5 sm:w-auto"
              onClick={handleExport}
              disabled={historyTable.filtered.length === 0}
            >
              <Download className="size-4" />
              {t("pages.history.exportButton")}
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                data-testid={`history-period-${option.id}`}
                variant="ghost"
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  selectedPeriod === option.id
                    ? "border-brand-green-dark bg-brand-green-dark text-white hover:bg-brand-green-dark/90 hover:text-white"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSelectedPeriod(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <HomeKpiCard
            label={t("pages.history.kpis.completed")}
            value={analytics.completedCount.toLocaleString(getLocaleTag(language))}
            description={t("pages.history.kpis.completedDescription")}
            icon={PackageCheck}
            tone="brand"
          />
          <HomeKpiCard
            label={t("pages.history.kpis.revenue")}
            value={formatFreightCurrencyAmount(analytics.revenueTotal, language)}
            description={t("pages.history.kpis.revenueDescription")}
            icon={CircleDollarSign}
            tone="emerald"
          />
          <HomeKpiCard
            label={t("pages.history.kpis.completionRate")}
            value={formatRate(analytics.completionRate)}
            description={t("pages.history.kpis.completionRateDescription")}
            icon={Target}
            tone="sky"
          />
          <HomeKpiCard
            label={t("pages.history.kpis.averageTicket")}
            value={formatAverageTicket(analytics.averageTicket)}
            description={t("pages.history.kpis.averageTicketDescription")}
            icon={TrendingUp}
            tone="amber"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <section className="rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {t("pages.history.performanceTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pages.history.performanceDescription")}
              </p>
            </div>

            <div className="mt-5">
              <HistoryBarChart
                labels={analytics.performanceSeries.labels}
                completed={analytics.performanceSeries.completed}
                cancelled={analytics.performanceSeries.cancelled}
                completedLabel={t("pages.history.performanceCompleted")}
                cancelledLabel={t("pages.history.performanceCancelled")}
                emptyLabel={t("pages.history.emptyChart")}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {t("pages.history.distributionTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pages.history.distributionDescription")}
              </p>
            </div>

            <div className="mt-5">
              <HistoryDonutChart
                items={analytics.cargoDistribution}
                emptyLabel={t("pages.history.emptyDistribution")}
                totalLabel={t("pages.history.distributionTotal")}
                centerValue={formatFreightCurrencyAmount(analytics.revenueTotal, language)}
              />
            </div>
          </section>
        </section>

        <HistoryCompletedTable
          title={t("pages.history.table.title")}
          description={t("pages.history.table.description")}
          emptyLabel={t("pages.history.table.empty")}
          searchPlaceholder={t("pages.history.table.searchPlaceholder")}
          filtersLabel={t("pages.history.table.filters")}
          filterPanelTitle={t("pages.history.table.filterPanelTitle")}
          filterPanelHint={t("pages.history.table.filterPanelHint")}
          filterSectionCargo={t("pages.history.table.filterSectionCargo")}
          filterAllCargo={t("pages.history.table.filterAllCargo")}
          filterActiveLabel={historyFilterActiveLabel}
          filterSectionValue={t("pages.freights.filterSectionValue")}
          filterValueHelp={t("pages.freights.filterValueHelp")}
          filterSectionDistance={t("pages.freights.filterSectionDistance")}
          filterDistanceHelp={t("pages.freights.filterDistanceHelp")}
          filterMin={t("pages.freights.filterMin")}
          filterMax={t("pages.freights.filterMax")}
          clearFiltersLabel={t("pages.freights.filterClear")}
          paginationShowing={t("pages.freights.paginationShowing")}
          paginationOf={t("pages.freights.paginationOf")}
          paginationFreights={t("pages.freights.paginationFreights")}
          paginationPrev={t("pages.freights.paginationPrev")}
          paginationNext={t("pages.freights.paginationNext")}
          columns={{
            code: t("pages.history.table.columns.code"),
            route: t("pages.history.table.columns.route"),
            cargo: t("pages.history.table.columns.cargo"),
            value: t("pages.history.table.columns.value"),
            status: t("pages.history.table.columns.status"),
            finalized: t("pages.history.table.columns.finalized"),
            distance: t("pages.history.table.columns.distance"),
          }}
          search={historyTable.search}
          onSearchChange={historyTable.setSearch}
          filterCargo={historyTable.filterCargo}
          onFilterCargoChange={historyTable.setFilterCargo}
          allCargoValue={historyTable.allCargoValue}
          cargoOptions={historyTable.cargoOptions}
          filterMinValue={historyTable.filterMinValue}
          onFilterMinValueChange={historyTable.setFilterMinValue}
          filterMaxValue={historyTable.filterMaxValue}
          onFilterMaxValueChange={historyTable.setFilterMaxValue}
          filterMinDistance={historyTable.filterMinDistance}
          onFilterMinDistanceChange={historyTable.setFilterMinDistance}
          filterMaxDistance={historyTable.filterMaxDistance}
          onFilterMaxDistanceChange={historyTable.setFilterMaxDistance}
          activeFilterCount={historyTable.activeFilterCount}
          onClearFilters={historyTable.clearAllFilters}
          rows={historyTable.paginatedRows}
          total={historyTable.total}
          from={historyTable.from}
          to={historyTable.to}
          canGoPrev={historyTable.canGoPrev}
          canGoNext={historyTable.canGoNext}
          onPrev={historyTable.goPrev}
          onNext={historyTable.goNext}
        />

        {!loading && rows.length === 0 ? (
          <section
            data-testid="history-empty-state"
            className="rounded-[28px] border border-dashed border-border bg-background px-5 py-6 text-center shadow-sm"
          >
            <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <CalendarDays className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {t("pages.history.emptyStateTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.history.emptyStateDescription")}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default HistoryPage;
