import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken, getStoredAuthToken, setAuthToken } from "@/service/http";

interface AuthContextType {
    id: number | null;
    token: string | null;
    accessLevel: string | null;
    isAuthenticated: boolean | null;
    isAuthReady: boolean;

    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
    id?: number | string;
    id_usuario?: number | string;
    role?: string;
    accessLevel?: string;
    admin?: boolean | string | number;
    exp?: number;
}

/** Decodifica JWT e retorna payload se ainda não expirou; caso contrário null. */
const decodeToken = (token: string): DecodedToken | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
            return null;
        }
        return decoded;
    } catch (error) {
        console.error("Erro ao decodificar token:", error);
        return null;
    }
};

const parseAdmin = (value: unknown): boolean =>
    value === true || value === "true" || value === "1";

const resolveId = (decoded: DecodedToken): number | null => {
    const rawId = decoded.id ?? decoded.id_usuario;
    if (rawId === undefined || rawId === null) {
        return null;
    }

    const numericId = Number(rawId);
    return Number.isNaN(numericId) ? null : numericId;
};

const resolveAccessLevel = (decoded: DecodedToken): string | null => {
    if (decoded.role || decoded.accessLevel) {
        return decoded.role ?? decoded.accessLevel ?? null;
    }

    if (parseAdmin(decoded.admin)) {
        return "ADMIN";
    }

    return null;
};

/**
 * AuthContext provider hook and context.
 * @param param0 React children nodes.
 * @returns AuthProvider component.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [id, setId] = useState<number | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [accessLevel, setAccessLevel] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadStoredToken = async () => {
            try {
                const storedToken = getStoredAuthToken();
                if (!storedToken) {
                    setIsAuthenticated(false);
                    return;
                }

                const decoded = decodeToken(storedToken);
                const decodedId = decoded ? resolveId(decoded) : null;
                const decodedAccessLevel = decoded ? resolveAccessLevel(decoded) : null;

                if (!decodedId || !decodedAccessLevel) {
                    await clearAuthToken();
                    setIsAuthenticated(false);
                    return;
                }

                setToken(storedToken);
                setId(decodedId);
                setAccessLevel(decodedAccessLevel);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsAuthReady(true);
            }
        };

        loadStoredToken();
    }, []);

    const login = async (authToken: string) => {
        const decoded = decodeToken(authToken);
        const decodedId = decoded ? resolveId(decoded) : null;
        const decodedAccessLevel = decoded ? resolveAccessLevel(decoded) : null;

        if (!decodedId || !decodedAccessLevel) {
            throw new Error("Token de autenticacao invalido");
        }

        setToken(authToken);
        setId(decodedId);
        setAccessLevel(decodedAccessLevel);
        setIsAuthenticated(true);
        await setAuthToken(authToken);
    };

    const logout = async () => {
        setToken(null);
        setId(null);
        setAccessLevel(null);
        setIsAuthenticated(false);

        await clearAuthToken();
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ token, id, accessLevel, login, logout, isAuthenticated, isAuthReady }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth needs to be inside the AuthProvider");
    }
    return context;
};