import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await connectMongoDB();

  const orders = await Order.find({})
    .select("orderId customer totals payment deliveryStatus createdAt updatedAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const serialized = orders.map((order) => ({
    orderId: order.orderId,
    customer: {
      name: order.customer?.name ?? "",
      email: order.customer?.email ?? "",
    },
    total: Number(order.totals?.total ?? 0),
    paymentStatus: order.payment?.status ?? "pending",
    deliveryStatus: order.deliveryStatus ?? "processing",
    createdAt: new Date(order.createdAt).toISOString(),
  }));

  return <AdminOrdersClient orders={serialized} />;
}
