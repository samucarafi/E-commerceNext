import { NextRequest, NextResponse } from "next/server";
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

const PAYMENT_STATUSES = ["pending", "approved", "rejected", "cancelled", "expired"];
const DELIVERY_STATUSES = ["pending", "processing", "sent", "delivered"];
const PAGE_SIZES = [10, 20, 50];

function validDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const paymentStatus = params.get("paymentStatus") ?? "";
  const deliveryStatus = params.get("deliveryStatus") ?? "";
  const from = validDate(params.get("from"));
  const to = validDate(params.get("to"));
  const requestedPage = Number(params.get("page") ?? 1);
  const requestedPageSize = Number(params.get("pageSize") ?? 10);
  const pageSize = PAGE_SIZES.includes(requestedPageSize) ? requestedPageSize : 10;
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;

  const filter: Record<string, unknown> = { userId: user._id };
  if (PAYMENT_STATUSES.includes(paymentStatus)) filter["payment.status"] = paymentStatus;
  if (DELIVERY_STATUSES.includes(deliveryStatus)) filter.deliveryStatus = deliveryStatus;

  if (from || to) {
    const createdAt: { $gte?: Date; $lt?: Date } = {};
    if (from) createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) {
      const end = new Date(`${to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      createdAt.$lt = end;
    }
    filter.createdAt = createdAt;
  }

  const total = await Order.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .select("orderId customer items totals payment.method payment.status payment.pix deliveryStatus createdAt updatedAt")
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
    pagination: { page: currentPage, pageSize, total, totalPages },
  });
}
