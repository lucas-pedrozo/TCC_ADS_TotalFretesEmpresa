import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminCatalogCrud } from "@/hooks/admin/useAdminCatalogCrud";
import type { AdminCargoType } from "@/types/admin";

const AdminCargoTypesPage = () => {
  const { t } = useTranslation();
  const [imageId, setImageId] = useState<number | null>(null);

  const crud = useAdminCatalogCrud<AdminCargoType>({
    endpoint: "/cargo-type",
    fields: [{ name: "name", label: t("pages.admin.common.name"), required: true }],
    getInitialForm: () => ({ name: "" }),
    mapEntityToForm: (entity) => ({
      name: entity.name ?? "",
    }),
    mapFormToPayload: (form) => ({
      name: form.name.trim(),
      ...(imageId ? { imageCargo_id: imageId } : {}),
    }),
    searchFilter: (entity, query) => (entity.name ?? "").toLowerCase().includes(query),
  });

  useEffect(() => {
    if (crud.editing?.imageCargo_id) {
      setImageId(crud.editing.imageCargo_id);
    } else if (crud.dialogOpen && !crud.editing) {
      setImageId(null);
    }
  }, [crud.dialogOpen, crud.editing]);

  return (
    <AdminPageShell
      title={t("pages.admin.cargoTypes.title")}
      description={t("pages.admin.cargoTypes.description")}
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
          { key: "name", header: t("pages.admin.common.name"), cell: (row) => row.name },
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
        <div className="space-y-2">
          <Label htmlFor="cargo-name">{t("pages.admin.common.name")}</Label>
          <Input
            id="cargo-name"
            value={crud.form.name ?? ""}
            onChange={(event) => crud.updateField("name", event.target.value)}
          />
        </div>
        <AdminImageField
          label={t("pages.admin.common.image")}
          imageId={imageId}
          onImageIdChange={setImageId}
          imageBasePath="cargo-images"
          imageResponseKey="cargoImage"
        />
      </AdminEntityDialog>

      <AdminConfirmDeleteDialog
        open={crud.deleteOpen}
        onOpenChange={crud.setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={
          crud.deleting
            ? t("pages.admin.cargoTypes.deleteConfirm", { name: crud.deleting.name })
            : t("pages.admin.common.confirmDelete")
        }
        onConfirm={crud.handleDelete}
        isLoading={crud.isSubmitting}
      />
    </AdminPageShell>
  );
};

export default AdminCargoTypesPage;
