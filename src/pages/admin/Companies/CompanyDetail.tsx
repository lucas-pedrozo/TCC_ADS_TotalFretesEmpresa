import { useCallback, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminConfirmDeleteDialog } from "@/components/admin/AdminConfirmDeleteDialog";
import { CompanyLogo } from "@/components/custom/CompanyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCompanyImage } from "@/hooks/admin/useAdminCompanyImage";
import { normalizeLanguage } from "@/i18n";
import { CompanyProfileImageDialog } from "@/pages/Perfil/components/CompanyProfileImageDialog";
import http from "@/service/http";
import type { AdminCompany } from "@/types/admin";
import { maskCep, maskCnpj, maskEmail, maskPhone, maskUf, normalizeCepInput, normalizePhoneForStorage } from "@/utils/mask";
import { formatDateShortLabel, formatDateTimeLabel } from "@/utils/dateFormat";
import { trataErroAxios } from "@/utils/trataErroAxios";

function companyInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  return `${words[0]?.[0] ?? ""}${words[words.length - 1]?.[0] ?? ""}`.toUpperCase();
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} readOnly disabled className="bg-muted/40" />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const AdminCompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = normalizeLanguage(i18n.language);
  const [company, setCompany] = useState<AdminCompany | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    website: "",
    country: "",
    cep: "",
    street: "",
    district: "",
    number: "",
    city: "",
    state: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data } = await http.get<AdminCompany>(`/company/${id}`);
      setCompany(data);
      const address = data.CompanyAddress;
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        website: data.website ?? "",
        country: address?.country ?? "",
        cep: address?.cep ?? "",
        street: address?.street ?? "",
        district: address?.district ?? "",
        number: address?.number ?? "",
        city: address?.city ?? "",
        state: address?.state ?? "",
      });
    } catch (error) {
      toast.error(trataErroAxios(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const imageUrl = company?.CompanyImage?.url ?? null;
  const imageOriginalName = company?.CompanyImage?.originalName ?? null;

  const companyImage = useAdminCompanyImage({
    companyId: id,
    imageUrl,
    imageOriginalName,
    onReload: load,
  });

  const handleSave = async () => {
    if (!id) return;
    const isBrazilAddress = form.country.trim().toUpperCase() === "BR";
    setIsSaving(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      await http.put(`/company/${id}`, {
        name: form.name.trim(),
        email: maskEmail(form.email),
        phoneNumber: normalizePhoneForStorage(form.phoneNumber),
        website: form.website.trim() || null,
      });

      if (company?.CompanyAddress?.id) {
        await http.put(`/address/${company.CompanyAddress.id}`, {
          country: form.country.trim().toUpperCase(),
          cep: form.cep.trim(),
          street: form.street.trim(),
          district: form.district.trim(),
          number: form.number.trim(),
          city: form.city.trim(),
          state: isBrazilAddress ? maskUf(form.state) : form.state.trim(),
        });
      }

      toast.success(t("pages.admin.common.saved"), { id: toastId });
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
      await http.delete(`/company/${id}`);
      toast.success(t("pages.admin.common.deleted"), { id: toastId });
      navigate("/admin/companies");
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell title={t("pages.admin.companies.detailTitle")}>
        <Skeleton className="h-40 w-full max-w-3xl" />
      </AdminPageShell>
    );
  }

  if (!company) {
    return (
      <AdminPageShell title={t("pages.admin.companies.detailTitle")}>
        <p className="text-sm text-muted-foreground">{t("pages.admin.common.notFound")}</p>
      </AdminPageShell>
    );
  }

  const displayName = form.name.trim() || company.name;
  const formattedCnpj = company.cnpj ? maskCnpj(company.cnpj) : "—";
  const isBrazil = form.country.trim().toUpperCase() === "BR";

  return (
    <AdminPageShell
      title={t("pages.admin.companies.detailTitle")}
      description={company.name}
      actions={
        <>
          <Button variant="outline" render={<Link to="/admin/companies" />}>
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
      <div className="grid max-w-3xl gap-6">
        <div className="flex flex-wrap items-start gap-6 rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <CompanyLogo
              size="profile"
              imageUrl={imageUrl}
              alt={displayName}
              initials={companyInitials(displayName)}
            />
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-brand-green px-3 text-white hover:bg-brand-green/90"
              onClick={companyImage.openDialog}
            >
              <Camera className="size-4" />
              {t("pages.profileImage.edit")}
            </Button>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{formattedCnpj}</p>
            <p className="text-sm text-muted-foreground">{form.email || company.email}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("pages.admin.companies.registrationSection")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField
              label={t("pages.admin.companies.cnpj")}
              value={formattedCnpj}
              hint={t("pages.admin.companies.readOnlyField")}
            />
            <ReadOnlyField
              label={t("pages.admin.companies.birthFundation")}
              value={formatDateShortLabel(company.birthFundation ?? undefined, lang)}
              hint={t("pages.admin.companies.readOnlyField")}
            />
            <ReadOnlyField
              label={t("pages.admin.common.createdAt")}
              value={formatDateTimeLabel(company.createdAt, lang)}
              hint={t("pages.admin.companies.readOnlyField")}
            />
            <ReadOnlyField
              label={t("pages.admin.companies.updatedAt")}
              value={formatDateTimeLabel(company.updatedAt, lang)}
              hint={t("pages.admin.companies.readOnlyField")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("pages.admin.common.edit")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", t("pages.admin.common.name")],
                ["email", t("pages.admin.common.email")],
                ["phoneNumber", t("pages.admin.common.phone")],
                ["website", t("pages.admin.companies.website")],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`company-${key}`}>{label}</Label>
                <Input
                  id={`company-${key}`}
                  type={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
                  value={
                    key === "email"
                      ? form[key]
                      : key === "phoneNumber"
                        ? maskPhone(form[key])
                        : form[key]
                  }
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [key]:
                        key === "email"
                          ? maskEmail(event.target.value)
                          : key === "phoneNumber"
                            ? maskPhone(event.target.value)
                            : event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{t("pages.admin.companies.address")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["country", t("pages.admin.companies.country")],
                ["cep", t("pages.admin.companies.cep")],
                ["street", t("pages.admin.companies.street")],
                ["district", t("pages.admin.companies.district")],
                ["number", t("pages.admin.companies.number")],
                ["city", t("pages.admin.companies.city")],
                ["state", t("pages.admin.companies.state")],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`address-${key}`}>{label}</Label>
                <Input
                  id={`address-${key}`}
                  maxLength={key === "country" ? 2 : key === "state" && isBrazil ? 2 : key === "cep" && isBrazil ? 9 : undefined}
                  inputMode={key === "cep" && isBrazil ? "numeric" : undefined}
                  value={
                    key === "cep" && isBrazil
                      ? maskCep(form.cep)
                      : key === "state" && isBrazil
                        ? maskUf(form.state)
                        : key === "country"
                          ? form.country.toUpperCase()
                          : form[key]
                  }
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [key]:
                        key === "country"
                          ? event.target.value.toUpperCase().slice(0, 2)
                          : key === "cep" && isBrazil
                            ? normalizeCepInput(event.target.value)
                            : key === "state" && isBrazil
                              ? maskUf(event.target.value)
                              : event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CompanyProfileImageDialog
        open={companyImage.isDialogOpen}
        onOpenChange={companyImage.setIsDialogOpen}
        displayName={displayName}
        imageSource={companyImage.imageSource}
        previewImageSrc={companyImage.previewImageSrc}
        selectedFileName={companyImage.selectedFileName}
        zoom={companyImage.zoom}
        isSubmitting={companyImage.isSubmitting}
        canSave={companyImage.canSave}
        removeActionLabel={companyImage.removeActionLabel}
        hasPersistedImage={companyImage.hasPersistedImage}
        fileInputRef={companyImage.fileInputRef}
        crop={companyImage.crop}
        onCropChange={companyImage.setCrop}
        onZoomChange={companyImage.setZoom}
        onCropComplete={companyImage.handleCropComplete}
        onFileInputChange={companyImage.handleFileInputChange}
        onDrop={companyImage.handleDrop}
        onDragOver={companyImage.handleDragOver}
        onSelectFileClick={companyImage.handleSelectFileClick}
        onSave={companyImage.handleSave}
        onRemove={companyImage.handleRemove}
        t={t}
        getInitials={companyInitials}
      />

      <AdminConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("pages.admin.common.confirmDeleteTitle")}
        description={t("pages.admin.companies.deleteConfirm", { name: company.name })}
        onConfirm={handleDelete}
        isLoading={isSaving}
      />
    </AdminPageShell>
  );
};

export default AdminCompanyDetailPage;
