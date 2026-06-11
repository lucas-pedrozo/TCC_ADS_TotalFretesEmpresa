import { useCallback, useState } from "react";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { getStoredAuthSession, useAuth } from "@/context/AuthContext";
import { normalizeDateInputValue } from "@/utils/dateFormat";
import { parsePhoneParts } from "@/utils/phone";
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

export type CompanyImageDto = {
  id?: number;
  originalName?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  url?: string | null;
};

type CompanyApiResponse = {
  name?: string;
  email?: string;
  birthFundation?: string;
  phoneNumber?: string | null;
  website?: string | null;
  cnpj?: string;
  company_image_id?: number | null;
  CompanyAddress?: CompanyAddressDto | null;
  CompanyImage?: CompanyImageDto | null;
};

export interface CompanyImageData {
  id: number;
  originalName?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  url: string;
}

export interface CompanyData {
  name: string;
  email: string;
  birthFundation: string;
  phoneCountryCode: string;
  phoneNumber: string;
  website?: string;
  cnpj: string;
  addressId: number | null;
  imageId: number | null;
  image: CompanyImageData | null;

  password?: string;
  country: string;
  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
}

function resolveCompanyAddress(raw: CompanyApiResponse): CompanyAddressDto | null {
  if (raw.CompanyAddress) return raw.CompanyAddress;

  const nested = (raw as { companyAddress?: CompanyAddressDto | null }).companyAddress;
  return nested ?? null;
}

function normalizeCompanyApi(raw: CompanyApiResponse): CompanyData {
  const addr = resolveCompanyAddress(raw);
  const image =
    raw.CompanyImage?.id != null && raw.CompanyImage?.url
      ? {
          id: Number(raw.CompanyImage.id),
          originalName: raw.CompanyImage.originalName ?? undefined,
          fileName: raw.CompanyImage.fileName ?? undefined,
          mimeType: raw.CompanyImage.mimeType ?? undefined,
          sizeBytes:
            raw.CompanyImage.sizeBytes != null
              ? Number(raw.CompanyImage.sizeBytes)
              : undefined,
          url: String(raw.CompanyImage.url),
        }
      : null;
  const country =
    addr?.country != null && String(addr.country).trim() !== ""
      ? String(addr.country).trim().toUpperCase()
      : "BR";
  const phoneParts = parsePhoneParts(String(raw.phoneNumber ?? ""), country);

  return {
    name: String(raw.name ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    birthFundation: normalizeDateInputValue(String(raw.birthFundation ?? "")),
    phoneCountryCode: phoneParts.phoneCountryCode,
    phoneNumber: phoneParts.phoneNumber,
    website: raw.website ?? undefined,
    cnpj: String(raw.cnpj ?? "").trim(),
    addressId: typeof addr?.id === "number" ? addr.id : null,
    imageId:
      image?.id ??
      (typeof raw.company_image_id === "number" ? raw.company_image_id : null),
    image,
    country,
    cep: addr?.cep != null ? String(addr.cep).replace(/\D/g, "") : "",
    street: addr?.street != null ? String(addr.street).trim() : "",
    district: addr?.district != null ? String(addr.district).trim() : "",
    number: addr?.number != null ? String(addr.number) : "",
    city: addr?.city != null ? String(addr.city) : "",
    state: addr?.state != null ? String(addr.state) : "",
  };
}

export function useGetCompany() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id, accessLevel } = useAuth();

  const handleGetCompany = useCallback(async () => {
    const storedSession = getStoredAuthSession();
    const effectiveLevel = (storedSession?.accessLevel ?? accessLevel)?.toUpperCase();

    if (effectiveLevel !== "COMPANY") {
      setCompanyData(null);
      return;
    }

    const companyId = storedSession?.id ?? id;

    try {
      setIsLoading(true);
      if (!companyId) {
        throw new Error(i18n.t("COMPANY.COMPANY_NOT_FOUND"));
      }
      const response = await http.get<CompanyApiResponse>(`/company/${companyId}`);
      setCompanyData(normalizeCompanyApi(response.data));
    } catch (error) {
      toast.error(trataErroAxios(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessLevel, id]);

  return {
    companyData,
    isLoading,
    handleGetCompany,
  };
}
