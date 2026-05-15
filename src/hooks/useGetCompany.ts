import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import i18n from "@/i18n";

/** Endereço retornado pelo company-service em `GET /company/:id` (include Sequelize). */
export type CompanyAddressDto = {
  id?: number;
  country?: string | null;
  cep?: string | null;
  street?: string | null;
  district?: string | null;
  number?: string | null;
  city?: string | null;
  state?: string | null;
};

type CompanyApiResponse = {
  name?: string;
  email?: string;
  birthFundation?: string;
  phoneNumber?: string | null;
  website?: string | null;
  cnpj?: string;
  CompanyAddress?: CompanyAddressDto | null;
};

export interface CompanyData {
  name: string;
  email: string;
  birthFundation: string;
  phoneNumber: string;
  website?: string;
  cnpj: string;
  /** Não vem no GET; mantido opcional por compatibilidade com tipos antigos. */
  password?: string;
  country: string;
  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
}

function normalizeCompanyApi(raw: CompanyApiResponse): CompanyData {
  const addr = raw.CompanyAddress;
  const country =
    addr?.country != null && String(addr.country).trim() !== ""
      ? String(addr.country).trim().toUpperCase()
      : "BR";
  return {
    name: String(raw.name ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    birthFundation: String(raw.birthFundation ?? ""),
    phoneNumber: raw.phoneNumber != null ? String(raw.phoneNumber) : "",
    website: raw.website ?? undefined,
    cnpj: String(raw.cnpj ?? "").trim(),
    country,
    cep: addr?.cep != null ? String(addr.cep) : "",
    street: addr?.street != null ? String(addr.street) : "",
    district: addr?.district != null ? String(addr.district) : "",
    number: addr?.number != null ? String(addr.number) : "",
    city: addr?.city != null ? String(addr.city) : "",
    state: addr?.state != null ? String(addr.state) : "",
  };
}

export function useGetCompany() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useAuth();

  const handleGetCompany = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!id) {
        throw new Error(i18n.t("COMPANY.COMPANY_NOT_FOUND"));
      }
      const response = await http.get<CompanyApiResponse>(`/company/${id}`);
      setCompanyData(normalizeCompanyApi(response.data));
    } catch (error) {
      toast.error(trataErroAxios(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    companyData,
    isLoading,
    handleGetCompany,
  };
}
