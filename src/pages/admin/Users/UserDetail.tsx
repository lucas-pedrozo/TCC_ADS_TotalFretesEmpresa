import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import http from "@/service/http";
import type { AdminUser } from "@/types/admin";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "" });
  const [imageId, setImageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data } = await http.get<AdminUser>(`/user/${id}`);
      setUser(data);
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
      });
      setImageId(data.userImage_id ?? data.UserImage?.id ?? null);
    } catch (error) {
      toast.error(trataErroAxios(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const { data } = await http.patch(`/user/${id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        ...(imageId ? { userImage_id: imageId } : { userImage_id: null }),
      });
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.saved"), {
        id: toastId,
      });
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.deleting"));
    try {
      const { data } = await http.delete(`/user/${id}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.admin.common.deleted"), {
        id: toastId,
      });
      navigate("/admin/users");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell title={t("pages.admin.users.detailTitle")}>
        <Skeleton className="h-40 w-full max-w-xl" />
      </AdminPageShell>
    );
  }

  if (!user) {
    return (
      <AdminPageShell title={t("pages.admin.users.detailTitle")}>
        <p className="text-sm text-muted-foreground">{t("pages.admin.common.notFound")}</p>
        <Button variant="outline" render={<Link to="/admin/users" />}>
          {t("pages.admin.common.back")}
        </Button>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={t("pages.admin.users.detailTitle")}
      description={user.name}
      actions={
        <>
          <Button variant="outline" render={<Link to="/admin/users" />}>
            {t("pages.admin.common.back")}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            {t("pages.admin.common.delete")}
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {t("pages.admin.common.save")}
          </Button>
        </>
      }
    >
      <div className="grid max-w-2xl gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-name">{t("pages.admin.common.name")}</Label>
          <Input
            id="user-name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-email">{t("pages.admin.common.email")}</Label>
          <Input
            id="user-email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-phone">{t("pages.admin.common.phone")}</Label>
          <Input
            id="user-phone"
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
            }
          />
        </div>
        <AdminImageField
          label={t("pages.admin.common.image")}
          imageId={imageId}
          onImageIdChange={setImageId}
          ownerType="USER"
          ownerId={user.id}
        />
      </div>

      <AdminConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={t("pages.admin.users.deleteConfirm", { name: user.name })}
        onConfirm={handleDelete}
        isLoading={isSaving}
      />
    </AdminPageShell>
  );
};

export default AdminUserDetailPage;
