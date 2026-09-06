import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";
import { createMercadoPagoPixPayment, getMercadoPagoPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const body = (await request.json()) as { orderId?: string };
    if (!body.orderId) return NextResponse.json({ error: "orderId é obrigatório." }, { status: 400 });

    await connectMongoDB();
    const order = await Order.findOne({ orderId: body.orderId, userId: user._id });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    if (order.payment?.status === "approved") {
      return NextResponse.json({ error: "Este pedido já foi pago." }, { status: 409 });
    }
    if (order.payment?.status === "cancelled" && !order.payment?.mpPaymentId) {
      // Permite reabrir o pagamento apenas criando um novo PIX abaixo.
    }

    if (order.payment?.mpPaymentId) {
      const current = await getMercadoPagoPayment(order.payment.mpPaymentId);
      const currentStatus = current.status;
      const expiration = current.date_of_expiration ? new Date(current.date_of_expiration) : undefined;
      const isExpiredByDate = expiration ? expiration.getTime() <= Date.now() : false;

      if (currentStatus === "approved") {
        order.payment.status = "approved";
        await order.save();
        return NextResponse.json({ error: "Este pedido já foi pago." }, { status: 409 });
      }

      if ((currentStatus === "pending" || currentStatus === "in_process") && !isExpiredByDate) {
        order.payment.status = "pending";
        if (expiration) order.payment.dateOfExpiration = expiration;
        await order.save();
        return NextResponse.json({
          orderId: order.orderId,
          paymentId: order.payment.mpPaymentId,
          status: order.payment.status,
          pix: order.payment.pix,
          dateOfExpiration: order.payment.dateOfExpiration,
          reused: true,
        });
      }

      if (currentStatus === "rejected" || currentStatus === "cancelled" || isExpiredByDate || currentStatus === "expired") {
        order.payment.status = isExpiredByDate || currentStatus === "expired" ? "expired" : "cancelled";
      }
    }

    const firstName = order.customer.name.trim().split(/\s+/)[0] || "Cliente";
    const payment = await createMercadoPagoPixPayment({
      orderId: order.orderId,
      amount: Number(order.totals.total),
      payer: { email: order.customer.email, firstName },
    });

    const data = payment.point_of_interaction?.transaction_data;
    if (!data?.qr_code) throw new Error("Mercado Pago não retornou o QR Code PIX.");

    order.payment.method = "pix";
    order.payment.status = "pending";
    order.payment.mpPaymentId = String(payment.id);
    order.payment.pix = {
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64,
      ticket_url: data.ticket_url,
    };
    order.payment.dateOfExpiration = payment.date_of_expiration
      ? new Date(payment.date_of_expiration)
      : undefined;
    await order.save();

    return NextResponse.json({
      orderId: order.orderId,
      paymentId: String(payment.id),
      status: order.payment.status,
      pix: order.payment.pix,
      dateOfExpiration: order.payment.dateOfExpiration,
      reused: false,
    });
  } catch (error: unknown) {
    console.error("Erro ao criar PIX:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao gerar pagamento PIX." }, { status: 500 });
  }
}
