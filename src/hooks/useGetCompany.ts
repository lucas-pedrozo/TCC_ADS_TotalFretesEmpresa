import { useCallback, useState } from "react"
import { http } from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import { useAuth } from "@/context/AuthContext";

interface CompanyData {
  name: string;
  email: string;
  birthFundation: string;
  phoneNumber: string;
  website?: string;
  cnpj: string;
  password: string;

  cep: string;
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
}

export function useGetCompany() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useAuth();

  const handleGetCompany = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!id) {
        throw new Error("Company ID not found");
      }
      const response = await http.get<CompanyData>(`/company/${id}`);
      setCompanyData(response.data);
    } catch (error) {
      trataErroAxios(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    companyData,
    isLoading,
    handleGetCompany
  };
}