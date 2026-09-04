# Bloco 6 — Checkout real + pedidos

Este bloco traz a primeira versão real do fluxo de checkout para dentro do Next.js.

## O que entrou

- `POST /api/checkout`
  - exige usuário autenticado;
  - valida produtos diretamente no MongoDB;
  - nunca confia no preço enviado pelo navegador;
  - valida quantidade e estoque;
  - calcula o frete no servidor;
  - aplica `PRIMEIRACOMPRA` e cupons de afiliado;
  - recalcula desconto e total;
  - cria o pedido como `pending`;
  - salva CPF hash e endereço no usuário quando necessário.

- `POST /api/coupons/validate`
  - mantém a regra existente do backend;
  - `PRIMEIRACOMPRA` = 10% e bloqueio por CPF após pagamento aprovado;
  - cupom de afiliado com bloqueio para o próprio dono.

- `GET /api/orders/:id`
  - permite ao próprio usuário consultar seu pedido.

## Variável nova

Adicione no `.env.local`:

```env
CPF_SECRET=uma_chave_estavel_com_pelo_menos_32_caracteres
```

Se você já possui `CPF_SECRET` no backend antigo e quer preservar CPFs já armazenados/hash existentes, use a mesma chave.

## Instalação

```bash
npm install
```

Se o seu `package.json` já tinha outras versões/dependências, prefira mesclar a alteração de `uuid` em vez de substituir o arquivo inteiro.

Depois:

```bash
npm run dev
```

## Importante

Neste bloco o Mercado Pago ainda não foi chamado.

O pedido é criado como `pending` e o estoque ainda não é baixado definitivamente. Isso evita marcar uma venda como paga antes da etapa PIX.

O próximo bloco será a integração real do Mercado Pago/Pix + atualização do status do pedido + webhook.
