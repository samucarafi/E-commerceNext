type OrderEmailItem = {
  title?: string;
  quantity?: number;
  unit_price?: number;
};

type OrderEmailData = {
  orderId: string;
  customer: { name: string; email: string };
  items?: OrderEmailItem[];
  totals: {
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
  };
  shippingAddress?: {
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
  };
  payment?: {
    method?: string;
    status?: string;
    mpPaymentId?: string;
  };
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

const ORDER_NOTIFICATION_EMAIL = "michelfranklin2016@icloud.com";

function getFromEmail() {
  const value = process.env.RESEND_FROM_EMAIL?.trim();
  if (!value) {
    throw new Error("RESEND_FROM_EMAIL não está configurado.");
  }
  return value;
}

async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY não está configurado.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [to],
      subject,
      html,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend: ${response.status} ${detail}`);
  }

  return response.json();
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://royalparfums.com.br"
  ).replace(/\/$/, "");
}

function money(value?: number) {
  return `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function orderDetails(order: OrderEmailData) {
  const items = (order.items ?? [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.title)}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">
            ${Number(item.quantity ?? 0)}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">
            ${money(Number(item.unit_price ?? 0) * Number(item.quantity ?? 0))}
          </td>
        </tr>`,
    )
    .join("");

  const address = order.shippingAddress;

  return `
    <h3 style="color:#1c1c1c;margin:24px 0 10px;">Itens do pedido</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 0;border-bottom:1px solid #ddd;">Produto</th>
          <th style="text-align:center;padding:10px 0;border-bottom:1px solid #ddd;">Qtd.</th>
          <th style="text-align:right;padding:10px 0;border-bottom:1px solid #ddd;">Valor</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>

    <div style="margin-top:20px;line-height:1.8;">
      <p>Subtotal: <strong>${money(order.totals.subtotal)}</strong></p>
      <p>Desconto: <strong>${money(order.totals.discount)}</strong></p>
      <p>Frete: <strong>${money(order.totals.shipping)}</strong></p>
      <p style="font-size:18px;">
        Total: <strong>${money(order.totals.total)}</strong>
      </p>
    </div>

    <h3 style="color:#1c1c1c;margin:24px 0 10px;">Pagamento</h3>
    <p>Método: <strong>${escapeHtml(order.payment?.method || "Mercado Pago / PIX")}</strong></p>
    <p>Status: <strong>${escapeHtml(order.payment?.status || "pending")}</strong></p>
    ${
      order.payment?.mpPaymentId
        ? `<p>ID do pagamento: <strong>${escapeHtml(order.payment.mpPaymentId)}</strong></p>`
        : ""
    }

    ${
      address
        ? `
      <h3 style="color:#1c1c1c;margin:24px 0 10px;">Entrega</h3>
      <p style="line-height:1.7;">
        ${escapeHtml(address.street)}, ${escapeHtml(address.number)}
        ${address.complement ? ` - ${escapeHtml(address.complement)}` : ""}<br>
        ${escapeHtml(address.neighborhood)}<br>
        ${escapeHtml(address.city)} - ${escapeHtml(address.state)}<br>
        CEP: ${escapeHtml(address.cep)}
      </p>`
        : ""
    }
  `;
}

function layout(title: string, content: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;padding:40px 16px;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:4px;color:#5b2333;">ROYAL</div>
        <div style="font-size:11px;letter-spacing:3px;color:#9a7b36;">PARFUMS</div>
      </div>
      <h2 style="color:#1c1c1c;margin:0 0 18px;">${title}</h2>
      ${content}
      <hr style="margin:30px 0;border:none;border-top:1px solid #eee;">
      <p style="font-size:12px;color:#999;text-align:center;">Este é um e-mail automático da Royal Parfums.</p>
    </div>
  </div>`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${getSiteUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: "Confirme seu cadastro - Royal Parfums",
    html: layout(
      "Confirme seu e-mail",
      `<p style="color:#555;line-height:1.6;">Obrigado por se cadastrar na <strong>Royal Parfums</strong>. Confirme seu e-mail para ativar sua conta.</p>
       <p style="text-align:center;margin:28px 0;"><a href="${link}" style="display:inline-block;background:#5b2333;color:#fff;padding:14px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Confirmar e-mail</a></p>
       <p style="font-size:13px;color:#777;word-break:break-all;">${link}</p>`,
    ),
  });
}

export async function sendOrderCreatedEmail(order: OrderEmailData) {
  return sendEmail({
    to: order.customer.email,
    subject: `Pedido ${order.orderId} recebido - Royal Parfums`,
    html: layout(
      "Pedido recebido",
      `<p>Olá, <strong>${escapeHtml(order.customer.name)}</strong>!</p>
       <p style="color:#555;line-height:1.6;">Recebemos seu pedido <strong>#${escapeHtml(order.orderId)}</strong>.</p>
       ${orderDetails(order)}
       <p style="color:#777;">O pagamento ainda está pendente. Assim que o PIX for aprovado, enviaremos uma nova atualização.</p>
       <p><a href="${getSiteUrl()}/orders" style="color:#5b2333;font-weight:bold;">Acompanhar meus pedidos</a></p>`,
    ),
  });
}

export async function sendAdminOrderCreatedEmail(order: OrderEmailData) {
  return sendEmail({
    to: ORDER_NOTIFICATION_EMAIL,
    subject: `NOVO PEDIDO ${order.orderId} - Royal Parfums`,
    html: layout(
      "Novo pedido recebido",
      `<p>Um novo pedido foi realizado na Royal Parfums.</p>
       <p><strong>Pedido:</strong> #${escapeHtml(order.orderId)}</p>
       <p><strong>Cliente:</strong> ${escapeHtml(order.customer.name)}</p>
       <p><strong>E-mail:</strong> ${escapeHtml(order.customer.email)}</p>
       ${orderDetails(order)}
       <div style="margin-top:24px;padding:16px;background:#fff8e8;border-radius:8px;">
         <strong>Atenção:</strong> acompanhe o pagamento e, após a aprovação do PIX, atualize o status de envio/preparação do pedido no painel administrativo.
       </div>`,
    ),
  });
}

export async function sendPaymentApprovedEmail(order: OrderEmailData) {
  return sendEmail({
    to: order.customer.email,
    subject: `Pagamento aprovado - Pedido ${order.orderId}`,
    html: layout(
      "Pagamento aprovado",
      `<p>Olá, <strong>${escapeHtml(order.customer.name)}</strong>!</p>
       <p style="color:#555;line-height:1.6;">Seu pagamento do pedido <strong>#${escapeHtml(order.orderId)}</strong> foi aprovado.</p>
       ${orderDetails(order)}
       <p>Seu pedido agora pode seguir para preparação.</p>`,
    ),
  });
}

export async function sendAdminPaymentApprovedEmail(order: OrderEmailData) {
  return sendEmail({
    to: ORDER_NOTIFICATION_EMAIL,
    subject: `PIX APROVADO - Pedido ${order.orderId} - Royal Parfums`,
    html: layout(
      "Pagamento PIX aprovado",
      `<p>O pagamento PIX do pedido <strong>#${escapeHtml(order.orderId)}</strong> foi concluído pelo cliente.</p>
       <p><strong>Cliente:</strong> ${escapeHtml(order.customer.name)}</p>
       <p><strong>E-mail:</strong> ${escapeHtml(order.customer.email)}</p>
       ${orderDetails(order)}
       <div style="margin-top:24px;padding:16px;background:#eef8ee;border-radius:8px;">
         <strong>Ação necessária:</strong> o pagamento foi aprovado. Atualize o status de envio/preparação do pedido no painel administrativo.
       </div>`,
    ),
  });
}

export async function sendOrderStatusEmail(order: {
  orderId: string;
  customer: { name: string; email: string };
  status: "processing" | "sent" | "delivered";
}) {
  const labels = {
    processing: "Em preparação",
    sent: "Enviado",
    delivered: "Entregue",
  };

  return sendEmail({
    to: order.customer.email,
    subject: `Atualização do pedido ${order.orderId} - Royal Parfums`,
    html: layout(
      "Atualização do pedido",
      `<p>Olá, <strong>${escapeHtml(order.customer.name)}</strong>!</p>
       <p style="color:#555;line-height:1.6;">O status do pedido <strong>#${escapeHtml(order.orderId)}</strong> foi atualizado.</p>
       <p style="font-size:20px;"><strong>${labels[order.status]}</strong></p>
       <p><a href="${getSiteUrl()}/orders/${order.orderId}" style="color:#5b2333;font-weight:bold;">Ver pedido</a></p>`,
    ),
  });
}
