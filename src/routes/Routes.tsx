import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";

import SingUpPage from "@/pages/SingUp";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";
import PerfilPage from "@/pages/Perfil";
import { SideLayout } from "@/layout/SideLayout";

function WebRoutes() {
  return (
    <Routes>
      <Route path="/LOGIN" element={<LoginPage />} />
      <Route path="/SignUp" element={<SingUpPage />} />

      <Route element={<SideLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/Perfil" element={<PerfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default WebRoutes;
