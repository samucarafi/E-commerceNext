import User from "@/models/User";

function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 10) || "ROYAL";
}

export async function generateUniqueAffiliateCoupon(name: string) {
  const base = normalizeName(name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await User.exists({ "affiliate.couponCode": code });
    if (!exists) return code;
  }

  throw new Error("Não foi possível gerar um cupom de afiliado único.");
}
