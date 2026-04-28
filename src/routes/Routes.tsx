import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";

import SingUpPage from "@/pages/SingUp";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";
import PerfilPage from "@/pages/Perfil";

function PrivateHomePage() {
  return <PrivateRoute><HomePage /></PrivateRoute>;
}

function PrivatePerfilPage() {
  return <PrivateRoute><PerfilPage /></PrivateRoute>;
}

function WebRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/SignUp" element={<SingUpPage />} />
        <Route path="/Home" element={<PrivateHomePage />} />
        <Route path="/Perfil" element={<PrivatePerfilPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default WebRoutes;