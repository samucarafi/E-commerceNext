import { v4 as uuidv4 } from "uuid";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import ShippingConfig from "@/models/ShippingConfig";
import { hashCpf } from "@/lib/cpf";

type CheckoutInput = {
  items: Array<{ productId: string; quantity: number; type?: string }>;
  customer: { name: string; email: string; cpf: string };
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  };
  coupon?: { code?: string; type?: string; value?: number } | string | null;
};

function cleanState(state: string) {
  return state.trim().toUpperCase();
}

function normalizeCoupon(input: CheckoutInput["coupon"]) {
  if (!input) return null;
  if (typeof input === "string") {
    const code = input.trim().toUpperCase();
    return code ? { code } : null;
  }
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

  let itemsDiscount = 0;
  let shippingDiscount = 0;
  let finalShipping = originalShipping;
  let affiliate: any = null;
  let couponMeta: any = {
    code: null,
    type: null,
    value: 0,
    applied: false,
    cpfHash: null,
  };

  if (!coupon?.code) {
    return { itemsDiscount, shippingDiscount, finalShipping, affiliate, couponMeta };
  }

  if (coupon.code === "PRIMEIRACOMPRA") {
    const used = await Order.findOne({
      "coupon.code": "PRIMEIRACOMPRA",
      "coupon.cpfHash": cpfHash,
      "payment.status": "approved",
    }).lean();

    if (used) {
      throw new Error("O cupom PRIMEIRACOMPRA já foi utilizado com este CPF.");
    }

    const percentage = 10;
    itemsDiscount = Number(((itemsTotal * percentage) / 100).toFixed(2));

    couponMeta = {
      code: coupon.code,
      type: "percentage",
      value: percentage,
      applied: true,
      cpfHash,
    };

    return { itemsDiscount, shippingDiscount, finalShipping, affiliate, couponMeta };
  }

  const affiliateUser = await User.findOne({
    "affiliate.couponCode": coupon.code,
  });

  if (!affiliateUser) {
    throw new Error("Cupom inválido.");
  }

  if (affiliateUser._id.equals(userId)) {
    throw new Error("Você não pode usar seu próprio cupom.");
  }

  const percentage = Number(affiliateUser.affiliate?.discountPercentage || 0);
  itemsDiscount = Number(((itemsTotal * percentage) / 100).toFixed(2));

  affiliate = {
    userId: affiliateUser._id,
    couponCode: coupon.code,
    discountGiven: itemsDiscount,
    commissionPercentage: Number(
      affiliateUser.affiliate?.commissionPercentage || 0,
    ),
    commissionValue: Number(
      (
        (itemsTotal *
          Number(affiliateUser.affiliate?.commissionPercentage || 0)) /
        100
      ).toFixed(2),
    ),
    status: "pending",
  };

  couponMeta = {
    code: coupon.code,
    type: "affiliate",
    value: itemsDiscount,
    applied: true,
    cpfHash: null,
  };

  return { itemsDiscount, shippingDiscount, finalShipping, affiliate, couponMeta };
}

export async function createPendingOrder(input: CheckoutInput, userId: string) {
  if (!input.items?.length) throw new Error("Carrinho vazio.");

  const user = await User.findById(userId);
  if (!user) throw new Error("Usuário não encontrado.");

  const cpf = input.customer?.cpf?.replace(/\D/g, "");
  if (!cpf || cpf.length !== 11) throw new Error("CPF inválido.");

  const address = input.shippingAddress;
  if (
    !address?.cep ||
    !address.street ||
    !address.number ||
    !address.neighborhood ||
    !address.city ||
    !address.state
  ) {
    throw new Error("Endereço de entrega incompleto.");
  }

  const validatedItems = [];

  for (const item of input.items) {
    if (item.type && item.type !== "product") continue;

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Quantidade de produto inválida.");
    }

    const product = await Product.findById(item.productId);
    if (!product) throw new Error("Produto não encontrado.");

    if (product.stock < quantity) {
      throw new Error(`Estoque insuficiente: ${product.name}`);
    }

    validatedItems.push({
      productId: product._id,
      title: product.name,
      quantity,
      unit_price: Number(product.price),
      type: "product" as const,
    });
  }

  if (!validatedItems.length) throw new Error("Nenhum produto válido no carrinho.");

  const itemsTotal = Number(
    validatedItems
      .reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
      .toFixed(2),
  );

  const config = await ShippingConfig.findOne().sort({ createdAt: -1 }).lean();
  const state = cleanState(address.state);

  const configuredShipping = Number(
    config?.shippingByState?.get?.(state) ??
      (config?.shippingByState as any)?.[state] ??
      0,
  );

  const originalShipping =
    Number(config?.freeShippingMinValue || 0) > 0 &&
    itemsTotal >= Number(config?.freeShippingMinValue || 0)
      ? 0
      : configuredShipping;

  const cpfHash = hashCpf(cpf);

  const couponResult = await processCoupon(
    input.coupon,
    userId,
    cpfHash,
    itemsTotal,
    originalShipping,
  );

  const safeItemsDiscount = Math.min(
    Math.max(couponResult.itemsDiscount, 0),
    itemsTotal,
  );

  const total = Number(
    (
      itemsTotal +
      couponResult.finalShipping -
      safeItemsDiscount
    ).toFixed(2),
  );

  const orderId = uuidv4();

  await Order.create({
    orderId,
    userId,
    customer: {
      name: input.customer.name.trim(),
      email: input.customer.email.trim().toLowerCase(),
    },
    items: validatedItems,
    coupon: couponResult.couponMeta,
    affiliate: couponResult.affiliate,
    totals: {
      items: itemsTotal,
      subtotal: itemsTotal,
      discount: safeItemsDiscount,
      originalShipping: Number(originalShipping.toFixed(2)),
      shippingDiscount: Number(couponResult.shippingDiscount.toFixed(2)),
      shipping: Number(couponResult.finalShipping.toFixed(2)),
      total,
    },
    shippingAddress: {
      ...address,
      state,
    },
    payment: {
      method: "mercadopago",
      status: "pending",
    },
    deliveryStatus: "processing",
  });

  if (!user.cpfHash) user.cpfHash = cpfHash;

  const alreadySavedAddress = user.addresses?.some(
    (saved) =>
      saved.cep === address.cep &&
      saved.number === address.number,
  );

  if (!alreadySavedAddress) {
    user.addresses.push({
      cep: address.cep,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state,
      complement: address.complement || "",
    });
  }

  await user.save();

  return {
    orderId,
    totals: {
      subtotal: itemsTotal,
      discount: safeItemsDiscount,
      shipping: Number(couponResult.finalShipping.toFixed(2)),
      total,
    },
  };
}
