import { Pencil, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminCreateCompanyFields } from "@/components/admin/AdminCreateCompanyFields";
import { AdminCreateDriverFields } from "@/components/admin/AdminCreateDriverFields";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { adminNativeSelectClass } from "@/components/admin/adminNativeSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminAccountTypes,
  useAdminAccountsList,
} from "@/hooks/admin/useAdminDashboard";
import { useAdminSubjectNames } from "@/hooks/admin/useAdminSubjectNames";
import http from "@/service/http";
import { validatePassword } from "@/utils/validation";
import type { AdminAccount, AdminAccountType } from "@/types/admin";
import {
  initialAdminCompanyForm,
  initialAdminCredentialsForm,
  initialAdminDriverForm,
  normalizeCompanyEndAccountPayload,
  normalizeDriverEndAccountPayload,
  type AdminCreateCompanyForm,
  type AdminCreateDriverForm,
} from "@/utils/adminCreateAccountPayload";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";
import { maskEmail } from "@/utils/mask";

function resolveAccountTypeName(type: AdminAccountType | undefined): string {
  return type?.name?.trim().toUpperCase() ?? "";
}

const AdminAccountsPage = () => {
  const { t } = useTranslation();
  const accountTypes = useAdminAccountTypes();
  const list = useAdminAccountsList();
  const { resolveSubjectName } = useAdminSubjectNames();
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState({ email: "", account_type_id: "" });
  const [createAccountTypeId, setCreateAccountTypeId] = useState("");
  const [adminForm, setAdminForm] = useState(initialAdminCredentialsForm);
  const [companyForm, setCompanyForm] = useState<AdminCreateCompanyForm>(initialAdminCompanyForm);
  const [driverForm, setDriverForm] = useState<AdminCreateDriverForm>(initialAdminDriverForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountTypeLabel = useCallback(
    (name: string | undefined | null) => {
      if (name === "ADMIN") return t("pages.admin.accounts.adminBadge");
      if (name === "USER") return t("pages.admin.accounts.typeUser");
      if (name === "COMPANY") return t("pages.admin.accounts.typeCompany");
      return name ?? "—";
    },
    [t]
  );

  const selectedCreateType = useMemo(
    () => accountTypes.find((type) => String(type.id) === createAccountTypeId),
    [accountTypes, createAccountTypeId]
  );
  const selectedCreateTypeName = resolveAccountTypeName(selectedCreateType);

  const accountTypeOptions = useMemo(() => {
    const options = accountTypes.map((type) => ({
      id: type.id,
      value: String(type.id),
      label: accountTypeLabel(type.name),
    }));

    if (
      editing &&
      !options.some((option) => option.value === String(editing.account_type_id))
    ) {
      options.push({
        id: editing.account_type_id,
        value: String(editing.account_type_id),
        label: accountTypeLabel(editing.AccountType?.name),
      });
    }

    return options;
  }, [accountTypeLabel, accountTypes, editing]);

  const openEdit = useCallback((account: AdminAccount) => {
    setEditing(account);
    setForm({
      email: account.email,
      account_type_id: String(account.account_type_id),
    });
    setEditOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setCreateAccountTypeId("");
    setAdminForm(initialAdminCredentialsForm());
    setCompanyForm(initialAdminCompanyForm());
    setDriverForm(initialAdminDriverForm());
    setCreateOpen(true);
  }, []);

  const validatePasswords = (password: string, passwordConfirm: string) => {
    if (!validatePassword(password)) {
      toast.error(t("validation.passwordInvalid"));
      return false;
    }
    if (password !== passwordConfirm) {
      toast.error(t("pages.admin.accounts.passwordMismatch"));
      return false;
    }
    return true;
  };

  const handleCreateUser = async () => {
    if (!selectedCreateType) {
      toast.error(t("pages.admin.accounts.selectLevel"));
      return;
    }

    const passwordPair =
      selectedCreateTypeName === "ADMIN"
        ? adminForm
        : selectedCreateTypeName === "COMPANY"
          ? companyForm
          : driverForm;

    if (!validatePasswords(passwordPair.password, passwordPair.passwordConfirm)) {
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));

    try {
      if (selectedCreateTypeName === "ADMIN") {
        const { data } = await http.post("/account/admin", {
          email: adminForm.email.trim(),
          password: adminForm.password,
        });
        toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.created"), {
          id: toastId,
        });
      } else if (selectedCreateTypeName === "COMPANY") {
        const { data } = await http.post(
          "/company/end-account",
          normalizeCompanyEndAccountPayload(companyForm)
        );
        toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.created"), {
          id: toastId,
        });
      } else if (selectedCreateTypeName === "USER") {
        const { data } = await http.post(
          "/user/end-account",
          normalizeDriverEndAccountPayload(driverForm, selectedCreateType.id)
        );
        toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.created"), {
          id: toastId,
        });
      } else {
        toast.error(t("pages.admin.accounts.unsupportedType"), { id: toastId });
        return;
      }

      setCreateOpen(false);
      await list.reload();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setIsSubmitting(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const { data } = await http.patch(`/account/${editing.id}`, {
        email: form.email.trim(),
        account_type_id: Number(form.account_type_id),
      });
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.saved"), {
        id: toastId,
      });
      setEditOpen(false);
      await list.reload();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    setIsSubmitting(true);
    const toastId = toast.loading(t("pages.admin.common.deleting"));
    try {
      const { data } = await http.delete(`/account/${editing.id}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.deleted"), {
        id: toastId,
      });
      setDeleteOpen(false);
      setEditing(null);
      await list.reload();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageShell
      title={t("pages.admin.accounts.title")}
      description={t("pages.admin.accounts.description")}
      actions={
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          {t("pages.admin.accounts.createUser")}
        </Button>
      }
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("pages.admin.common.search")}
          value={list.search}
          onChange={(event) => list.setSearch(event.target.value)}
        />
      </div>

      <AdminDataTable
        columns={[
          { key: "id", header: "ID", cell: (row) => row.id },
          { key: "email", header: t("pages.admin.common.email"), cell: (row) => row.email },
          {
            key: "type",
            header: t("pages.admin.accounts.accessLevel"),
            cell: (row) => {
              const name = row.AccountType?.name;
              if (name === "ADMIN") {
                return (
                  <Badge variant="secondary" className="font-semibold">
                    {t("pages.admin.accounts.adminBadge")}
                  </Badge>
                );
              }
              return accountTypeLabel(name) !== "—"
                ? accountTypeLabel(name)
                : String(row.account_type_id);
            },
          },
          {
            key: "subject",
            header: t("pages.admin.accounts.subjectId"),
            cell: (row) => resolveSubjectName(row),
          },
          {
            key: "actions",
            header: t("pages.admin.common.actions"),
            cell: (row) => (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => openEdit(row)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-red-600"
                  onClick={() => {
                    setEditing(row);
                    setDeleteOpen(true);
                  }}
                >
                  {t("pages.admin.common.delete")}
                </Button>
              </div>
            ),
          },
        ]}
        rows={list.items}
        rowKey={(row) => row.id}
        isLoading={list.isLoading}
        emptyMessage={t("pages.admin.common.empty")}
        page={list.page}
        pageSize={20}
        totalPages={list.totalPages}
        totalCount={list.total}
        onPageChange={list.setPage}
        onRowClick={openEdit}
      />

      <AdminEntityDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("pages.admin.accounts.createUserTitle")}
        onSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
        submitLabel={t("pages.admin.accounts.createUser")}
      >
        <div className="space-y-2">
          <Label>{t("pages.admin.accounts.accessLevel")}</Label>
          <select
            className={adminNativeSelectClass}
            value={createAccountTypeId}
            onChange={(event) => setCreateAccountTypeId(event.target.value)}
          >
            <option value="">{t("pages.admin.accounts.selectLevel")}</option>
            {accountTypes.map((type) => (
              <option key={type.id} value={String(type.id)}>
                {accountTypeLabel(type.name)}
              </option>
            ))}
          </select>
        </div>

        {selectedCreateTypeName === "ADMIN" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="create-admin-email">{t("pages.admin.common.email")}</Label>
              <Input
                id="create-admin-email"
                type="email"
                autoComplete="email"
                value={adminForm.email}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, email: maskEmail(event.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-admin-password">{t("pages.admin.accounts.password")}</Label>
              <Input
                id="create-admin-password"
                type="password"
                value={adminForm.password}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-admin-password-confirm">
                {t("pages.admin.accounts.passwordConfirm")}
              </Label>
              <Input
                id="create-admin-password-confirm"
                type="password"
                value={adminForm.passwordConfirm}
                onChange={(event) =>
                  setAdminForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))
                }
              />
            </div>
          </>
        ) : null}

        {selectedCreateTypeName === "COMPANY" ? (
          <AdminCreateCompanyFields
            form={companyForm}
            onChange={(key, value) =>
              setCompanyForm((prev) => ({ ...prev, [key]: value }))
            }
            onPatch={(partial) => setCompanyForm((prev) => ({ ...prev, ...partial }))}
          />
        ) : null}

        {selectedCreateTypeName === "USER" ? (
          <AdminCreateDriverFields
            form={driverForm}
            onChange={(key, value) => setDriverForm((prev) => ({ ...prev, [key]: value }))}
          />
        ) : null}
      </AdminEntityDialog>

      <AdminEntityDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t("pages.admin.accounts.editTitle")}
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-2">
          <Label htmlFor="account-email">{t("pages.admin.common.email")}</Label>
          <Input
            id="account-email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: maskEmail(event.target.value) }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-type">{t("pages.admin.accounts.accessLevel")}</Label>
          <select
            id="account-type"
            className={adminNativeSelectClass}
            value={form.account_type_id}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, account_type_id: event.target.value }))
            }
          >
            <option value="">{t("pages.admin.accounts.selectLevel")}</option>
            {accountTypeOptions.map((type) => (
              <option key={type.id} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </AdminEntityDialog>

      <AdminConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={
          editing
            ? t("pages.admin.accounts.deleteConfirm", { email: editing.email })
            : t("pages.admin.common.confirmDelete")
        }
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </AdminPageShell>
  );
};

export default AdminAccountsPage;
