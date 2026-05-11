import { Routes, Route, Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";

import SingUpBasicPage from "@/pages/SingUpBasic";
import SingUpAddressPage from "@/pages/SingUpAddress";
import LoginPage from "@/pages/Login";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import VerificationCodePage from "@/pages/VerificationCode";
import NewPasswordPage from "@/pages/NewPassword";
import HomePage from "@/pages/Home";
import PerfilPage from "@/pages/Perfil";
import StartPage from "@/pages/Start";
import { SideLayout } from "@/layout/SideLayout";
import { RegisterCompanyProvider } from "@/context/RegisterCompanyContext";
import PrivateRoute from "./PrivateRoutes";
import FreightsPage from "@/pages/Freights";
import FreightNewPage from "@/pages/Freights/New";
import FreightDetailPage from "@/pages/Freights/Detail";
import HistoryPage from "@/pages/History";
import ProposalsPage from "@/pages/Proposals";

const RegisterLayout = () => (
  <RegisterCompanyProvider>
    <Outlet />
  </RegisterCompanyProvider>
)

function WebRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/Login" element={<LoginPage />} />
      <Route path="/ForgotPassword" element={<ForgotPasswordPage />} />
      <Route path="/VerificationCode" element={<VerificationCodePage />} />
      <Route path="/NewPassword" element={<NewPasswordPage />} />

      <Route element={<RegisterLayout />}>
        <Route path="/SignUp" element={<SingUpBasicPage />} />
        <Route path="/SignUpAddress" element={<SingUpAddressPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<SideLayout />}>
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Perfil" element={<PerfilPage />} />
          <Route path="/Freights/new" element={<FreightNewPage />} />
          <Route path="/Freights/:id" element={<FreightDetailPage />} />
          <Route path="/Freights" element={<FreightsPage />} />
          <Route path="/History" element={<HistoryPage />} />
          <Route path="/Proposals" element={<ProposalsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default WebRoutes;
