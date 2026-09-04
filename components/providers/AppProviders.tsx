"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <CheckoutProvider>
          {children}
          <CartDrawer />
        </CheckoutProvider>
      </CartProvider>
    </AuthProvider>
  );
}
