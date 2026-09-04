# Bloco 4 — PIX, pedidos e padrão de API interna

## Decisão de arquitetura

A partir deste bloco, o projeto considera o backend como parte do próprio projeto Next.js.

Por isso:

- Front e backend usam a mesma aplicação.
- Localmente: `http://localhost:3001`.
- As chamadas do frontend usam `/api`.
- Não usamos `BACKEND_URL` nem outra URL de backend no `.env`.
- Segredos ficam sem `NEXT_PUBLIC_`.

## `.env.local` neste momento

Copie `.env.example` para `.env.local`.

Preencha inicialmente:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=/api
MONGODB_URI=
MP_ACCESS_TOKEN=
RESEND_API_KEY=
LOGGI_API_KEY=
```

Não preencha valores inventados. Vamos adicionando cada variável quando a funcionalidade correspondente for migrada.

### Variáveis que já podem ficar vazias

- `MONGODB_URI`: só será necessária quando ativarmos a camada de banco do Next.
- `MP_ACCESS_TOKEN`: será necessária quando a API de PIX/Mercado Pago estiver ligada.
- `RESEND_API_KEY`: será necessária quando migrarmos os e-mails.
- `LOGGI_API_KEY`: será necessária quando migrarmos o frete.

## O que este bloco prepara

- padrão `/api` para a API interna;
- correção do cálculo de cupom de frete;
- preenchimento do endereço salvo quando o usuário termina de carregar;
- tela de PIX com QR Code e Copia e Cola;
- polling do status do pagamento;
- página de pedido;
- página de pagamento do pedido.

## Importante

As telas deste bloco esperam estes endpoints internos:

- `POST /api/checkout`
- `GET /api/orders/:id`
- `GET /api/payment/status/:id`
- `POST /api/payment/pix`

Eles serão implementados na camada server do Next nos próximos passos/migração da API.

## Próximo passo

Migrar a primeira parte real do backend para `app/api`, começando por banco + autenticação e depois conectando o checkout/PIX ao Mercado Pago.

Quando chegarmos ao Mercado Pago, o webhook deverá usar uma URL pública de produção. Em desenvolvimento local, não devemos colocar uma URL pública falsa no `.env`.
