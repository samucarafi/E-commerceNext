import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";

type RouteContext = { params: Promise<{ id: string }> };
type OrderItemLean = { _id?: unknown; productId?: unknown; title?: string; quantity?: number; unit_price?: number; type?: "product" | "discount" | "shipping" };
type OrderLean = { _id: unknown; userId: unknown; createdAt?: Date; updatedAt?: Date; items?: OrderItemLean[]; [key: string]: unknown };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await context.params;
  const order = (await Order.findOne({ orderId: id, userId: user._id }).lean()) as unknown as OrderLean | null;
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  return NextResponse.json({
    order: {
      ...order,
      _id: String(order._id),
      userId: String(order.userId),
      createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
      updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
      items: (order.items ?? []).map((item) => ({ ...item, _id: item._id ? String(item._id) : undefined, productId: item.productId ? String(item.productId) : undefined })),
    },
  });
}
