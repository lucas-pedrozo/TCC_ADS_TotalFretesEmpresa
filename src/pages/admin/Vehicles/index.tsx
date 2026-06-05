import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Input } from "@/components/ui/input";
import http from "@/service/http";
import type { AdminVehicle } from "@/types/admin";
import { trataErroAxios } from "@/utils/trataErroAxios";

const AdminVehiclesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await http.get<AdminVehicle[]>("/vehicle");
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
      (vehicle) =>
        vehicle.plateNumber?.toLowerCase().includes(q) ||
        String(vehicle.id).includes(q) ||
        vehicle.VehicleType?.nome?.toLowerCase().includes(q) ||
        vehicle.VehicleType?.name?.toLowerCase().includes(q) ||
        String(vehicle.vehicleType_id).includes(q)
    );
  }, [items, search]);

  return (
    <AdminPageShell
      title={t("pages.admin.vehicles.title")}
      description={t("pages.admin.vehicles.description")}
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
          { key: "plate", header: t("pages.admin.vehicles.plate"), cell: (row) => row.plateNumber ?? "—" },
          {
            key: "type",
            header: t("pages.admin.vehicles.type"),
            cell: (row) => row.VehicleType?.nome ?? row.VehicleType?.name ?? row.vehicleType_id ?? "—",
          },
        ]}
        rows={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={t("pages.admin.common.empty")}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/admin/vehicles/${row.id}`)}
      />
    </AdminPageShell>
  );
};

export default AdminVehiclesPage;
