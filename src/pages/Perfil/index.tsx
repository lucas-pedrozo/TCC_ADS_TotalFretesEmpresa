import {
  Building2,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  TriangleAlert,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/custom/inputs/DatePickerInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanySecurity } from "@/hooks/useCompanySecurity";
import { useCompanyProfileImage } from "@/hooks/useCompanyProfileImage";
import { useUpdateCompanyProfile } from "@/hooks/useUpdateCompanyProfile";
import type { SideLayoutOutletContext } from "@/layout/sideLayoutOutletContext";
import { cn } from "@/lib/utils";
import { CompanyProfileImageDialog } from "@/pages/Perfil/components/CompanyProfileImageDialog";
import { maskCnpjInRfb2229 } from "@/utils/cnpjInRfb2229";
import { maskCep } from "@/utils/mask";
import {
  buildPhoneE164,
  formatPhoneCountryCode,
  formatPhoneNumberForDisplay,
  maskPhoneNationalNumber,
  normalizePhoneCountryCodeInput,
  normalizePhoneNationalNumberInput,
} from "@/utils/phone";

type ProfileTab = "company" | "address" | "security";

function companyInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "?";

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  }

  return `${words[0]?.[0] ?? ""}${words[words.length - 1]?.[0] ?? ""}`.toUpperCase();
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm text-destructive">{message}</p>;
}

function ProfileField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function ProfileTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-green-dark text-white hover:bg-brand-green-dark/90 hover:text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-w-0 flex-1 bg-muted/20 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-[28px] border bg-background p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </section>

        <section className="rounded-[28px] border bg-background p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </section>

        <section className="rounded-[28px] border bg-background p-5 shadow-sm md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const PerfilPage = () => {
  const { t } = useTranslation();
  const { companyData, isCompanyLoading, handleGetCompany } =
    useOutletContext<SideLayoutOutletContext>();
  const [activeTab, setActiveTab] = useState<ProfileTab>("company");
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const {
    control,
    register,
    watch,
    setValue,
    errors,
    isDirty,
    isSubmitting,
    isSearchingCep,
    countryOptions,
    stateOptions,
    hasStateOptions,
    rules,
    handleReset,
    handleSave,
  } = useUpdateCompanyProfile({
    companyData,
    handleGetCompany,
  });
  const {
    register: registerSecurity,
    errors: securityErrors,
    isDirty: isSecurityDirty,
    isSubmitting: isSecuritySubmitting,
    isDeleteDialogOpen,
    isDeletingAccount,
    deleteConfirmKeyword,
    deleteConfirmationValue,
    companyName,
    canConfirmDelete,
    rules: securityRules,
    setDeleteConfirmationValue,
    handleChangePassword,
    handleDeleteAccount,
    handleDeleteDialogChange,
  } = useCompanySecurity({
    companyData,
  });
  const {
    fileInputRef,
    isDialogOpen,
    isSubmitting: isImageSubmitting,
    imageSource,
    previewImageSrc,
    selectedFileName,
    zoom,
    crop,
    canSave: canSaveImage,
    hasPersistedImage,
    removeActionLabel,
    openDialog,
    setIsDialogOpen,
    setZoom,
    setCrop,
    handleCropComplete,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleSelectFileClick,
    handleSave: handleSaveImage,
    handleRemove: handleRemoveImage,
  } = useCompanyProfileImage({
    companyData,
    handleGetCompany,
  });

  const liveName = watch("name")?.trim();
  const liveCnpj = watch("cnpj")?.trim();
  const livePhoneCountryCode = watch("phoneCountryCode")?.trim();
  const livePhone = watch("phoneNumber")?.trim();
  const liveWebsite = watch("website")?.trim();
  const liveCity = watch("city")?.trim();
  const liveState = watch("state")?.trim();
  const websiteHref = useMemo(() => normalizeWebsiteUrl(liveWebsite ?? ""), [liveWebsite]);
  const formattedCnpj = useMemo(
    () => maskCnpjInRfb2229(liveCnpj ?? "") || t("pages.profile.cnpjFallback"),
    [liveCnpj, t]
  );
  const formattedPhone = useMemo(
    () =>
      formatPhoneNumberForDisplay(
        buildPhoneE164(livePhoneCountryCode ?? "", livePhone ?? ""),
        companyData?.country ?? "BR"
      ) || t("pages.profile.phoneFallback"),
    [companyData?.country, livePhone, livePhoneCountryCode, t]
  );

  const summaryLocation = useMemo(() => {
    if (!liveCity && !liveState) return t("pages.profile.locationFallback");
    return [liveCity, liveState].filter(Boolean).join(" • ");
  }, [liveCity, liveState, t]);
  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  if (isCompanyLoading && !companyData) {
    return <ProfileSkeleton />;
  }

  if (!companyData) {
    return (
      <div className="min-w-0 flex-1 bg-muted/20 px-4 py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-[28px] border bg-background px-6 py-12 text-center shadow-sm">
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            <Building2 className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {t("pages.profile.unavailableTitle")}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("pages.profile.unavailableDescription")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => void handleGetCompany()}
          >
            <RefreshCw className="size-4" />
            {t("pages.profile.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 bg-muted/20 px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-[28px] border bg-background p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="size-20 md:size-24">
                  {companyData.image?.url ? (
                    <AvatarImage src={companyData.image.url} alt={liveName || companyData.name} />
                  ) : null}
                  <AvatarFallback className="bg-brand-green-dark text-lg font-semibold text-white md:text-xl">
                    {companyInitials(liveName || companyData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-3 text-white hover:bg-brand-green/90 transition-all duration-200"
                  onClick={openDialog}
                >
                  <Camera className="size-4 transition-all duration-300" />
                  {t("pages.profileImage.edit")}
                </Button>
              </div>

              <div className="min-w-0 space-y-2 pt-8 md:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-semibold text-foreground md:text-2xl">
                    {liveName || t("header.companyNameFallback")}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-4" />
                    {formattedCnpj}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-4" />
                    {formattedPhone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {summaryLocation}
                  </span>
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <Globe className="size-4" />
                    {websiteHref ? (
                      <a
                        href={websiteHref}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all underline underline-offset-2 hover:text-foreground"
                        title={liveWebsite}
                      >
                        {liveWebsite}
                      </a>
                    ) : (
                      t("pages.profile.websiteFallback")
                    )}
                  </span>
                </div>
              </div>
            </div>


          </div>
        </section>

        <section className="rounded-[28px] border bg-background p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <ProfileTabButton
              label={t("pages.profile.tabs.company")}
              isActive={activeTab === "company"}
              onClick={() => setActiveTab("company")}
            />
            <ProfileTabButton
              label={t("pages.profile.tabs.address")}
              isActive={activeTab === "address"}
              onClick={() => setActiveTab("address")}
            />
            <ProfileTabButton
              label={t("pages.profile.tabs.security")}
              isActive={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />
          </div>
        </section>

        {activeTab === "security" ? (
          <div className="flex flex-col gap-5">
            <section className="rounded-[28px] border bg-background p-5 shadow-sm md:p-6">
              <div className="mb-6 space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-brand-green-dark" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("pages.profile.security.title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("pages.profile.security.description")}
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <section className="rounded-[24px] border bg-muted/10 p-5">
                  <div className="mb-5 space-y-1">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4 text-brand-green-dark" />
                      <h4 className="font-semibold text-foreground">
                        {t("pages.profile.security.changePasswordTitle")}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("pages.profile.security.changePasswordDescription")}
                    </p>
                  </div>

                  <form className="space-y-5" onSubmit={handleChangePassword}>
                    <ProfileField
                      label={t("pages.profile.security.fields.currentPassword")}
                      htmlFor="profile-current-password"
                      error={securityErrors.currentPassword?.message}
                    >
                      <div className="relative">
                        <Input
                          id="profile-current-password"
                          className="h-11 rounded-xl pr-11"
                          placeholder={t("pages.profile.security.placeholders.currentPassword")}
                          autoComplete="current-password"
                          type={passwordVisibility.current ? "text" : "password"}
                          {...registerSecurity("currentPassword", securityRules.currentPassword)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-1.5 right-1.5 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => togglePasswordVisibility("current")}
                          aria-label={
                            passwordVisibility.current
                              ? t("common.hidePassword")
                              : t("common.showPassword")
                          }
                        >
                          {passwordVisibility.current ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </ProfileField>

                    <ProfileField
                      label={t("pages.profile.security.fields.newPassword")}
                      htmlFor="profile-new-password"
                      error={securityErrors.newPassword?.message}
                    >
                      <div className="relative">
                        <Input
                          id="profile-new-password"
                          className="h-11 rounded-xl pr-11"
                          placeholder={t("pages.profile.security.placeholders.newPassword")}
                          autoComplete="new-password"
                          type={passwordVisibility.next ? "text" : "password"}
                          {...registerSecurity("newPassword", securityRules.newPassword)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-1.5 right-1.5 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => togglePasswordVisibility("next")}
                          aria-label={
                            passwordVisibility.next
                              ? t("common.hidePassword")
                              : t("common.showPassword")
                          }
                        >
                          {passwordVisibility.next ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </ProfileField>

                    <ProfileField
                      label={t("pages.profile.security.fields.confirmPassword")}
                      htmlFor="profile-confirm-password"
                      error={securityErrors.confirmPassword?.message}
                    >
                      <div className="relative">
                        <Input
                          id="profile-confirm-password"
                          className="h-11 rounded-xl pr-11"
                          placeholder={t("pages.profile.security.placeholders.confirmPassword")}
                          autoComplete="new-password"
                          type={passwordVisibility.confirm ? "text" : "password"}
                          {...registerSecurity("confirmPassword", securityRules.confirmPassword)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-1.5 right-1.5 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => togglePasswordVisibility("confirm")}
                          aria-label={
                            passwordVisibility.confirm
                              ? t("common.hidePassword")
                              : t("common.showPassword")
                          }
                        >
                          {passwordVisibility.confirm ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </ProfileField>

                    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        {isSecurityDirty
                          ? t("pages.profile.security.changePasswordDirty")
                          : t("pages.profile.security.changePasswordHint")}
                      </p>

                      <Button
                        type="submit"
                        className="rounded-full bg-brand-green-dark px-5 text-white hover:bg-brand-green-dark/90"
                        disabled={isSecuritySubmitting}
                      >
                        {isSecuritySubmitting
                          ? t("pages.profile.security.changePasswordLoading")
                          : t("pages.profile.security.changePasswordSubmit")}
                      </Button>
                    </div>
                  </form>
                </section>

                <section className="rounded-[24px] border border-destructive/20 bg-destructive/5 p-5">
                  <div className="mb-5 space-y-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <TriangleAlert className="size-4" />
                      <h4 className="font-semibold">
                        {t("pages.profile.security.deleteTitle")}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("pages.profile.security.deleteDescription")}
                    </p>
                    <div className="rounded-2xl border border-destructive/20 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                      {t("pages.profile.security.deleteWarning")}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full rounded-full"
                    onClick={() => handleDeleteDialogChange(true)}
                    disabled={isDeletingAccount}
                  >
                    <Trash2 className="size-4" />
                    {isDeletingAccount
                      ? t("pages.profile.security.deleteLoading")
                      : t("pages.profile.security.deleteSubmit")}
                  </Button>
                </section>
              </div>
            </section>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleSave}>
            {activeTab === "company" ? (
              <section className="rounded-[28px] border bg-background p-5 shadow-sm md:p-6">
                <div className="mb-6 space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("pages.profile.companySectionTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("pages.profile.companySectionDescription")}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ProfileField
                    label={t("pages.profile.fields.name")}
                    htmlFor="profile-name"
                    error={errors.name?.message}
                  >
                    <Input
                      id="profile-name"
                      className="h-11 rounded-xl"
                      placeholder={t("pages.profile.placeholders.name")}
                      autoComplete="organization"
                      {...register("name", rules.name)}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.cnpj")}
                    htmlFor="profile-cnpj"
                    error={errors.cnpj?.message}
                  >
                    <Controller
                      name="cnpj"
                      control={control}
                      rules={rules.cnpj}
                      render={({ field }) => (
                        <Input
                          id="profile-cnpj"
                          className="h-11 rounded-xl"
                          placeholder={t("pages.profile.placeholders.cnpj")}
                          autoComplete="off"
                          value={maskCnpjInRfb2229(field.value ?? "")}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.value)}
                          ref={field.ref}
                        />
                      )}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.phoneCountryCode")}
                    htmlFor="profile-phone-country-code"
                    error={errors.phoneCountryCode?.message}
                  >
                    <Controller
                      name="phoneCountryCode"
                      control={control}
                      rules={rules.phoneCountryCode}
                      render={({ field }) => (
                        <Input
                          id="profile-phone-country-code"
                          className="h-11 rounded-xl"
                          placeholder={t("pages.profile.placeholders.phoneCountryCode")}
                          autoComplete="tel-country-code"
                          inputMode="numeric"
                          maxLength={4}
                          value={formatPhoneCountryCode(field.value ?? "")}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(normalizePhoneCountryCodeInput(event.target.value))
                          }
                          ref={field.ref}
                        />
                      )}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.phoneNumber")}
                    htmlFor="profile-phone-number"
                    error={errors.phoneNumber?.message}
                  >
                    <Controller
                      name="phoneNumber"
                      control={control}
                      rules={rules.phoneNumber}
                      render={({ field }) => (
                        <Input
                          id="profile-phone-number"
                          className="h-11 rounded-xl"
                          placeholder={t("pages.profile.placeholders.phoneNumber")}
                          autoComplete="tel-national"
                          inputMode="tel"
                          maxLength={20}
                          value={maskPhoneNationalNumber(
                            field.value ?? "",
                            livePhoneCountryCode ?? ""
                          )}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(
                              normalizePhoneNationalNumberInput(
                                event.target.value,
                                livePhoneCountryCode ?? ""
                              )
                            )
                          }
                          ref={field.ref}
                        />
                      )}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.birthFundation")}
                    htmlFor="profile-foundation-date"
                    error={errors.birthFundation?.message}
                  >
                    <Controller
                      name="birthFundation"
                      control={control}
                      rules={rules.birthFundation}
                      render={({ field }) => (
                        <DatePickerInput
                          id="profile-foundation-date"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder={t("pages.profile.placeholders.birthFundation")}
                          className="h-11 rounded-xl"
                        />
                      )}
                    />
                  </ProfileField>

                  <div className="md:col-span-2">
                    <ProfileField
                      label={t("pages.profile.fields.website")}
                      htmlFor="profile-website"
                      error={errors.website?.message}
                    >
                      <Input
                        id="profile-website"
                        className="h-11 rounded-xl"
                        placeholder={t("pages.profile.placeholders.website")}
                        autoComplete="url"
                        {...register("website")}
                      />
                    </ProfileField>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-[28px] border bg-background p-5 shadow-sm md:p-6">
                <div className="mb-6 space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("pages.profile.addressSectionTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("pages.profile.addressSectionDescription")}
                  </p>
                </div>

                <div className="mb-6 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  {isSearchingCep
                    ? t("pages.profile.searchingCep")
                    : t("pages.profile.addressHint")}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ProfileField
                    label={t("pages.profile.fields.country")}
                    error={errors.country?.message}
                  >
                    <Controller
                      name="country"
                      control={control}
                      rules={rules.country}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue("state", "", { shouldDirty: true });
                          }}
                        >
                          <SelectTrigger className="h-11 w-full rounded-xl">
                            <SelectValue placeholder={t("pages.profile.placeholders.country")} />
                          </SelectTrigger>
                          <SelectContent>
                            {countryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.cep")}
                    htmlFor="profile-cep"
                    error={errors.cep?.message}
                  >
                    <Controller
                      name="cep"
                      control={control}
                      rules={rules.cep}
                      render={({ field }) => (
                        <Input
                          id="profile-cep"
                          className="h-11 rounded-xl"
                          placeholder={t("pages.profile.placeholders.cep")}
                          autoComplete="postal-code"
                          value={maskCep(field.value ?? "")}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(event.target.value.replace(/\D/g, ""))
                          }
                          ref={field.ref}
                        />
                      )}
                    />
                  </ProfileField>

                  <div className="md:col-span-2">
                    <ProfileField
                      label={t("pages.profile.fields.street")}
                      htmlFor="profile-street"
                      error={errors.street?.message}
                    >
                      <Input
                        id="profile-street"
                        className="h-11 rounded-xl"
                        placeholder={t("pages.profile.placeholders.street")}
                        autoComplete="address-line1"
                        {...register("street", rules.street)}
                      />
                    </ProfileField>
                  </div>

                  <ProfileField
                    label={t("pages.profile.fields.district")}
                    htmlFor="profile-district"
                    error={errors.district?.message}
                  >
                    <Input
                      id="profile-district"
                      className="h-11 rounded-xl"
                      placeholder={t("pages.profile.placeholders.district")}
                      autoComplete="address-level3"
                      {...register("district", rules.district)}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.number")}
                    htmlFor="profile-number"
                    error={errors.number?.message}
                  >
                    <Input
                      id="profile-number"
                      className="h-11 rounded-xl"
                      placeholder={t("pages.profile.placeholders.number")}
                      autoComplete="address-line2"
                      {...register("number", rules.number)}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.city")}
                    htmlFor="profile-city"
                    error={errors.city?.message}
                  >
                    <Input
                      id="profile-city"
                      className="h-11 rounded-xl"
                      placeholder={t("pages.profile.placeholders.city")}
                      autoComplete="address-level2"
                      {...register("city", rules.city)}
                    />
                  </ProfileField>

                  <ProfileField
                    label={t("pages.profile.fields.state")}
                    error={errors.state?.message}
                  >
                    {hasStateOptions ? (
                      <Controller
                        name="state"
                        control={control}
                        rules={rules.state}
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="h-11 w-full rounded-xl">
                              <SelectValue
                                placeholder={t("pages.profile.placeholders.state")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {stateOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    ) : (
                      <Controller
                        name="state"
                        control={control}
                        rules={rules.state}
                        render={({ field }) => (
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={t("pages.profile.placeholders.state")}
                            autoComplete="address-level1"
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                            ref={field.ref}
                          />
                        )}
                      />
                    )}
                  </ProfileField>
                </div>
              </section>
            )}

            <section className="rounded-[28px] border bg-background px-5 py-4 shadow-sm md:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {t("pages.profile.footerTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isDirty
                      ? t("pages.profile.footerDirty")
                      : t("pages.profile.footerPristine")}
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={handleReset}
                    disabled={!isDirty || isSubmitting}
                  >
                    {t("pages.profile.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full bg-brand-green-dark px-5 text-white hover:bg-brand-green-dark/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("pages.profile.saving")
                      : t("pages.profile.save")}
                  </Button>
                </div>
              </div>
            </section>
          </form>
        )}

        <Separator className="bg-transparent" />
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pages.profile.security.deleteDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("pages.profile.security.deleteDialogDescription", {
                companyName,
                keyword: deleteConfirmKeyword,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="profile-delete-confirmation">
              {t("pages.profile.security.deleteDialogLabel")}
            </Label>
            <Input
              id="profile-delete-confirmation"
              value={deleteConfirmationValue}
              onChange={(event) => setDeleteConfirmationValue(event.target.value)}
              placeholder={deleteConfirmKeyword}
              autoComplete="off"
              className="h-11 rounded-xl"
            />
            <p className="text-sm text-muted-foreground">
              {t("pages.profile.security.deleteDialogHint")}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteDialogChange(false)}
              disabled={isDeletingAccount}
            >
              {t("pages.profile.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeleteAccount()}
              disabled={!canConfirmDelete || isDeletingAccount}
            >
              {isDeletingAccount
                ? t("pages.profile.security.deleteLoading")
                : t("pages.profile.security.deleteDialogSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CompanyProfileImageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        displayName={liveName || companyData.name}
        imageSource={imageSource}
        previewImageSrc={previewImageSrc}
        selectedFileName={selectedFileName}
        zoom={zoom}
        isSubmitting={isImageSubmitting}
        canSave={canSaveImage}
        removeActionLabel={removeActionLabel}
        hasPersistedImage={hasPersistedImage}
        fileInputRef={fileInputRef}
        crop={crop}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        onFileInputChange={handleFileInputChange}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onSelectFileClick={handleSelectFileClick}
        onSave={handleSaveImage}
        onRemove={handleRemoveImage}
        t={t}
        getInitials={companyInitials}
      />
    </div>
  );
};

export default PerfilPage;
