import { useEffect } from "react";
import { useGetCompany } from "../../hooks/useGetCompany";

const HomePage = () => {
  const { companyData, handleGetCompany } = useGetCompany();

  useEffect(() => {
    handleGetCompany();
  }, [handleGetCompany]); 

  return (
    <div className="flex-1 justify-center items-center">
      <h1>{companyData?.name ?? "Nome da Empresa"}</h1>
    </div>
  );
}

export default HomePage;