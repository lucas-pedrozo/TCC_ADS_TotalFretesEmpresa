import { useOutletContext } from "react-router-dom";

import type { SideLayoutOutletContext } from "@/layout/sideLayoutOutletContext";

const HomePage = () => {
  const { companyData } = useOutletContext<SideLayoutOutletContext>();

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
      <h1>{companyData?.name ?? "COMPANY_NAME_FALLBACK"}</h1>
    </div>
  );
};

export default HomePage;
