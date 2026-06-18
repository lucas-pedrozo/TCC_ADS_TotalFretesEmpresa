import type { TFunction } from "i18next";

import type {
  AdminCreateCompanyForm,
  AdminCreateDriverForm,
} from "@/utils/adminCreateAccountPayload";
import {
  validateCNPJ,
  validateCPF,
  validateCepByCountry,
  validateCountry,
  validateDate,
  validateEmail,
  validatePhone,
  validatePhoneCountryCode,
  validateRequired,
  validateUf,
} from "@/utils/validation";

export function validateAdminEmail(email: string, t: TFunction): string | null {
  if (!validateRequired(email)) {
    return t("validation.emailRequired");
  }
  if (!validateEmail(email.trim())) {
    return t("validation.emailInvalid");
  }
  return null;
}

export function validateAdminCompanyForm(
  form: AdminCreateCompanyForm,
  t: TFunction
): string | null {
  if (!form.name.trim() || form.name.trim().length < 3) {
    return t("validation.nameInvalid");
  }

  const emailError = validateAdminEmail(form.email, t);
  if (emailError) return emailError;

  if (!form.birthFundation || !validateDate(form.birthFundation)) {
    return t("validation.birthFundationInvalid");
  }

  if (!validateCNPJ(form.cnpj)) {
    return t("validation.cnpjInvalid");
  }

  if (!validatePhoneCountryCode(form.phoneCountryCode)) {
    return t("validation.phoneCountryCodeInvalid");
  }

  if (!validatePhone(form.phoneCountryCode, form.phoneNumber)) {
    return t("validation.phoneInvalid");
  }

  if (!validateCountry(form.country)) {
    return t("validation.countryInvalid");
  }

  if (!validateCepByCountry(form.cep, form.country)) {
    return t("validation.cepInvalid");
  }

  if (!validateRequired(form.street)) {
    return t("validation.streetRequired");
  }

  if (!validateRequired(form.district)) {
    return t("validation.districtRequired");
  }

  if (!validateRequired(form.number)) {
    return t("validation.numberRequired");
  }

  if (!validateRequired(form.city)) {
    return t("validation.cityRequired");
  }

  if (form.country === "BR") {
    if (!validateUf(form.state)) {
      return t("validation.stateInvalid");
    }
  } else if (!validateRequired(form.state)) {
    return t("validation.stateRequired");
  }

  return null;
}

export function validateAdminDriverForm(
  form: AdminCreateDriverForm,
  t: TFunction
): string | null {
  if (!form.name.trim() || form.name.trim().length < 3) {
    return t("validation.nameInvalid");
  }

  const emailError = validateAdminEmail(form.email, t);
  if (emailError) return emailError;

  if (!form.birthDate || !validateDate(form.birthDate)) {
    return t("validation.birthDateInvalid");
  }

  if (!validatePhone("55", form.phoneNumber)) {
    return t("validation.phoneInvalid");
  }

  if (!validateCPF(form.cpf)) {
    return t("validation.cpfInvalid");
  }

  if (!validateRequired(form.sex)) {
    return t("validation.sexRequired");
  }

  if (!/^\d{11}$/.test(form.cnhNumber.replace(/\D/g, ""))) {
    return t("validation.cnhNumberInvalid");
  }

  if (!form.cnhType_id) {
    return t("validation.cnhTypeRequired");
  }

  return null;
}
