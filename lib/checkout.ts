import { v4 as uuidv4 } from "uuid";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import ShippingConfig from "@/models/ShippingConfig";
import { hashCpf } from "@/lib/cpf";
import type { ShippingCarrier, ShippingQuote } from "@/lib/shipping/types";

type CheckoutInput = {
  items: Array<{ productId: string; quantity: number; type?: string }>;
  customer: { name: string; email: string; cpf: string };
  shippingAddress: { cep: string; street: string; number: string; neighborhood: string; city: string; state: string; complement?: string };
  coupon?: { code?: string; type?: string; value?: number } | string | null;
  shipping?: number;
  shippingQuoteId?: string;
};

type AffiliateResult = {
  userId: unknown; couponCode: string; discountGiven: number;
  commissionPercentage: number; commissionValue: number; status: string;
};

type CouponMeta = {
  code: string | null; type: string | null; value: number; applied: boolean; cpfHash: string | null;
};

function cleanState(state: string) { return state.trim().toUpperCase(); }

function normalizeCoupon(input: CheckoutInput["coupon"]) {
  if (!input) return null;
  if (typeof input === "string") { const code = input.trim().toUpperCase(); return code ? { code } : null; }
  const code = input.code?.trim().toUpperCase();
  return code ? { ...input, code } : null;
}

async function processCoupon(
  couponInput: CheckoutInput["coupon"],
  userId: string,
  cpfHash: string,
  itemsTotal: number,
  originalShipping: number,
) {
  const coupon = normalizeCoupon(couponInput);
  const itemsDiscount = 0;
  const shippingDiscount = 0;
  const finalShipping = originalShipping;
  let affiliate: AffiliateResult | null = null;
  let couponMeta: CouponMeta = { code: null, type: null, value: 0, applied: false, cpfHash: null };

  if (!coupon?.code) return { itemsDiscount, shippingDiscount, finalShipping, affiliate, couponMeta };

  if (coupon.code === "PRIMEIRACOMPRA") {
    const used = await Order.findOne({ "coupon.code": "PRIMEIRACOMPRA", "coupon.cpfHash": cpfHash, "payment.status": "approved" }).lean();
    if (used) throw new Error("O cupom PRIMEIRACOMPRA já foi utilizado com este CPF.");
    const percentage = 10;
    const discount = Number(((itemsTotal * percentage) / 100).toFixed(2));
    couponMeta = { code: coupon.code, type: "percentage", value: percentage, applied: true, cpfHash };
    return { itemsDiscount: discount, shippingDiscount, finalShipping, affiliate, couponMeta };
  }

  const affiliateUser = await User.findOne({ "affiliate.couponCode": coupon.code });
  if (!affiliateUser) throw new Error("Cupom inválido.");
  if (affiliateUser._id.equals(userId)) throw new Error("Você não pode usar seu próprio cupom.");

  const percentage = Number(affiliateUser.affiliate?.discountPercentage || 0);
  const discount = Number(((itemsTotal * percentage) / 100).toFixed(2));
  affiliate = {
    userId: affiliateUser._id, couponCode: coupon.code, discountGiven: discount,
    commissionPercentage: Number(affiliateUser.affiliate?.commissionPercentage || 0),
    commissionValue: Number(((itemsTotal * Number(affiliateUser.affiliate?.commissionPercentage || 0)) / 100).toFixed(2)),
    status: "pending",
  };
  couponMeta = { code: coupon.code, type: "affiliate", value: discount, applied: true, cpfHash: null };
  return { itemsDiscount: discount, shippingDiscount, finalShipping, affiliate, couponMeta };
}

export async function createPendingOrder(input: CheckoutInput, userId: string) {
  if (!input.items?.length) throw new Error("Carrinho vazio.");
  const user = await User.findById(userId);
  if (!user) throw new Error("Usuário não encontrado.");
  const cpf = input.customer?.cpf?.replace(/\D/g, "");
  if (!cpf || cpf.length !== 11) throw new Error("CPF inválido.");

  const address = input.shippingAddress;
  if (!address?.cep || !address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
    throw new Error("Endereço de entrega incompleto.");
  }

  const validatedItems: Array<{ productId: unknown; title: string; quantity: number; unit_price: number; type: "product" }> = [];

  for (const item of input.items) {
    if (item.type && item.type !== "product") continue;
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Quantidade de produto inválida.");
    const product = await Product.findById(item.productId);
    if (!product) throw new Error("Produto não encontrado.");
    if (product.stock < quantity) throw new Error(`Estoque insuficiente: ${product.name}`);
    validatedItems.push({ productId: product._id, title: product.name, quantity, unit_price: Number(product.price), type: "product" });
  }

  if (!validatedItems.length) throw new Error("Nenhum produto válido no carrinho.");

  const itemsTotal = Number(validatedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0).toFixed(2));

  const config = await ShippingConfig.findOne().sort({ createdAt: -1 }).lean() as {
    shippingByState?: Map<string, number> | Record<string, number>; freeShippingMinValue?: number;
  } | null;

  const state = cleanState(address.state);
  const shippingByState = config?.shippingByState;
  let configuredShipping = 0;

  if (shippingByState instanceof Map) configuredShipping = Number(shippingByState.get(state) ?? 0);
  else if (shippingByState && typeof shippingByState === "object") configuredShipping = Number(shippingByState[state] ?? 0);

  const freeShippingMinValue = Number(config?.freeShippingMinValue ?? 0);
  const originalShipping = freeShippingMinValue > 0 && itemsTotal >= freeShippingMinValue
    ? 0
    : configuredShipping;

  const shippingQuote: ShippingQuote = {
    id: "fixed-state",
    carrier: "fixed",
    service: "STANDARD",
    label: "Entrega padrão",
    price: Number(originalShipping.toFixed(2)),
    deadline: null,
    currency: "BRL",
  };

  const couponResult = await processCoupon(input.coupon, userId, hashCpf(cpf), itemsTotal, originalShipping);
  const safeItemsDiscount = Math.min(Math.max(couponResult.itemsDiscount, 0), itemsTotal);
  const total = Number((itemsTotal + couponResult.finalShipping - safeItemsDiscount).toFixed(2));
  const orderId = uuidv4();

  await Order.create({
    orderId, userId,
    customer: { name: input.customer.name.trim(), email: input.customer.email.trim().toLowerCase() },
    items: validatedItems, coupon: couponResult.couponMeta, affiliate: couponResult.affiliate,
    totals: {
      items: itemsTotal, subtotal: itemsTotal, discount: safeItemsDiscount,
      originalShipping: Number(originalShipping.toFixed(2)),
      shippingDiscount: Number(couponResult.shippingDiscount.toFixed(2)),
      shipping: Number(couponResult.finalShipping.toFixed(2)), total,
    },
    shipping: {
      carrier: shippingQuote.carrier,
      service: shippingQuote.service,
      quoteId: shippingQuote.id,
      deadline: shippingQuote.deadline,
    },
    shippingAddress: { ...address, state },
    payment: { method: "mercadopago", status: "pending" },
    deliveryStatus: "pending",
  });

  if (!user.cpfHash) user.cpfHash = hashCpf(cpf);
  const alreadySavedAddress = user.addresses?.some((saved: { cep: string; number: string }) => saved.cep === address.cep && saved.number === address.number);
  if (!alreadySavedAddress) user.addresses.push({ ...address, state, complement: address.complement || "" });
  await user.save();

  return {
    orderId,
    customer: { name: input.customer.name.trim(), email: input.customer.email.trim().toLowerCase() },
    total,
    totals: {
      subtotal: itemsTotal,
      discount: safeItemsDiscount,
      shipping: Number(couponResult.finalShipping.toFixed(2)),
      total,
    },
  };
}

