import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await connectMongoDB();

  const orders = await Order.find({})
    .select("orderId customer totals payment deliveryStatus createdAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <section>
      <h1 className="font-serif text-4xl">Pedidos</h1>
      <p className="mt-2 text-sm text-gray-500">
        Últimos pedidos registrados.
      </p>

      <div className="mt-6 grid gap-3">
        {orders.map((order) => (
          <article
            key={String(order._id)}
            className="rounded-2xl border border-[#e8ddd0] bg-white p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#5b2333]">
                  #{order.orderId}
                </p>
                <p className="mt-1 text-sm">{order.customer?.name}</p>
                <p className="text-xs text-gray-500">{order.customer?.email}</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="font-semibold">
                  R$ {Number(order.totals?.total ?? 0).toFixed(2).replace(".", ",")}
                </p>
                <p className="text-xs text-gray-500">
                  Pagamento: {order.payment?.status}
                </p>
                <p className="text-xs text-gray-500">
                  Entrega: {order.deliveryStatus}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
