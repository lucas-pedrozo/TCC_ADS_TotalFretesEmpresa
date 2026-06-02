import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import type { CompanyData } from "@/hooks/useGetCompany";
import http from "@/service/http";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";
import { validatePassword, validatePasswordConfirmation } from "@/utils/validation";

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ApiMessageResponse = {
  message?: string;
};

type UseCompanySecurityParams = {
  companyData: CompanyData | null;
};

function trimValue(value: string) {
  return value.trim();
}

export function useCompanySecurity({ companyData }: UseCompanySecurityParams) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ChangePasswordFormData>({
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteConfirmKeyword = t("pages.profile.security.deleteConfirmKeyword");
  const companyName = useMemo(
    () => companyData?.name?.trim() || t("header.companyNameFallback"),
    [companyData?.name, t]
  );
  const canConfirmDelete =
    deleteConfirmationValue.trim().toUpperCase() === deleteConfirmKeyword.toUpperCase();

  const rules = {
    currentPassword: {
      required: t("validation.passwordRequired"),
      validate: (value: string | undefined) =>
        !value || validatePassword(value) || t("validation.passwordInvalid"),
    },
    newPassword: {
      required: t("validation.passwordRequired"),
      validate: (value: string | undefined, formValues: ChangePasswordFormData) => {
        if (!value) return true;
        if (!validatePassword(value)) return t("validation.passwordInvalid");
        if (trimValue(formValues.currentPassword) === trimValue(value)) {
          return t("pages.profile.security.passwordMustDiffer");
        }

        return true;
      },
    },
    confirmPassword: {
      required: t("validation.confirmPasswordRequired"),
      validate: (value: string | undefined, formValues: ChangePasswordFormData) =>
        !value ||
        validatePasswordConfirmation(formValues.newPassword, value) ||
        t("validation.confirmPasswordInvalid"),
    },
  };

  const handleChangePassword = handleSubmit(async (values) => {
    const toastId = toast.loading(t("pages.profile.security.changePasswordLoading"));

    try {
      const { data } = await http.patch<ApiMessageResponse>("/auth/change-password", {
        currentPassword: trimValue(values.currentPassword),
        newPassword: trimValue(values.newPassword),
      });

      reset();
      toast.success(
        traduzMensagemApi(data.message) ?? t("pages.profile.security.changePasswordSuccess"),
        { id: toastId }
      );
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    }
  });

  const handleDeleteAccount = useCallback(async () => {
    if (!canConfirmDelete) {
      toast.error(t("pages.profile.security.deleteConfirmMismatch"));
      return;
    }

    const toastId = toast.loading(t("pages.profile.security.deleteLoading"));

    try {
      setIsDeletingAccount(true);

      const { data } = await http.delete<ApiMessageResponse>("/company/me");

      toast.success(
        traduzMensagemApi(data.message) ?? t("pages.profile.security.deleteSuccess"),
        { id: toastId }
      );

      await logout();
      navigate("/Start", { replace: true });
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsDeletingAccount(false);
    }
  }, [canConfirmDelete, logout, navigate, t]);

  const handleDeleteDialogChange = useCallback((open: boolean) => {
    setIsDeleteDialogOpen(open);

    if (!open) {
      setDeleteConfirmationValue("");
    }
  }, []);

  return {
    register,
    errors,
    isDirty,
    isSubmitting,
    isDeleteDialogOpen,
    isDeletingAccount,
    deleteConfirmKeyword,
    deleteConfirmationValue,
    companyName,
    canConfirmDelete,
    rules,
    setDeleteConfirmationValue,
    handleChangePassword,
    handleDeleteAccount,
    handleDeleteDialogChange,
  };
}
