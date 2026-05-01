import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
	id: number | null;
	token: string | null;
	accessLevel: string | null;
	isAuthenticated: boolean | null;

	login: (token: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface DecodedToken {
	id?: number | string
	id_usuario?: number | string;
	role?: string;
	accessLevel?: string;
	admin?: boolean | string | number;
	exp?: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
	try {
		const decoded = jwtDecode<DecodedToken>(token);
		return decoded;
	} catch (error) {
		console.error("Failed to decode token:", error);
		return null;
	}
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [id, setId] = useState<number | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [accessLevel, setAccessLevel] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);


	const login = async (token: string) => {
		const decoded = decodeToken(token);

		if (decoded) {
			setToken(token);
			setId(Number(decoded.id));
			setAccessLevel(decoded.role ?? decoded.accessLevel ?? null);
			setIsAuthenticated(true);
		}
	};

	const logout = async () => {
		setToken(null);
		setId(null);
		setAccessLevel(null);
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider
			value={{
				token,
				id,
				accessLevel,
				isAuthenticated,
				login,
				logout,
			}}
		>
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
