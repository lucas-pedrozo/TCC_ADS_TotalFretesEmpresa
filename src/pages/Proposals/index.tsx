import { Filter, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ProposalCard } from "@/components/proposals/ProposalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useProposalsListPage } from "@/hooks/useProposalsListPage";
import type { AppLanguage } from "@/i18n/resources";
import type { ProposalStatusFilter } from "@/types/proposal";

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
    </div>
  );
}

const STATUS_FILTER_OPTIONS: ProposalStatusFilter[] = [
  "enviada",
  "aceita",
  "recusada",
  "nao_selecionada",
  "todas",
];

const ProposalsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    defaultStatusFilter,
    activeFilterCount,
    clearStatusFilter,
    loading,
    items,
    summary,
    total,
    from,
    to,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
  } = useProposalsListPage();

  const emptyMessageKey =
    statusFilter === "enviada"
      ? "pages.proposals.emptyPending"
      : statusFilter === "aceita"
        ? "pages.proposals.emptyAccepted"
        : statusFilter === "recusada"
          ? "pages.proposals.emptyRejected"
          : statusFilter === "nao_selecionada"
            ? "pages.proposals.emptyNotSelected"
            : "pages.proposals.emptyAll";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading && items.length === 0 ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[76px] rounded-xl" />
          ))
        ) : (
          <>
            <KpiCard label={t("pages.proposals.kpiUniqueFreights")} value={summary.uniqueFreights} />
            <KpiCard label={t("pages.proposals.kpiTotalReceived")} value={summary.totalProposals} />
            <KpiCard label={t("pages.proposals.kpiPending")} value={summary.pendingProposals} />
            <KpiCard label={t("pages.proposals.kpiAccepted")} value={summary.acceptedProposals} />
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-3 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("pages.proposals.searchPlaceholder")}
                className="h-11 rounded-lg border-border bg-background pl-10"
              />
            </div>

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full shrink-0 justify-center gap-2 rounded-lg sm:h-9 sm:w-auto"
                    aria-label={t("pages.proposals.filterButton")}
                  >
                    <Filter className="size-4 shrink-0" aria-hidden />
                    {t("pages.proposals.filterButton")}
                    {activeFilterCount > 0 ? (
                      <span className="ml-0.5 min-w-5 rounded-full bg-brand-green-light px-1.5 py-0.5 text-center text-xs font-semibold text-brand-green-dark">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </Button>
                }
              />
              <PopoverContent className="w-[min(calc(100vw-2rem),20rem)]" align="end" sideOffset={8}>
                <PopoverHeader>
                  <PopoverTitle>{t("pages.proposals.filterPanelTitle")}</PopoverTitle>
                  <PopoverDescription>{t("pages.proposals.filterPanelHint")}</PopoverDescription>
                </PopoverHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground" htmlFor="proposal-status-filter">
                      {t("pages.proposals.filterSectionStatus")}
                    </Label>
                    <select
                      id="proposal-status-filter"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as ProposalStatusFilter)
                      }
                      className="flex h-9 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                    >
                      {STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {t(`pages.proposals.statusFilter.${option}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg"
                    disabled={statusFilter === defaultStatusFilter}
                    onClick={clearStatusFilter}
                  >
                    {t("pages.proposals.filterClear")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[320px] rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">{t(emptyMessageKey)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {items.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} lang={lang} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            {t("pages.freights.paginationShowing")}{" "}
            <strong className="font-semibold tabular-nums text-foreground">{from}</strong>
            <span className="text-muted-foreground"> – </span>
            <strong className="font-semibold tabular-nums text-foreground">{to}</strong>{" "}
            {t("pages.freights.paginationOf")}{" "}
            <strong className="font-semibold tabular-nums text-foreground">{total}</strong>{" "}
            {t("pages.proposals.paginationProposals")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 rounded-lg sm:min-h-9"
              disabled={!canGoPrev || loading}
              onClick={goPrev}
            >
              {t("pages.freights.paginationPrev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 rounded-lg sm:min-h-9"
              disabled={!canGoNext || loading}
              onClick={goNext}
            >
              {t("pages.freights.paginationNext")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsPage;
