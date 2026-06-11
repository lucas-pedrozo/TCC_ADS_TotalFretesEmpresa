import type { ReactNode } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  AdminDataTable,
  type AdminTableColumn,
} from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminCatalogCrud,
  type AdminCatalogConfig,
  type AdminCatalogField,
} from "@/hooks/admin/useAdminCatalogCrud";

type AdminCatalogPageProps<T extends { id?: number }> = {
  title: string;
  description: string;
  config: AdminCatalogConfig<T>;
  columns: AdminTableColumn<T>[];
  deleteDescription: (entity: T) => string;
  extraFormFields?: ReactNode;
  onFormChange?: (form: Record<string, string>, updateField: (name: string, value: string) => void) => void;
};

function renderFieldInput(
  field: AdminCatalogField,
  value: string,
  onChange: (value: string) => void
) {
  return (
    <div key={field.name} className="space-y-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        type={field.type ?? "text"}
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function AdminCatalogPage<T extends { id?: number }>({
  title,
  description,
  config,
  columns,
  deleteDescription,
  extraFormFields,
}: AdminCatalogPageProps<T>) {
  const { t } = useTranslation();
  const crud = useAdminCatalogCrud<T>(config);

  const actionColumns: AdminTableColumn<T>[] = [
    ...columns,
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
  ];

  return (
    <AdminPageShell
      title={title}
      description={description}
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
          onChange={(event) => {
            crud.setSearch(event.target.value);
            crud.setPage(1);
          }}
        />
      </div>

      <AdminDataTable
        columns={actionColumns}
        rows={crud.items}
        rowKey={(row) => row.id ?? 0}
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
        title={
          crud.editing
            ? t("pages.admin.common.edit")
            : t("pages.admin.common.create")
        }
        onSubmit={crud.handleSubmit}
        isSubmitting={crud.isSubmitting}
      >
        {config.fields.map((field) =>
          renderFieldInput(field, crud.form[field.name] ?? "", (value) =>
            crud.updateField(field.name, value)
          )
        )}
        {extraFormFields}
      </AdminEntityDialog>

      <AdminConfirmDeleteDialog
        open={crud.deleteOpen}
        onOpenChange={crud.setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={
          crud.deleting ? deleteDescription(crud.deleting) : t("pages.admin.common.confirmDelete")
        }
        onConfirm={crud.handleDelete}
        isLoading={crud.isSubmitting}
      />
    </AdminPageShell>
  );
}
