import { createContext, useContext, useState } from "react";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/utils/phone";
import type { ApiFieldIssue } from "@/utils/apiFieldErrors";

/** Alinhado ao seed do authentication-service (USER=1, COMPANY=2, ADMIN=3). */
export const ACCOUNT_TYPE_COMPANY = 2;

export type RegisterCompanyDataBasic = {
  name: string;
  email: string;
  birthFundation: string;
  phoneCountryCode: string;
  phoneNumber: string;
  website?: string;
  cnpj: string;
  password: string;
  confirmPassword: string;
}

export type RegisterCompanyDataAddress = {
  country: string;
  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
}

export type RegisterCompanyDraftData = RegisterCompanyDataBasic & RegisterCompanyDataAddress & {
  account_type_id: number;
};

type RegisterCompanyContextValue = {
  basicData: RegisterCompanyDataBasic;
  addressData: RegisterCompanyDataAddress;
  fieldErrors: ApiFieldIssue[];

  setDataBasic: (data: RegisterCompanyDataBasic) => void;
  setDataAddress: (data: RegisterCompanyDataAddress) => void;
  setFieldErrors: (errors: ApiFieldIssue[]) => void;
  clearFieldErrors: () => void;
  getPayload: () => RegisterCompanyDraftData;
  reset: () => void;
}

const defultBasicData: RegisterCompanyDataBasic = {
  name: "",
  email: "",
  birthFundation: "",
  phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phoneNumber: "",
  cnpj: "",
  password: "",
  confirmPassword: "",
}

const defaultAddressData: RegisterCompanyDataAddress = {
  country: "BR",
  cep: "",
  street: "",
  district: "",
  number: "",
  city: "",
  state: "",
}

const RegisterCompanyContext = createContext<RegisterCompanyContextValue | undefined>(undefined);

export function RegisterCompanyProvider({ children }: { children: React.ReactNode }) {
  const [basicData, setBasicData] = useState<RegisterCompanyDataBasic>(defultBasicData);
  const [addressData, setAddressData] = useState<RegisterCompanyDataAddress>(defaultAddressData);
  const [fieldErrors, setFieldErrorsState] = useState<ApiFieldIssue[]>([]);

  const setDataBasic = (data: RegisterCompanyDataBasic) => {
    setBasicData(data);
  };

  const setDataAddress = (data: RegisterCompanyDataAddress) => {
    setAddressData(data);
  };

  const setFieldErrors = (errors: ApiFieldIssue[]) => {
    setFieldErrorsState(errors);
  };

  const clearFieldErrors = () => {
    setFieldErrorsState([]);
  };

  const getPayload = () => {
    return { ...basicData, ...addressData, account_type_id: ACCOUNT_TYPE_COMPANY };
  };

  const reset = () => {
    setBasicData(defultBasicData);
    setAddressData(defaultAddressData);
    setFieldErrorsState([]);
  };

  return (
    <RegisterCompanyContext.Provider value={{
      basicData,
      addressData,
      fieldErrors,
      setDataBasic,
      setDataAddress,
      setFieldErrors,
      clearFieldErrors,
      getPayload,
      reset,
    }}>
      {children}
    </RegisterCompanyContext.Provider>
  );
}

export function useRegisterCompanyContext() {
  const context = useContext(RegisterCompanyContext);
  if (!context) {
    throw new Error("useRegisterCompanyContext must be used within a RegisterCompanyProvider");
  }
  return context;
}