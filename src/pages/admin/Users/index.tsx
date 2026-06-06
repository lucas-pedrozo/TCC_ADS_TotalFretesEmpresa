import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Input } from "@/components/ui/input";
import http from "@/service/http";
import type { AdminUser } from "@/types/admin";
import { maskCpf, maskPhone } from "@/utils/mask";
import { trataErroAxios } from "@/utils/trataErroAxios";

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await http.get<AdminUser[]>("/user");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(trataErroAxios(error));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.cpf?.includes(q)
    );
  }, [items, search]);

  return (
    <AdminPageShell
      title={t("pages.admin.users.title")}
      description={t("pages.admin.users.description")}
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("pages.admin.common.search")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <AdminDataTable
        columns={[
          { key: "id", header: "ID", cell: (row) => row.id },
          { key: "name", header: t("pages.admin.common.name"), cell: (row) => row.name },
          { key: "email", header: t("pages.admin.common.email"), cell: (row) => row.email },
          {
            key: "cpf",
            header: t("pages.admin.accounts.cpf"),
            cell: (row) => (row.cpf ? maskCpf(row.cpf) : "—"),
          },
          {
            key: "phoneNumber",
            header: t("pages.admin.common.phone"),
            cell: (row) => (row.phoneNumber ? maskPhone(row.phoneNumber) : "—"),
          },
        ]}
        rows={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={t("pages.admin.common.empty")}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
      />
    </AdminPageShell>
  );
};

export default AdminUsersPage;
