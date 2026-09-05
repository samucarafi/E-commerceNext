"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  verified?: boolean;
  phone?: string;
  cpf?: string;
  addresses?: Address[];
};

export type Address = {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
};

type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthResult>;
  loginWithGoogle: (accessToken: string) => Promise<AuthResult>;
  register: (data: Record<string, unknown>) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Não foi possível concluir a operação.",
    );
  }

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await apiRequest<{ user: User }>("/auth/profile");
      setUser(data.user);
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data = await apiRequest<{ user: User; token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro no login.",
      };
    }
  };

  const loginWithGoogle = async (accessToken: string) => {
    try {
      if (!accessToken) {
        return { success: false, error: "Token do Google não informado." };
      }

      const data = await apiRequest<{ user: User; token: string }>(
        "/auth/google",
        {
          method: "POST",
          body: JSON.stringify({ accessToken }),
        },
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro no login com Google.",
      };
    }
  };

  const register = async (registerData: Record<string, unknown>) => {
    try {
      const data = await apiRequest<{ message?: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar conta.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
