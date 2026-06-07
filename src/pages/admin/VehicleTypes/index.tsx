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
import type { AdminGroupVehicleType, AdminVehicleType } from "@/types/admin";
import {
  formatAdminIntegerDisplay,
  formatVehicleLengthMeters,
  resolveSelectLabel,
  sanitizeAdminDigitsInput,
} from "@/utils/adminFormat";

const AdminVehicleTypesPage = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<AdminGroupVehicleType[]>([]);

  useEffect(() => {
    void http.get<AdminGroupVehicleType[]>("/group-vehicle-type").then(({ data }) => {
      setGroups(Array.isArray(data) ? data : []);
    });
  }, []);

  const crud = useAdminCatalogCrud<AdminVehicleType>({
    endpoint: "/vehicle-type",
    fields: [],
    getInitialForm: () => ({
      nome: "",
      axes: "",
      weight: "",
      capacityWeight: "",
      length: "",
      groupVehicleType_id: "",
    }),
    mapEntityToForm: (entity) => ({
      nome: entity.nome ?? "",
      axes: String(entity.axes ?? ""),
      weight: String(entity.weight ?? ""),
      capacityWeight: String(entity.capacityWeight ?? ""),
      length: String(entity.length ?? ""),
      groupVehicleType_id:
        entity.groupVehicleType_id != null
          ? String(entity.groupVehicleType_id)
          : entity.GroupVehicleType?.id != null
            ? String(entity.GroupVehicleType.id)
            : "",
    }),
    mapFormToPayload: (form) => ({
      nome: form.nome.trim(),
      axes: Number(form.axes),
      weight: Number(form.weight),
      capacityWeight: Number(form.capacityWeight),
      length: Number(form.length),
      ...(form.groupVehicleType_id
        ? { groupVehicleType_id: Number(form.groupVehicleType_id) }
        : {}),
    }),
  });

  const groupOptions = useMemo(
    () => groups.map((group) => ({ id: group.id, label: group.nome })),
    [groups]
  );

  const selectedGroupLabel = useMemo(
    () =>
      resolveSelectLabel(
        crud.form.groupVehicleType_id,
        groupOptions,
        crud.editing?.GroupVehicleType?.nome ?? null
      ),
    [crud.editing?.GroupVehicleType?.nome, crud.form.groupVehicleType_id, groupOptions]
  );

  const resolveGroupName = (row: AdminVehicleType) =>
    groups.find((group) => group.id === row.groupVehicleType_id)?.nome ??
    row.GroupVehicleType?.nome ??
    "—";

  const numericFields = ["axes", "weight", "capacityWeight", "length"] as const;

  return (
    <AdminPageShell
      title={t("pages.admin.vehicleTypes.title")}
      description={t("pages.admin.vehicleTypes.description")}
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
          { key: "axes", header: t("pages.admin.vehicleTypes.axes"), cell: (row) => row.axes },
          {
            key: "group",
            header: t("pages.admin.vehicleTypes.group"),
            cell: (row) => resolveGroupName(row),
          },
          {
            key: "capacityWeight",
            header: t("pages.admin.vehicleTypes.capacityWeight"),
            cell: (row) =>
              row.capacityWeight != null
                ? `${row.capacityWeight.toLocaleString()} kg`
                : "—",
          },
          {
            key: "length",
            header: t("pages.admin.vehicleTypes.length"),
            cell: (row) => formatVehicleLengthMeters(row.length),
          },
          {
            key: "actions",
            header: t("pages.admin.common.actions"),
            className: "w-[140px]",
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
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["nome", t("pages.admin.common.name"), "text"],
              ["axes", t("pages.admin.vehicleTypes.axes"), "number"],
              ["weight", t("pages.admin.vehicleTypes.weight"), "number"],
              ["capacityWeight", t("pages.admin.vehicleTypes.capacityWeight"), "number"],
              ["length", t("pages.admin.vehicleTypes.length"), "number"],
            ] as const
          ).map(([name, label, type]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
                type={type === "text" ? "text" : "text"}
                inputMode={type === "text" ? undefined : "numeric"}
                value={
                  numericFields.includes(name as (typeof numericFields)[number])
                    ? formatAdminIntegerDisplay(crud.form[name] ?? "")
                    : (crud.form[name] ?? "")
                }
                onChange={(event) => {
                  const nextValue =
                    type === "text"
                      ? event.target.value
                      : sanitizeAdminDigitsInput(event.target.value);
                  crud.updateField(name, nextValue);
                }}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label>{t("pages.admin.vehicleTypes.group")}</Label>
          <Select
            value={crud.form.groupVehicleType_id ?? ""}
            onValueChange={(value) =>
              crud.updateField("groupVehicleType_id", value ?? "")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("pages.admin.vehicleTypes.selectGroup")}>
                {selectedGroupLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={String(group.id)}>
                  {group.nome}
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
            ? t("pages.admin.vehicleTypes.deleteConfirm", { name: crud.deleting.nome })
            : t("pages.admin.common.confirmDelete")
        }
        onConfirm={crud.handleDelete}
        isLoading={crud.isSubmitting}
      />
    </AdminPageShell>
  );
};

export default AdminVehicleTypesPage;
