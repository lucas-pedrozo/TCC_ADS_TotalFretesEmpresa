import {
  CalendarDays,
  CircleDollarSign,
  Download,
  PackageCheck,
  Route as RouteIcon,
  Target,
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
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import { HomeKpiCard } from "@/pages/Home/components/HomeKpiCard";
import { HistoryBarChart } from "@/pages/History/components/HistoryBarChart";
import { HistoryCompletedTable } from "@/pages/History/components/HistoryCompletedTable";
import { HistoryDonutChart } from "@/pages/History/components/HistoryDonutChart";
import type { FreightDto, FreightStatusHistoryDto, FreightStatusSlug } from "@/types/freight";
import { formatDateShortLabel } from "@/utils/dateFormat";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";

type PeriodFilter = "7d" | "30d" | "90d" | "12m";

type HistoryTableRow = {
  id: number;
  code: string;
  route: string;
  cargo: string;
  value: string;
  statusLabel: string;
  statusSlug: FreightStatusSlug;
  finalizedAt: string;
  distance: string;
  statusClassName: string;
};

type CargoDistributionItem = {
  label: string;
  value: number;
  color: string;
};

type HistoryAnalytics = {
  completedCount: number;
  revenueTotal: number;
  successRate: number;
  totalDistanceKm: number;
  tableRows: HistoryTableRow[];
  performanceSeries: {
    labels: string[];
    published: number[];
    completed: number[];
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

  return Number.isFinite(distance) ? distance : 0;
}

function getCreatedTimestamp(freight: FreightDto) {
  return parseTimestamp(freight.createdAt ?? freight.updatedAt);
}

function getFinalizedTimestamp(freight: FreightDto, targetStatus: FreightStatusSlug) {
  const historyMatch = [...(freight.FreightStatusHistories ?? [])]
    .reverse()
    .find((entry) => getHistoryStatusSlug(entry) === targetStatus);

  return parseTimestamp(
    historyMatch?.occurred_at ?? historyMatch?.occurredAt ?? freight.updatedAt ?? freight.createdAt
  );
}

function percentage(part: number, total: number) {
  if (!total) return 0;
  return (part / total) * 100;
}

function buildFreightCode(freight: FreightDto, finalizedTimestamp: number | null) {
  const baseDate = finalizedTimestamp != null ? new Date(finalizedTimestamp) : new Date();
  const year = Number.isNaN(baseDate.getTime()) ? new Date().getFullYear() : baseDate.getFullYear();
  return `TF-${year}-${String(freight.id).padStart(4, "0")}`;
}

function escapeCsvValue(value: string) {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
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
    const published: number[] = [];
    const completed: number[] = [];

    for (let index = 11; index >= 0; index -= 1) {
      const start = new Date(today.getFullYear(), today.getMonth() - index, 1);
      const end =
        index === 0
          ? tomorrow
          : new Date(today.getFullYear(), today.getMonth() - index + 1, 1);

      labels.push(formatMonthBucketLabel(start, language));
      published.push(
        rows.filter((freight) => isWithinRange(getCreatedTimestamp(freight), start, end)).length
      );
      completed.push(
        rows.filter(
          (freight) =>
            getFreightStatusSlug(freight) === "concluido" &&
            isWithinRange(getFinalizedTimestamp(freight, "concluido"), start, end)
        ).length
      );
    }

    return { labels, published, completed };
  }

  const bucketCount = period === "7d" ? 7 : 6;
  const totalDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const bucketSize = Math.ceil(totalDays / bucketCount);
  const rangeStart = addDays(today, -(totalDays - 1));
  const labels: string[] = [];
  const published: number[] = [];
  const completed: number[] = [];

  for (let index = 0; index < bucketCount; index += 1) {
    const start = addDays(rangeStart, index * bucketSize);
    const end = index === bucketCount - 1 ? tomorrow : addDays(start, bucketSize);

    labels.push(formatRangeBucketLabel(start, language));
    published.push(
      rows.filter((freight) => isWithinRange(getCreatedTimestamp(freight), start, end)).length
    );
    completed.push(
      rows.filter(
        (freight) =>
          getFreightStatusSlug(freight) === "concluido" &&
          isWithinRange(getFinalizedTimestamp(freight, "concluido"), start, end)
      ).length
    );
  }

  return { labels, published, completed };
}

function HistoryPageSkeleton() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-muted/20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
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
      if (getFreightStatusSlug(freight) !== "concluido") return false;
      return isWithinRange(getFinalizedTimestamp(freight, "concluido"), periodStart, tomorrow);
    });

    const cancelledRows = rows.filter((freight) => {
      if (getFreightStatusSlug(freight) !== "cancelado") return false;
      return isWithinRange(getFinalizedTimestamp(freight, "cancelado"), periodStart, tomorrow);
    });

    const publishedRows = rows.filter((freight) =>
      isWithinRange(getCreatedTimestamp(freight), periodStart, tomorrow)
    );

    const finalizedWindowCount = completedRows.length + cancelledRows.length;
    const denominator = finalizedWindowCount > 0 ? finalizedWindowCount : publishedRows.length;
    const revenueTotal = completedRows.reduce((sum, freight) => sum + getDisplayValue(freight), 0);
    const totalDistanceKm = completedRows.reduce((sum, freight) => sum + getDistanceKm(freight), 0);

    const cargoGroups = completedRows.reduce<Map<string, number>>((map, freight) => {
      const label =
        freight.CargoType?.name?.trim() ||
        freight.cargo?.name?.trim() ||
        t("pages.history.uncategorizedCargo");
      map.set(label, (map.get(label) ?? 0) + 1);
      return map;
    }, new Map());

    const sortedCargoGroups = [...cargoGroups.entries()].sort((left, right) => right[1] - left[1]);
    const prominentCargoGroups = sortedCargoGroups.slice(0, 5);
    const otherCargoCount = sortedCargoGroups
      .slice(5)
      .reduce((sum, [, count]) => sum + count, 0);

    const cargoDistribution: CargoDistributionItem[] = prominentCargoGroups.map(
      ([label, value], index) => ({
        label,
        value,
        color: DONUT_COLORS[index % DONUT_COLORS.length],
      })
    );

    if (otherCargoCount > 0) {
      cargoDistribution.push({
        label: t("pages.history.otherCargoTypes"),
        value: otherCargoCount,
        color: DONUT_COLORS[cargoDistribution.length % DONUT_COLORS.length],
      });
    }

    const tableRows = [...completedRows]
      .sort((left, right) => {
        const leftTimestamp = getFinalizedTimestamp(left, "concluido") ?? 0;
        const rightTimestamp = getFinalizedTimestamp(right, "concluido") ?? 0;
        return rightTimestamp - leftTimestamp;
      })
      .map<HistoryTableRow>((freight) => {
        const finalizedTimestamp = getFinalizedTimestamp(freight, "concluido");
        const statusSlug = getFreightStatusSlug(freight);
        const distance = getDistanceKm(freight);

        return {
          id: freight.id,
          code: buildFreightCode(freight, finalizedTimestamp),
          route: `${freight.origin_label} - ${freight.destination_label}`,
          cargo:
            freight.CargoType?.name?.trim() ||
            freight.cargo?.name?.trim() ||
            t("pages.history.uncategorizedCargo"),
          value: formatFreightCurrencyAmount(getDisplayValue(freight), language),
          statusLabel: t(FREIGHT_STATUS_LABEL_KEY[statusSlug]),
          statusSlug,
          finalizedAt: formatDateShortLabel(
            finalizedTimestamp != null ? new Date(finalizedTimestamp).toISOString() : undefined,
            language
          ),
          distance: formatFreightDistanceKm(distance, language),
          statusClassName: statusBadgeClass(statusSlug),
        };
      });

    return {
      completedCount: completedRows.length,
      revenueTotal,
      successRate: percentage(completedRows.length, denominator),
      totalDistanceKm,
      tableRows,
      performanceSeries: buildPerformanceSeries(rows, selectedPeriod, language),
      cargoDistribution,
    };
  }, [language, rows, selectedPeriod, t]);

  const handleExport = () => {
    if (analytics.tableRows.length === 0) {
      toast.error(t("pages.history.exportEmpty"));
      return;
    }

    try {
      const header = [
        t("pages.history.table.columns.code"),
        t("pages.history.table.columns.route"),
        t("pages.history.table.columns.cargo"),
        t("pages.history.table.columns.value"),
        t("pages.history.table.columns.status"),
        t("pages.history.table.columns.finalized"),
        t("pages.freights.columnDistance"),
      ];

      const csvLines = [
        header.map(escapeCsvValue).join(","),
        ...analytics.tableRows.map((row) =>
          [
            row.code,
            row.route,
            row.cargo,
            row.value,
            row.statusLabel,
            row.finalizedAt,
            row.distance,
          ]
            .map(escapeCsvValue)
            .join(",")
        ),
      ];

      const blob = new Blob([`\uFEFF${csvLines.join("\n")}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historico-fretes-${selectedPeriod}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("pages.history.exportSuccess", { count: analytics.tableRows.length }));
    } catch {
      toast.error(t("pages.history.exportError"));
    }
  };

  if (loading && rows.length === 0) {
    return <HistoryPageSkeleton />;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-muted/20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
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
              variant="outline"
              className="min-h-11 w-full rounded-full px-5 sm:w-auto"
              onClick={handleExport}
              disabled={analytics.tableRows.length === 0}
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
            label={t("pages.history.kpis.successRate")}
            value={`${Math.round(analytics.successRate)}%`}
            description={t("pages.history.kpis.successRateDescription")}
            icon={Target}
            tone="sky"
          />
          <HomeKpiCard
            label={t("pages.history.kpis.distance")}
            value={formatFreightDistanceKm(analytics.totalDistanceKm, language)}
            description={t("pages.history.kpis.distanceDescription")}
            icon={RouteIcon}
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
                published={analytics.performanceSeries.published}
                completed={analytics.performanceSeries.completed}
                publishedLabel={t("pages.history.performancePublished")}
                completedLabel={t("pages.history.performanceCompleted")}
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
              />
            </div>
          </section>
        </section>

        <HistoryCompletedTable
          title={t("pages.history.table.title")}
          description={t("pages.history.table.description")}
          emptyLabel={t("pages.history.table.empty")}
          columns={{
            code: t("pages.history.table.columns.code"),
            route: t("pages.history.table.columns.route"),
            cargo: t("pages.history.table.columns.cargo"),
            value: t("pages.history.table.columns.value"),
            status: t("pages.history.table.columns.status"),
            finalized: t("pages.history.table.columns.finalized"),
          }}
          rows={analytics.tableRows}
        />

        {!loading && rows.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border bg-background px-5 py-6 text-center shadow-sm">
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
  