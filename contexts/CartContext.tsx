"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";

export type CartItem = Product & { quantity: number };
type CartContextValue = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getTotalWeight: () => number;
};
const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "royal-parfums-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // localStorage só existe no cliente; esta é a hidratação inicial do carrinho.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      setCartItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  const addToCart = (product: Product, quantity = 1) => {
    const stock = Math.max(0, Number(product.stock) || 0);
    if (stock === 0) return;
    setCartItems((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (!existing)
        return [
          ...current,
          {
            ...product,
            quantity: Math.min(Math.max(1, quantity), stock),
            weight: product.weight || 0.5,
          },
        ];
      return current.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: Math.min(item.quantity + Math.max(1, quantity), stock),
            }
          : item,
      );
    });
  };

  const removeFromCart = (productId: string) =>
    setCartItems((current) => current.filter((item) => item._id !== productId));
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((current) =>
      current.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.min(quantity, Number(item.stock) || quantity),
            }
          : item,
      ),
    );
  };
  const clearCart = () => setCartItems([]);
  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);
  const getTotalWeight = () =>
    cartItems.reduce(
      (total, item) => total + (item.weight || 0.5) * item.quantity,
      0,
    );

  const value = useMemo(
    () => ({
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getTotalWeight,
    }),
    [cartItems, isCartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  return context;
}
