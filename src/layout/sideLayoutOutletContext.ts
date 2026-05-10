import type { CompanyData } from "@/hooks/useGetCompany";

export type SideLayoutOutletContext = {
  companyData: CompanyData | null;
  isCompanyLoading: boolean;
  handleGetCompany: () => Promise<void>;
};
