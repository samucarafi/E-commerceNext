type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

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
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/$/, "");
}

function layout(title: string, content: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;padding:40px 16px;">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:32px;">
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

export async function sendOrderCreatedEmail(order: {
  orderId: string;
  customer: { name: string; email: string };
  total: number;
}) {
  return sendEmail({
    to: order.customer.email,
    subject: `Pedido ${order.orderId} recebido - Royal Parfums`,
    html: layout(
      "Pedido recebido",
      `<p>Olá, <strong>${order.customer.name}</strong>!</p>
       <p style="color:#555;line-height:1.6;">Recebemos seu pedido <strong>#${order.orderId}</strong>.</p>
       <p style="font-size:18px;"><strong>Total: R$ ${order.total.toFixed(2).replace(".", ",")}</strong></p>
       <p style="color:#777;">O pagamento ainda está pendente. Assim que o PIX for aprovado, enviaremos uma nova atualização.</p>
       <p><a href="${getSiteUrl()}/orders" style="color:#5b2333;font-weight:bold;">Acompanhar meus pedidos</a></p>`,
    ),
  });
}

export async function sendPaymentApprovedEmail(order: {
  orderId: string;
  customer: { name: string; email: string };
  total: number;
}) {
  return sendEmail({
    to: order.customer.email,
    subject: `Pagamento aprovado - Pedido ${order.orderId}`,
    html: layout(
      "Pagamento aprovado",
      `<p>Olá, <strong>${order.customer.name}</strong>!</p>
       <p style="color:#555;line-height:1.6;">Seu pagamento do pedido <strong>#${order.orderId}</strong> foi aprovado.</p>
       <p style="font-size:18px;"><strong>Total pago: R$ ${order.total.toFixed(2).replace(".", ",")}</strong></p>
       <p>Seu pedido agora pode seguir para preparação.</p>`,
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
      `<p>Olá, <strong>${order.customer.name}</strong>!</p>
       <p style="color:#555;line-height:1.6;">O status do pedido <strong>#${order.orderId}</strong> foi atualizado.</p>
       <p style="font-size:20px;"><strong>${labels[order.status]}</strong></p>
       <p><a href="${getSiteUrl()}/orders/${order.orderId}" style="color:#5b2333;font-weight:bold;">Ver pedido</a></p>`,
    ),
  });
}
