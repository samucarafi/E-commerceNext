import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";

type OrderItemLean = {
  _id?: unknown;
  productId?: unknown;
  title?: string;
  quantity?: number;
  unit_price?: number;
  type?: "product" | "discount" | "shipping";
};

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const orders = await Order.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select(
      "orderId customer items totals payment.method payment.status payment.pix deliveryStatus createdAt updatedAt",
    )
    .lean();

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      _id: String(order._id),
      userId: String(order.userId),
      createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
      updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
      items: (order.items ?? []).map((item: OrderItemLean) => ({
        ...item,
        _id: item._id ? String(item._id) : undefined,
        productId: item.productId ? String(item.productId) : undefined,
      })),
    })),
  });
}
