import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  PackageCheck,
  Route,
  Truck,
  TruckIcon,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import { Skeleton } from "@/components/ui/skeleton";
import { useFreightsListPage } from "@/hooks/useFreightsListPage";
import { useProposalsListPage } from "@/hooks/useProposalsListPage";
import type { AppLanguage } from "@/i18n/resources";
import type { SideLayoutOutletContext } from "@/layout/sideLayoutOutletContext";
import { cn } from "@/lib/utils";
import { HomeKpiCard } from "@/pages/Home/components/HomeKpiCard";
import { HomeLineChart } from "@/pages/Home/components/HomeLineChart";
import { HomeProgressMetric } from "@/pages/Home/components/HomeProgressMetric";
import { HomeRecentNotifications } from "@/pages/Home/components/HomeRecentNotifications";
import type { FreightDto } from "@/types/freight";
import { formatDateShortLabel, formatDateTimeLabel } from "@/utils/dateFormat";
import { formatFreightCurrencyAmount } from "@/utils/freightFormat";
import { initialsFromName } from "@/utils/person";
import { getFreightFromProposal, resolveProposalSummary } from "@/utils/proposal";
import { selectableItemHoverClassName } from "@/utils/ui";

function getLocaleTag(language: AppLanguage) {
  return language === "en" ? "en-US" : "pt-BR";
}

function toTimestamp(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortByMostRecent<T extends { id: number; createdAt?: string; updatedAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const diff =
      toTimestamp(right.createdAt ?? right.updatedAt) -
      toTimestamp(left.createdAt ?? left.updatedAt);

    if (diff !== 0) return diff;
    return right.id - left.id;
  });
}

function formatLongDate(language: AppLanguage) {
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function percentage(part: number, total: number) {
  if (!total) return 0;
  return (part / total) * 100;
}

function buildEvolutionSeries(freights: FreightDto[], language: AppLanguage) {
  const pointCount = 7;
  const endDate = startOfDay(new Date());
  const startDate = addDays(endDate, -30);
  const createdTimestamps = freights
    .map((freight) => toTimestamp(freight.createdAt))
    .filter((value) => value > 0);
  const completedTimestamps = freights
    .filter((freight) => resolveFreightStatusSlug({
      statusId: freight.status_id,
      statusName: freight.FreightStatusType?.name ?? freight.status?.name,
    }) === "concluido")
    .map((freight) => toTimestamp(freight.updatedAt ?? freight.createdAt))
    .filter((value) => value > 0);

  const labels: string[] = [];
  const published: number[] = [];
  const completed: number[] = [];

  for (let index = 0; index < pointCount; index += 1) {
    const progress = index / (pointCount - 1);
    const pointDate =
      index === pointCount - 1
        ? endDate
        : addDays(startDate, Math.round(30 * progress));
    const pointTimestamp = pointDate.getTime();
    const startTimestamp = startDate.getTime();

    labels.push(
      new Intl.DateTimeFormat(getLocaleTag(language), {
        day: "2-digit",
        month: "2-digit",
      }).format(pointDate)
    );
    published.push(
      createdTimestamps.filter(
        (timestamp) => timestamp >= startTimestamp && timestamp <= pointTimestamp
      ).length
    );
    completed.push(
      completedTimestamps.filter(
        (timestamp) => timestamp >= startTimestamp && timestamp <= pointTimestamp
      ).length
    );
  }

  return { labels, published, completed };
}

function HomePage() {
  const { companyData } = useOutletContext<SideLayoutOutletContext>();
  const { t, i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const companyName = companyData?.name?.trim() || t("header.companyNameFallback");

  const { rows: freightRows, loading: freightsLoading } = useFreightsListPage();
  const {
    loading: proposalsLoading,
    items: proposalItems,
    summary: proposalSummary,
  } = useProposalsListPage({
    defaultStatusFilter: "todas",
    pageSize: 4,
  });

  const sortedFreights = useMemo(() => sortByMostRecent(freightRows), [freightRows]);
  const sortedProposals = useMemo(() => sortByMostRecent(proposalItems), [proposalItems]);
  const derivedProposalSummary = useMemo(
    () => resolveProposalSummary(proposalSummary, proposalItems),
    [proposalItems, proposalSummary]
  );

  const homeMetrics = useMemo(() => {
    const statusCounts = {
      active: 0,
      available: 0,
      inTransit: 0,
      completed: 0,
      assigned: 0,
      cancelled: 0,
    };

    let potentialRevenue = 0;

    for (const freight of freightRows) {
      const slug = resolveFreightStatusSlug({
        statusId: freight.status_id,
        statusName: freight.FreightStatusType?.name ?? freight.status?.name,
      });
      const displayValue = freight.finalValue ?? freight.originalValue;

      if (slug !== "cancelado") {
        potentialRevenue += displayValue;
      }

      if (freight.assignedDriver_id != null) {
        statusCounts.assigned += 1;
      }

      if (slug === "cancelado") {
        statusCounts.cancelled += 1;
        continue;
      }

      if (slug === "disponivel") {
        statusCounts.available += 1;
      }

      if (slug === "em_transito" || slug === "em_rota_entrega") {
        statusCounts.inTransit += 1;
      }

      if (slug === "concluido") {
        statusCounts.completed += 1;
      } else {
        statusCounts.active += 1;
      }
    }

    return {
      ...statusCounts,
      totalFreights: freightRows.length,
      potentialRevenue,
      completionRate: percentage(statusCounts.completed, freightRows.length),
      assignedRate: percentage(statusCounts.assigned, freightRows.length),
      transitRate: percentage(statusCounts.inTransit, freightRows.length),
      proposalAcceptanceRate: percentage(
        derivedProposalSummary.acceptedProposals,
        derivedProposalSummary.totalProposals
      ),
    };
  }, [derivedProposalSummary, freightRows]);

  const evolutionSeries = useMemo(
    () => buildEvolutionSeries(freightRows, language),
    [freightRows, language]
  );

  const recentFreights = useMemo(() => {
    const allowedStatuses = new Set(["disponivel", "vinculado", "em_transito", "entregue"]);

    return sortedFreights
      .filter((freight) => {
        const slug = resolveFreightStatusSlug({
          statusId: freight.status_id,
          statusName: freight.FreightStatusType?.name ?? freight.status?.name,
        });
        return allowedStatuses.has(slug);
      })
      .slice(0, 5);
  }, [sortedFreights]);
  const recentProposals = useMemo(() => sortedProposals.slice(0, 4), [sortedProposals]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-muted/20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-5">
        <section className="min-w-0 rounded-[28px] border border-border bg-background px-5 py-6 shadow-sm md:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {formatLongDate(language)}
              </p>
              <div className="space-y-2">
                <h2 className="break-words text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {t("pages.home.welcomeBack", { name: companyName })}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  {t("pages.home.overview")}
                </p>
              </div>
            </div>

            <Link
              to="/Freights/new"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full rounded-full bg-brand-green-dark px-5 text-white hover:bg-brand-green-dark/90 sm:w-auto"
              )}
            >
              {t("pages.home.publishFreight")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {freightsLoading && freightRows.length === 0 ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-[154px] rounded-2xl" />
            ))
          ) : (
            <>
              <HomeKpiCard
                label={t("pages.home.kpis.activeFreights")}
                value={homeMetrics.active}
                description={t("pages.home.kpis.activeDescription")}
                icon={TruckIcon}
              />
              <HomeKpiCard
                label={t("pages.home.kpis.availableFreights")}
                value={homeMetrics.available}
                description={t("pages.home.kpis.availableDescription")}
                icon={PackageCheck}
                tone="sky"
              />
              <HomeKpiCard
                label={t("pages.home.kpis.inTransitFreights")}
                value={homeMetrics.inTransit}
                description={t("pages.home.kpis.inTransitDescription")}
                icon={Route}
                tone="amber"
              />
              <HomeKpiCard
                label={t("pages.home.kpis.completedFreights")}
                value={homeMetrics.completed}
                description={t("pages.home.kpis.completedDescription")}
                icon={BadgeCheck}
                tone="emerald"
              />
              <HomeKpiCard
                label={t("pages.home.kpis.potentialRevenue")}
                value={formatFreightCurrencyAmount(homeMetrics.potentialRevenue, language)}
                description={t("pages.home.kpis.potentialRevenueDescription")}
                icon={CircleDollarSign}
                tone="slate"
              />
            </>
          )}
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
          <div className="min-w-0 rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("pages.home.evolutionTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.home.evolutionDescription")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-[#115339]" />
                  {t("pages.home.evolutionPublished")}
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full bg-[#84cc16]" />
                  {t("pages.home.evolutionCompleted")}
                </span>
              </div>
            </div>

            {freightsLoading && freightRows.length === 0 ? (
              <Skeleton className="h-[290px] rounded-2xl" />
            ) : (
              <HomeLineChart
                labels={evolutionSeries.labels}
                published={evolutionSeries.published}
                completed={evolutionSeries.completed}
              />
            )}
          </div>

          <aside className="min-w-0 rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
            <div className="mb-6 space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t("pages.home.performanceTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pages.home.performanceDescription")}
              </p>
            </div>

            <div className="space-y-5">
              <HomeProgressMetric
                label={t("pages.home.performance.completionRate")}
                value={homeMetrics.completionRate}
              />
              <HomeProgressMetric
                label={t("pages.home.performance.acceptanceRate")}
                value={homeMetrics.proposalAcceptanceRate}
              />
              <HomeProgressMetric
                label={t("pages.home.performance.assignedRate")}
                value={homeMetrics.assignedRate}
              />
              <HomeProgressMetric
                label={t("pages.home.performance.transitRate")}
                value={homeMetrics.transitRate}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {t("pages.home.performance.potentialRevenue")}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {formatFreightCurrencyAmount(homeMetrics.potentialRevenue, language)}
              </p>
            </div>
          </aside>
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
          <div className="min-w-0 rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("pages.home.recentFreightsTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.home.recentFreightsDescription")}
                </p>
              </div>

              <Link
                to="/Freights"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-green-dark transition-colors hover:text-brand-green"
              >
                {t("pages.home.viewAllFreights")}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {freightsLoading && freightRows.length === 0 ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-[86px] rounded-2xl" />
                ))
              ) : recentFreights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                  {t("pages.home.emptyFreights")}
                </div>
              ) : (
                recentFreights.map((freight) => {
                  const slug = resolveFreightStatusSlug({
                    statusId: freight.status_id,
                    statusName: freight.FreightStatusType?.name ?? freight.status?.name,
                  });
                  const freightLabel =
                    freight.name?.trim() ||
                    t("pages.freights.freightTitleFallback", { id: freight.id });
                  const freightValue = freight.finalValue ?? freight.originalValue;

                  return (
                    <Link
                      key={freight.id}
                      to={`/Freights/${freight.id}`}
                      className={cn(
                        "flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/10 p-4 transition-all hover:border-brand-green/30 hover:shadow-sm md:flex-row md:items-center md:justify-between",
                        selectableItemHoverClassName
                      )}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green-light/60 text-brand-green-dark">
                          <Truck className="size-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-base font-semibold text-foreground">
                            {freightLabel}
                          </p>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {freight.origin_label} <span aria-hidden>→</span>{" "}
                            {freight.destination_label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateShortLabel(freight.createdAt, language)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                        <p className="text-lg font-bold tracking-tight text-foreground">
                          {formatFreightCurrencyAmount(freightValue, language)}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn("rounded-full font-medium", statusBadgeClass(slug))}
                        >
                          {t(FREIGHT_STATUS_LABEL_KEY[slug])}
                        </Badge>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <HomeRecentNotifications />
        </section>

        <section className="min-w-0 rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t("pages.home.recentProposalsTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pages.home.recentProposalsDescription")}
              </p>
            </div>

            <Link
              to="/Proposals"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-green-dark transition-colors hover:text-brand-green"
            >
              {t("pages.home.manageProposals")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {proposalsLoading && proposalItems.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[180px] rounded-2xl" />
              ))}
            </div>
          ) : recentProposals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              {t("pages.home.emptyProposals")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recentProposals.map((proposal) => {
                const linkedFreight = getFreightFromProposal(proposal);
                const driverFallback = t("pages.home.driverFallback", {
                  id: proposal.driver_id,
                });
                const driverLabel = proposal.Driver?.name?.trim() || driverFallback;
                const driverImageUrl = proposal.Driver?.UserImage?.url?.trim() || null;

                return (
                  <Link
                    key={proposal.id}
                    to={`/Proposals/${proposal.id}`}
                    className="rounded-2xl border border-border/80 bg-muted/10 p-4 transition-all hover:border-brand-green/30 hover:bg-muted/30 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-11">
                        {driverImageUrl ? (
                          <AvatarImage src={driverImageUrl} alt={driverLabel} />
                        ) : null}
                        <AvatarFallback className="bg-brand-green-light/60 text-sm font-semibold text-brand-green-dark">
                          {initialsFromName(driverLabel)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {driverLabel}
                        </p>
                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {linkedFreight
                            ? `${linkedFreight.origin_label} → ${linkedFreight.destination_label}`
                            : t("pages.home.routeUnavailable")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTimeLabel(proposal.createdAt, language)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-border/60 pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t("pages.home.proposalValue")}
                      </p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                        {formatFreightCurrencyAmount(proposal.value, language)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
