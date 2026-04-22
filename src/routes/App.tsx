import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import SingUpPage from "@/pages/SingUp";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";
import { useAuth } from "@/context/AuthContext";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/Home" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/SignUp" element={<PublicRoute><SingUpPage /></PublicRoute>} />

      <Route path="/Home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;