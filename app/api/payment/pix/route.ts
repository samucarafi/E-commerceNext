import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth-server";
import Order from "@/models/Order";
import {
  createMercadoPagoPixPayment,
  getMercadoPagoPayment,
} from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const orderId =
      body && typeof body.orderId === "string" ? body.orderId.trim() : "";

    if (!orderId || orderId.length > 100) {
      return NextResponse.json(
        { error: "orderId inválido." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // A consulta sempre limita o pedido ao usuário autenticado.
    const order = await Order.findOne({
      orderId,
      userId: user._id,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    if (order.payment?.status === "approved") {
      return NextResponse.json(
        { error: "Este pedido já foi pago." },
        { status: 409 },
      );
    }

    if (order.payment?.mpPaymentId) {
      const current = await getMercadoPagoPayment(order.payment.mpPaymentId);
      const expiration = current.date_of_expiration
        ? new Date(current.date_of_expiration)
        : undefined;
      const isExpiredByDate = expiration
        ? expiration.getTime() <= Date.now()
        : false;

      if (current.status === "approved") {
        order.payment.status = "approved";
        await order.save();
        return NextResponse.json(
          { error: "Este pedido já foi pago." },
          { status: 409 },
        );
      }

      if (
        (current.status === "pending" || current.status === "in_process") &&
        !isExpiredByDate
      ) {
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

      if (
        current.status === "rejected" ||
        current.status === "cancelled" ||
        isExpiredByDate ||
        current.status === "expired"
      ) {
        order.payment.status =
          isExpiredByDate || current.status === "expired"
            ? "expired"
            : "cancelled";
      }
    }

    // O valor vem do pedido salvo no servidor; nunca do navegador.
    const firstName =
      order.customer.name.trim().split(/\s+/)[0] || "Cliente";

    const payment = await createMercadoPagoPixPayment({
      orderId: order.orderId,
      amount: Number(order.totals.total),
      payer: { email: order.customer.email, firstName },
    });

    const data = payment.point_of_interaction?.transaction_data;

    if (!data?.qr_code) {
      throw new Error("Mercado Pago não retornou o QR Code PIX.");
    }

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
    return NextResponse.json(
      { error: "Não foi possível gerar o pagamento PIX." },
      { status: 500 },
    );
  }
}
