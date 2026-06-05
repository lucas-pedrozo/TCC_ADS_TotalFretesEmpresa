import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AdminProposalStatusBadge } from "@/components/admin/AdminProposalStatusBadge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminPaginatedList } from "@/hooks/admin/useAdminPaginatedList";
import { normalizeLanguage } from "@/i18n";
import type { ProposalDto } from "@/types/proposal";
import { formatDateTimeLabel } from "@/utils/dateFormat";
import {
  resolveDriverDisplayName,
  resolveDriverProfilesFromProposals,
  type DriverProfile,
} from "@/utils/driverProfiles";

const ADMIN_PROPOSAL_QUERY = { proposal_status: "todas" } as const;

const proposalClientFilter = (proposal: ProposalDto, query: string) =>
  String(proposal.id).includes(query) ||
  String(proposal.freight_id).includes(query) ||
  String(proposal.driver_id).includes(query) ||
  (proposal.Freight?.name?.toLowerCase().includes(query) ?? false) ||
  (proposal.Driver?.name?.toLowerCase().includes(query) ?? false) ||
  (proposal.ProposalStatusType?.name?.toLowerCase().includes(query) ?? false);

const AdminProposalsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const freightIdParam = searchParams.get("freight_id")?.trim() ?? "";
  const freightIdFilter = freightIdParam && /^\d+$/.test(freightIdParam) ? freightIdParam : "";
  const lang = normalizeLanguage(i18n.language);
  const [search, setSearch] = useState("");
  const [driverProfiles, setDriverProfiles] = useState<Record<number, DriverProfile>>({});

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { ...ADMIN_PROPOSAL_QUERY };
    if (freightIdFilter) {
      params.freight_id = Number(freightIdFilter);
    }
    return params;
  }, [freightIdFilter]);

  const list = useAdminPaginatedList<ProposalDto>({
    path: "/proposal",
    pageSize: 10,
    search,
    serverSearch: true,
    clientFilter: proposalClientFilter,
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
        key: "freight",
        header: t("pages.admin.proposals.freight"),
        cell: (row: ProposalDto) => row.Freight?.name ?? `#${row.freight_id}`,
      },
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
        cell: (row: ProposalDto) => row.value ?? "—",
      },
      {
        key: "createdAt",
        header: t("pages.admin.common.createdAt"),
        cell: (row: ProposalDto) => formatDateTimeLabel(row.createdAt, lang),
      },
    ],
    [driverProfiles, lang, t]
  );

  const clearFreightFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("freight_id");
    setSearchParams(next);
  };

  return (
    <AdminPageShell
      title={t("pages.admin.proposals.title")}
      description={t("pages.admin.proposals.description")}
    >
      {freightIdFilter ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span>
            {t("pages.admin.proposals.filteredByFreight", {
              name: list.items[0]?.Freight?.name ?? `#${freightIdFilter}`,
            })}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={clearFreightFilter}>
            <X className="mr-1 size-4" />
            {t("pages.admin.proposals.clearFreightFilter")}
          </Button>
        </div>
      ) : null}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("pages.admin.common.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <AdminDataTable
        columns={columns}
        rows={list.items}
        rowKey={(row) => row.id}
        isLoading={list.isInitialLoading}
        emptyMessage={t("pages.admin.common.empty")}
        page={list.page}
        pageSize={list.pageSize}
        totalPages={list.totalPages}
        totalCount={list.total}
        onPageChange={list.setPage}
        onRowClick={(row) => navigate(`/admin/proposals/${row.id}`)}
      />
    </AdminPageShell>
  );
};

export default AdminProposalsPage;
