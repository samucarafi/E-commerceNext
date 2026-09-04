import type { Address } from "@/contexts/AuthContext";

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export async function findAddressByCep(cep: string): Promise<Partial<Address>> {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new Error("Informe um CEP válido.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

  if (!response.ok) throw new Error("Não foi possível consultar o CEP.");

  const data: ViaCepResponse = await response.json();

  if (data.erro) throw new Error("CEP não encontrado.");

  return {
    cep: cleanCep,
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  };
}
