import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { validateAuthSession, resetSessionExpiredNotification } from "@/service/authService";

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
	id?: number | string;
	id_usuario?: number | string;
	role?: string;
	accessLevel?: string;
	admin?: boolean | string | number;
	exp?: number;
}

const TOKEN_KEY = "auth_token";

export const decodeToken = (token: string): DecodedToken | null => {
	try {
		return jwtDecode<DecodedToken>(token);
	} catch (error) {
		console.error("Failed to decode token:", error);
		return null;
	}
};

function applyDecodedToken(
	decoded: DecodedToken,
	setters: {
		setToken: (value: string) => void;
		setId: (value: number | null) => void;
		setAccessLevel: (value: string | null) => void;
		setIsAuthenticated: (value: boolean) => void;
	},
	token: string,
) {
	setters.setToken(token);
	setters.setId(decoded.id != null ? Number(decoded.id) : null);
	setters.setAccessLevel(decoded.role ?? decoded.accessLevel ?? null);
	setters.setIsAuthenticated(true);
}

/** Lê a sessão direto do localStorage (fonte de verdade para guards de rota). */
export function getStoredAuthSession(): {
	token: string;
	id: number | null;
	accessLevel: string | null;
} | null {
	const stored = localStorage.getItem(TOKEN_KEY);
	if (!stored) return null;

	const decoded = decodeToken(stored);
	if (!decoded) return null;

	if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;

	return {
		token: stored,
		id: decoded.id != null ? Number(decoded.id) : null,
		accessLevel: decoded.role ?? decoded.accessLevel ?? null,
	};
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [id, setId] = useState<number | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [accessLevel, setAccessLevel] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const bootstrapGenerationRef = useRef(0);

	useEffect(() => {
		let cancelled = false;
		const generation = ++bootstrapGenerationRef.current;

		const bootstrapSession = async () => {
			const stored = localStorage.getItem(TOKEN_KEY);
			if (!stored) {
				if (!cancelled) setIsAuthenticated(false);
				return;
			}

			const decoded = decodeToken(stored);
			if (!decoded) {
				localStorage.removeItem(TOKEN_KEY);
				if (!cancelled) setIsAuthenticated(false);
				return;
			}

			const expired = decoded.exp && decoded.exp * 1000 < Date.now();
			if (expired) {
				localStorage.removeItem(TOKEN_KEY);
				if (!cancelled) setIsAuthenticated(false);
				return;
			}

			const isValid = await validateAuthSession(stored);
			if (cancelled || generation !== bootstrapGenerationRef.current) return;

			const latestStored = localStorage.getItem(TOKEN_KEY);
			if (latestStored !== stored) return;

			if (!isValid) {
				localStorage.removeItem(TOKEN_KEY);
				setIsAuthenticated(false);
				return;
			}

			applyDecodedToken(decoded, {
				setToken,
				setId,
				setAccessLevel,
				setIsAuthenticated,
			}, stored);
		};

		void bootstrapSession();

		return () => {
			cancelled = true;
		};
	}, []);

	const login = async (token: string) => {
		const decoded = decodeToken(token);
		if (!decoded) return;

		bootstrapGenerationRef.current += 1;
		resetSessionExpiredNotification();
		localStorage.setItem(TOKEN_KEY, token);
		applyDecodedToken(decoded, {
			setToken,
			setId,
			setAccessLevel,
			setIsAuthenticated,
		}, token);
	};

	const logout = async () => {
		bootstrapGenerationRef.current += 1;
		localStorage.removeItem(TOKEN_KEY);
		setToken(null);
		setId(null);
		setAccessLevel(null);
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ token, id, accessLevel, isAuthenticated, login, logout }}>
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