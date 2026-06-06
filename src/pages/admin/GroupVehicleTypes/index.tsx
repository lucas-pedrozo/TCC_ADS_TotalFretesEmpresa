import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminCatalogCrud } from "@/hooks/admin/useAdminCatalogCrud";
import http from "@/service/http";
import type { AdminCnhType, AdminGroupVehicleType } from "@/types/admin";
import { resolveSelectLabel } from "@/utils/adminFormat";

const AdminGroupVehicleTypesPage = () => {
  const { t } = useTranslation();
  const [cnhTypes, setCnhTypes] = useState<AdminCnhType[]>([]);

  useEffect(() => {
    void http.get<AdminCnhType[]>("/cnh").then(({ data }) => {
      setCnhTypes(Array.isArray(data) ? data : []);
    });
  }, []);

  const crud = useAdminCatalogCrud<AdminGroupVehicleType>({
    endpoint: "/group-vehicle-type",
    fields: [{ name: "nome", label: t("pages.admin.common.name"), required: true }],
    getInitialForm: () => ({ nome: "", cnhType_id: "" }),
    mapEntityToForm: (entity) => ({
      nome: entity.nome ?? "",
      cnhType_id:
        entity.cnhType_id != null
          ? String(entity.cnhType_id)
          : entity.CnhType?.id != null
            ? String(entity.CnhType.id)
            : "",
    }),
    mapFormToPayload: (form) => ({
      nome: form.nome.trim(),
      cnhType_id: Number(form.cnhType_id),
    }),
  });

  const cnhOptions = useMemo(
    () => cnhTypes.map((type) => ({ id: type.id, label: type.name })),
    [cnhTypes]
  );

  const selectedCnhLabel = useMemo(
    () =>
      resolveSelectLabel(
        crud.form.cnhType_id,
        cnhOptions,
        crud.editing?.CnhType?.name ?? null
      ),
    [cnhOptions, crud.editing?.CnhType?.name, crud.form.cnhType_id]
  );

  const resolveCnhName = (row: AdminGroupVehicleType) =>
    cnhTypes.find((type) => type.id === row.cnhType_id)?.name ??
    row.CnhType?.name ??
    "—";

  return (
    <AdminPageShell
      title={t("pages.admin.groupVehicleTypes.title")}
      description={t("pages.admin.groupVehicleTypes.description")}
      actions={
        <Button type="button" onClick={crud.openCreate}>
          <Plus className="mr-2 size-4" />
          {t("pages.admin.common.create")}
        </Button>
      }
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("pages.admin.common.search")}
          value={crud.search}
          onChange={(event) => crud.setSearch(event.target.value)}
        />
      </div>

      <AdminDataTable
        columns={[
          { key: "id", header: "ID", cell: (row) => row.id },
          { key: "nome", header: t("pages.admin.common.name"), cell: (row) => row.nome },
          {
            key: "cnhType_id",
            header: t("pages.admin.groupVehicleTypes.cnhType"),
            cell: (row) => resolveCnhName(row),
          },
          {
            key: "actions",
            header: t("pages.admin.common.actions"),
            cell: (row) => (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => crud.openEdit(row)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-red-600"
                  onClick={() => crud.openDelete(row)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]}
        rows={crud.items}
        rowKey={(row) => row.id}
        isLoading={crud.isLoading}
        emptyMessage={t("pages.admin.common.empty")}
        page={crud.page}
        pageSize={crud.pageSize}
        onPageChange={crud.setPage}
        onRowClick={(row) => crud.openEdit(row)}
        isRowClickable={() => true}
      />

      <AdminEntityDialog
        open={crud.dialogOpen}
        onOpenChange={crud.setDialogOpen}
        title={crud.editing ? t("pages.admin.common.edit") : t("pages.admin.common.create")}
        onSubmit={crud.handleSubmit}
        isSubmitting={crud.isSubmitting}
      >
        <div className="space-y-2">
          <Label htmlFor="group-nome">{t("pages.admin.common.name")}</Label>
          <Input
            id="group-nome"
            value={crud.form.nome ?? ""}
            onChange={(event) => crud.updateField("nome", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("pages.admin.groupVehicleTypes.cnhType")}</Label>
          <Select
            value={crud.form.cnhType_id ?? ""}
            onValueChange={(value) => crud.updateField("cnhType_id", value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("pages.admin.groupVehicleTypes.selectCnh")}>
                {selectedCnhLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cnhTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminEntityDialog>

      <AdminConfirmDeleteDialog
        open={crud.deleteOpen}
        onOpenChange={crud.setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={
          crud.deleting
            ? t("pages.admin.groupVehicleTypes.deleteConfirm", { name: crud.deleting.nome })
            : t("pages.admin.common.confirmDelete")
        }
        onConfirm={crud.handleDelete}
        isLoading={crud.isSubmitting}
      />
    </AdminPageShell>
  );
};

export default AdminGroupVehicleTypesPage;
