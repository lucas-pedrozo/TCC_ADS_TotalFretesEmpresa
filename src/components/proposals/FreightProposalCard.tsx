import { ArrowRight, MapPin, TrendingDown, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import type { AppLanguage } from "@/i18n/resources";
import { cn } from "@/lib/utils";
import type { ProposalFreightSummaryItem } from "@/types/proposal";
import {
  formatFreightCurrencyAmount,
  formatFreightDistanceKm,
} from "@/utils/freightFormat";
import { haversineKm } from "@/utils/haversineKm";

type FreightProposalCardProps = {
  item: ProposalFreightSummaryItem;
  lang: AppLanguage;
};

export function FreightProposalCard({ item, lang }: FreightProposalCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { freight } = item;

  const slug = resolveFreightStatusSlug({
    statusId: freight.status_id,
    statusName: freight.FreightStatusType?.name ?? freight.status?.name,
  });

  const distKm = haversineKm(
    freight.origin_lat,
    freight.origin_lng,
    freight.destination_lat,
    freight.destination_lng
  );

  const freightLabel =
    freight.name?.trim() || t("pages.freights.freightTitleFallback", { id: freight.id });

  const averageFormatted = formatFreightCurrencyAmount(item.averageValue, lang);

  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight text-foreground">{freightLabel}</h2>
        <Badge
          variant="outline"
          className={cn("shrink-0 rounded-full font-medium", statusBadgeClass(slug))}
        >
          <span
            className="mr-1.5 inline-block size-1.5 rounded-full bg-current opacity-80"
            aria-hidden
          />
          {t(FREIGHT_STATUS_LABEL_KEY[slug])}
        </Badge>
      </header>

      <div className="mb-4 space-y-2 text-sm">
        <p className="flex items-start gap-2 text-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 break-words">{freight.origin_label}</span>
        </p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <span className="w-4 shrink-0 text-center" aria-hidden>
            →
          </span>
          <span className="min-w-0 break-words">
            {freight.destination_label}
            <span className="text-muted-foreground">
              {" "}
              · {formatFreightDistanceKm(Math.round(distKm), lang)}
            </span>
          </span>
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Users className="size-4 text-muted-foreground" aria-hidden />
          {t("pages.proposals.proposalsCount", { count: item.proposalCount })}
        </span>
        {item.pendingCount > 0 ? (
          <Badge className="rounded-full border-0 bg-brand-green-light font-semibold text-brand-green-dark hover:bg-brand-green-light">
            {t("pages.proposals.pendingBadge", { count: item.pendingCount })}
          </Badge>
        ) : null}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("pages.proposals.referenceValue")}
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
            {formatFreightCurrencyAmount(item.referenceValue, lang)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("pages.proposals.bestOffer")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-lg font-bold tabular-nums text-brand-green-dark dark:text-brand-green-light">
            <TrendingDown className="size-4 shrink-0" aria-hidden />
            {formatFreightCurrencyAmount(item.bestValue, lang)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("pages.proposals.averageLabel", { value: averageFormatted })}
          </p>
        </div>
      </div>

      <div className="mt-auto flex justify-end pt-1">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-dark transition-colors hover:text-brand-green dark:text-brand-green-light"
          onClick={() => navigate(`/Freights/${freight.id}`)}
          aria-label={t("pages.proposals.openFreightAria")}
        >
          {t("pages.proposals.viewProposals")}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}
