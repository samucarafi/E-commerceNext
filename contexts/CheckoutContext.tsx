"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { calculateShipping, getShippingConfig } from "@/services/shipping.service";
import { createCheckout, validateCoupon } from "@/services/checkout.service";
import { findAddressByCep } from "@/services/cep.service";
import type { Address } from "@/contexts/AuthContext";
import type { AppliedCoupon, CheckoutResponse, ShippingConfig } from "@/types/checkout";

type CheckoutContextValue = {
  address: Address;
  cpf: string;
  shipping: number;
  shippingLoading: boolean;
  shippingConfig: ShippingConfig | null;
  coupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string;
  checkoutLoading: boolean;
  checkoutError: string;
  setAddress: (value: Address) => void;
  setCpf: (value: string) => void;
  lookupCep: () => Promise<void>;
  calculateCurrentShipping: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getDiscount: () => number;
  getTotal: () => number;
  submitCheckout: () => Promise<CheckoutResponse>;
};

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

const initialAddress: Address = {
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  complement: "",
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [address, setAddress] = useState<Address>(
    user?.addresses?.[0] ?? initialAddress,
  );
  const [cpf, setCpf] = useState("");
  const [shipping, setShipping] = useState(0);
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (user?.addresses?.[0] && !address.cep) {
      setAddress(user.addresses[0]);
    }
  }, [user, address.cep]);

  const lookupCep = async () => {
    const data = await findAddressByCep(address.cep);
    setAddress((current) => ({ ...current, ...data }));
  };

  const calculateCurrentShipping = async () => {
    setShippingLoading(true);
    try {
      const config = shippingConfig ?? (await getShippingConfig());
      setShippingConfig(config);
      setShipping(calculateShipping(config, address.state, getTotalPrice()));
    } finally {
      setShippingLoading(false);
    }
  };

  const applyCoupon = async (code: string) => {
    setCouponLoading(true);
    setCouponError("");

    try {
      const result = await validateCoupon(code.trim().toUpperCase(), cpf);

      setCoupon({
        code: result.code,
        type: result.type,
        value: Number(result.value),
        discount: Number(result.discount ?? 0),
      });

      // O backend recalcula o desconto novamente no checkout.
      // Aqui usamos a resposta apenas para feedback/estimativa visual.
      return true;
    } catch (error) {
      setCoupon(null);
      setCouponError(
        error instanceof Error ? error.message : "Cupom inválido.",
      );
      return false;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError("");
  };

  const getDiscount = () => {
    if (!coupon) return 0;

    const subtotal = getTotalPrice();

    if (coupon.type === "percentage") {
      return Number(((subtotal * coupon.value) / 100).toFixed(2));
    }

    if (coupon.type === "fixed") {
      return Math.min(coupon.value, subtotal);
    }

    if (coupon.type === "shipping") {
      return Math.min(coupon.value, shipping);
    }

    return coupon.discount;
  };

  const getTotal = () => {
    const discount = getDiscount();

    if (coupon?.type === "shipping") {
      return Math.max(
        0,
        Number((getTotalPrice() + Math.max(0, shipping - discount)).toFixed(2)),
      );
    }

    return Math.max(
      0,
      Number((getTotalPrice() + shipping - discount).toFixed(2)),
    );
  };

  const submitCheckout = async () => {
    if (!user) throw new Error("Faça login para finalizar a compra.");
    if (!cartItems.length) throw new Error("Sua sacola está vazia.");
    if (!address.cep || !address.number || !address.street) {
      throw new Error("Complete o endereço de entrega.");
    }
    if (!cpf || cpf.replace(/\D/g, "").length !== 11) {
      throw new Error("Informe um CPF válido.");
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const response = await createCheckout({
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          type: "product",
        })),
        customer: {
          name: user.name,
          email: user.email,
          cpf,
        },
        shippingAddress: address,
        shipping,
        coupon: coupon
          ? {
              code: coupon.code,
              type: coupon.type,
              value: coupon.value,
            }
          : undefined,
      });

      clearCart();
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao finalizar pedido.";
      setCheckoutError(message);
      throw error;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      address,
      cpf,
      shipping,
      shippingLoading,
      shippingConfig,
      coupon,
      couponLoading,
      couponError,
      checkoutLoading,
      checkoutError,
      setAddress,
      setCpf,
      lookupCep,
      calculateCurrentShipping,
      applyCoupon,
      removeCoupon,
      getDiscount,
      getTotal,
      submitCheckout,
    }),
    [
      address,
      cpf,
      shipping,
      shippingLoading,
      shippingConfig,
      coupon,
      couponLoading,
      couponError,
      checkoutLoading,
      checkoutError,
      user,
      cartItems,
    ],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error("useCheckout deve ser usado dentro de CheckoutProvider.");
  return context;
}
