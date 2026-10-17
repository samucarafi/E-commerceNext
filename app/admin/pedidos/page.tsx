import type { FilterQuery } from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";
type Params = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] ?? "" : v ?? "";
const paymentStatuses = ["pending", "approved", "rejected", "cancelled", "expired"];
const deliveryStatuses = ["pending", "processing", "sent", "delivered"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Params }) {
  await connectMongoDB();
  const p = await searchParams;
  const q = first(p.q).trim().slice(0, 100);
  const paymentStatus = first(p.paymentStatus);
  const deliveryStatus = first(p.deliveryStatus);
  const from = first(p.from);
  const to = first(p.to);
  const sort = first(p.sort) || "newest";
  const requestedSize = Number(first(p.pageSize)) || 10;
  const pageSize = [10, 25, 50].includes(requestedSize) ? requestedSize : 10;
  const requestedPage = Math.max(1, Number(first(p.page)) || 1);
  const filter: FilterQuery<{ orderId: string; customer: { name: string; email: string }; payment: { status: string }; deliveryStatus: string; createdAt: Date }> = {};

  if (paymentStatuses.includes(paymentStatus)) filter["payment.status"] = paymentStatus;
  if (deliveryStatuses.includes(deliveryStatus)) filter.deliveryStatus = deliveryStatus;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");
    filter.$or = [{ orderId: regex }, { "customer.name": regex }, { "customer.email": regex }];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(from) || /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    const createdAt: { $gte?: Date; $lt?: Date } = {};
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      const end = new Date(`${to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      createdAt.$lt = end;
    }
    filter.createdAt = createdAt;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 }, oldest: { createdAt: 1 },
    highest: { "totals.total": -1, createdAt: -1 }, lowest: { "totals.total": 1, createdAt: -1 },
  };
  const selectedSort = sortMap[sort] ? sort : "newest";
  const totalMatching = await Order.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const [orders, approvedCount, pendingCount, revenue] = await Promise.all([
    Order.find(filter).select("orderId customer totals payment deliveryStatus createdAt")
      .sort(sortMap[selectedSort]).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
    Order.countDocuments({ "payment.status": "approved" }),
    Order.countDocuments({ "payment.status": "pending" }),
    Order.aggregate([
      { $match: { "payment.status": "approved" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$totals.total", 0] } } } },
    ]),
  ]);

  return <AdminOrdersClient
    orders={orders.map(o => ({
      orderId: String(o.orderId),
      customer: { name: o.customer?.name ?? "", email: o.customer?.email ?? "" },
      total: Number(o.totals?.total ?? 0),
      paymentStatus: o.payment?.status ?? "pending",
      deliveryStatus: o.deliveryStatus ?? "pending",
      createdAt: new Date(o.createdAt).toISOString(),
    }))}
    filters={{ q, paymentStatus, deliveryStatus, from, to, sort: selectedSort, pageSize }}
    pagination={{ currentPage, pageSize, totalMatching, totalPages }}
    summary={{ approvedCount, pendingCount, approvedRevenue: Number(revenue[0]?.total ?? 0) }}
  />;
}
