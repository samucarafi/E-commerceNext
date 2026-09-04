import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta | Royal Parfums",
  description: "Crie sua conta na Royal Parfums.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <RegisterForm />
    </main>
  );
}
