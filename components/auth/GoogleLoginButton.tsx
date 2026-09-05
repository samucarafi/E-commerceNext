"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";

export default function GoogleLoginButton() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");

      if (!tokenResponse.access_token) {
        setError("O Google não retornou um token de acesso.");
        return;
      }

      const result = await loginWithGoogle(tokenResponse.access_token);

      if (!result.success) {
        setError(result.error ?? "Não foi possível entrar com Google.");
        return;
      }

      router.push("/");
      router.refresh();
    },
    onError: () => {
      setError("Não foi possível iniciar o login com Google.");
    },
  });

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => googleLogin()}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e8ddd0] bg-white px-5 py-3 font-medium text-[#2e2e2e] transition hover:border-[#c6a75e] hover:shadow-sm"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold">
          G
        </span>
        Continuar com Google
      </button>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
