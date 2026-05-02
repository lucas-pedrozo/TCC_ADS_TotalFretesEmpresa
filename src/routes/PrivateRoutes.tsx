import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { JSX } from "react";

interface Props {
    children: JSX.Element;
}

const PrivateRoute = ({ children }: Props) => {
    const { isAuthenticated, accessLevel } = useAuth();
    
    const hasAccess = isAuthenticated && (accessLevel === "COMPANY" || accessLevel === "ADMIN");

    return hasAccess ? children : <Navigate to="*" replace />;
};

export default PrivateRoute;