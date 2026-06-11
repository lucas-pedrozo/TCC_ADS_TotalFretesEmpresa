import { ACCOUNT_TYPE_COMPANY } from "@/context/RegisterCompanyContext";
import { normalizeCnpj } from "@/utils/cnpjInRfb2229";
import { buildPhoneE164, DEFAULT_PHONE_COUNTRY_CODE } from "@/utils/phone";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export type AdminCreateCompanyForm = {
  name: string;
  email: string;
  birthFundation: string;
  phoneCountryCode: string;
  phoneNumber: string;
  website: string;
  cnpj: string;
  password: string;
  passwordConfirm: string;
  country: string;
  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
};

export type AdminCreateDriverForm = {
  name: string;
  email: string;
  birthDate: string;
  phoneNumber: string;
  cpf: string;
  sex: string;
  useGlasses: boolean;
  isDeficient: boolean;
  cnhNumber: string;
  cnhType_id: string;
  issuingAgencyCnh: string;
  password: string;
  passwordConfirm: string;
};

export const initialAdminCredentialsForm = () => ({
  email: "",
  password: "",
  passwordConfirm: "",
});

export const initialAdminCompanyForm = (): AdminCreateCompanyForm => ({
  name: "",
  email: "",
  birthFundation: "",
  phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phoneNumber: "",
  website: "",
  cnpj: "",
  password: "",
  passwordConfirm: "",
  country: "BR",
  cep: "",
  street: "",
  district: "",
  number: "",
  city: "",
  state: "",
});

export const initialAdminDriverForm = (): AdminCreateDriverForm => ({
  name: "",
  email: "",
  birthDate: "",
  phoneNumber: "",
  cpf: "",
  sex: "M",
  useGlasses: false,
  isDeficient: false,
  cnhNumber: "",
  cnhType_id: "",
  issuingAgencyCnh: "",
  password: "",
  passwordConfirm: "",
});

export function normalizeCompanyEndAccountPayload(form: AdminCreateCompanyForm) {
  return {
    account_type_id: ACCOUNT_TYPE_COMPANY,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    birthFundation: form.birthFundation,
    phoneNumber: buildPhoneE164(form.phoneCountryCode, form.phoneNumber),
    website: form.website.trim() || undefined,
    cnpj: normalizeCnpj(form.cnpj),
    password: form.password,
    country: form.country.trim().toUpperCase(),
    cep: form.country === "BR" ? onlyDigits(form.cep) : form.cep.trim(),
    street: form.street.trim(),
    district: form.district.trim(),
    number: form.number.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
  };
}

export function normalizeDriverEndAccountPayload(
  form: AdminCreateDriverForm,
  accountTypeId: number
) {
  return {
    account_type_id: accountTypeId,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    birthDate: form.birthDate,
    phoneNumber: onlyDigits(form.phoneNumber),
    cpf: onlyDigits(form.cpf),
    sex: form.sex.trim(),
    useGlasses: form.useGlasses,
    isDeficient: form.isDeficient,
    cnhNumber: form.cnhNumber.trim(),
    cnhType_id: Number(form.cnhType_id),
    ...(form.issuingAgencyCnh.trim()
      ? { issuingAgencyCnh: form.issuingAgencyCnh.trim() }
      : {}),
    password: form.password,
  };
}
