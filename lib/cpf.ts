import crypto from "crypto";

const SECRET =
  process.env.CPF_SECRET ||
  "e9y0z1x2w3v4u5t6s7r8q9p0o1n2m3l4";

export function normalizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

export function hashCpf(cpf: string) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(normalizeCpf(cpf))
    .digest("hex");
}

export function maskCpf(cpf: string) {
  const digits = normalizeCpf(cpf);
  if (digits.length !== 11) return "";
  return digits.replace(/^(\d{3})\d{6}(\d{2})$/, "$1******$2");
}
