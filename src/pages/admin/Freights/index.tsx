import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AdminFreightStatusBadge } from "@/components/admin/AdminFreightStatusBadge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminPaginatedList } from "@/hooks/admin/useAdminPaginatedList";
import { normalizeLanguage } from "@/i18n";
import type { FreightDto } from "@/types/freight";
import { formatDateTimeLabel } from "@/utils/dateFormat";

const freightClientFilter = (freight: FreightDto, query: string) =>
  (freight.name?.toLowerCase().includes(query) ?? false) ||
  (freight.origin_label?.toLowerCase().includes(query) ?? false) ||
  (freight.destination_label?.toLowerCase().includes(query) ?? false) ||
  (freight.Company?.name?.toLowerCase().includes(query) ?? false) ||
  String(freight.company_id).includes(query);

const AdminFreightsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = normalizeLanguage(i18n.language);
  const [search, setSearch] = useState("");
  const list = useAdminPaginatedList<FreightDto>({
    path: "/freight",
    pageSize: 10,
    search,
    clientFilter: freightClientFilter,
  });

  const columns = useMemo(
    () => [
      { key: "id", header: "ID", cell: (row: FreightDto) => row.id },
      { key: "name", header: t("pages.admin.common.name"), cell: (row: FreightDto) => row.name ?? "—" },
      {
        key: "company",
        header: t("pages.admin.freights.company"),
        cell: (row: FreightDto) => row.Company?.name ?? `#${row.company_id}`,
      },
      {
        key: "status",
        header: t("pages.admin.freights.status"),
        cell: (row: FreightDto) => <AdminFreightStatusBadge freight={row} />,
      },
      {
        key: "createdAt",
        header: t("pages.admin.common.createdAt"),
        cell: (row: FreightDto) => formatDateTimeLabel(row.createdAt, lang),
      },
    ],
    [lang, t]
  );

  return (
    <AdminPageShell
      title={t("pages.admin.freights.title")}
      description={t("pages.admin.freights.description")}
      actions={
        <Button render={<Link to="/admin/freights/new" />}>
          <Plus className="mr-2 size-4" />
          {t("pages.admin.freights.create")}
        </Button>
      }
    >
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
        onRowClick={(row) => navigate(`/admin/freights/${row.id}`)}
      />
    </AdminPageShell>
  );
};

export default AdminFreightsPage;
