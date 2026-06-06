import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AdminProposalStatusBadge } from "@/components/admin/AdminProposalStatusBadge";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { useAdminPaginatedList } from "@/hooks/admin/useAdminPaginatedList";
import { normalizeLanguage } from "@/i18n";
import type { ProposalDto } from "@/types/proposal";
import { formatAdminCurrency } from "@/utils/adminFormat";
import { formatDateTimeLabel } from "@/utils/dateFormat";
import {
  resolveDriverDisplayName,
  resolveDriverProfilesFromProposals,
  type DriverProfile,
} from "@/utils/driverProfiles";

type AdminFreightProposalsPanelProps = {
  freightId: number;
  pageSize?: number;
};

export function AdminFreightProposalsPanel({
  freightId,
  pageSize = 5,
}: AdminFreightProposalsPanelProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = normalizeLanguage(i18n.language);
  const [driverProfiles, setDriverProfiles] = useState<Record<number, DriverProfile>>({});

  const queryParams = useMemo(
    () => ({ proposal_status: "todas", freight_id: freightId }) as const,
    [freightId]
  );

  const list = useAdminPaginatedList<ProposalDto>({
    path: "/proposal",
    pageSize,
    queryParams,
  });

  useEffect(() => {
    if (list.items.length === 0) {
      setDriverProfiles({});
      return;
    }

    let cancelled = false;
    void resolveDriverProfilesFromProposals(list.items).then((profiles) => {
      if (!cancelled) setDriverProfiles(profiles);
    });

    return () => {
      cancelled = true;
    };
  }, [list.items]);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID", cell: (row: ProposalDto) => row.id },
      {
        key: "driver",
        header: t("pages.admin.proposals.driver"),
        cell: (row: ProposalDto) => resolveDriverDisplayName(row, driverProfiles),
      },
      {
        key: "status",
        header: t("pages.admin.freights.status"),
        cell: (row: ProposalDto) => <AdminProposalStatusBadge proposal={row} />,
      },
      {
        key: "value",
        header: t("pages.admin.proposals.value"),
        cell: (row: ProposalDto) =>
          row.value != null ? formatAdminCurrency(row.value, lang) : "—",
      },
      {
        key: "createdAt",
        header: t("pages.admin.common.createdAt"),
        cell: (row: ProposalDto) => formatDateTimeLabel(row.createdAt, lang),
      },
    ],
    [driverProfiles, lang, t]
  );

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">
        {t("pages.admin.freights.proposalsSection", { count: list.total })}
      </h3>
      <AdminDataTable
        columns={columns}
        rows={list.items}
        rowKey={(row) => row.id}
        isLoading={list.isInitialLoading}
        emptyMessage={t("pages.admin.freights.noProposals")}
        page={list.page}
        pageSize={list.pageSize}
        totalPages={list.totalPages}
        totalCount={list.total}
        onPageChange={list.setPage}
        onRowClick={(row) => navigate(`/admin/proposals/${row.id}`)}
      />
    </section>
  );
}
