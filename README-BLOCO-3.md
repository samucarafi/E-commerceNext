# Royal Parfums — Bloco 3

Este bloco transforma o checkout de placeholder em um fluxo funcional de:

- autenticação compatível com o backend atual;
- endereço de entrega;
- consulta automática de CEP via ViaCEP;
- cálculo de frete por estado;
- regra de frete grátis configurada no backend;
- CPF;
- validação de cupom;
- resumo de subtotal, frete, desconto e total;
- criação do checkout no endpoint real `/checkout`;
- preparação da rota de pagamento.

## Endpoints reais utilizados

O backend atual expõe:

- `GET /shipping-config`
- `POST /coupons/validate`
- `POST /checkout`

O checkout exige autenticação Bearer e recebe produtos, cliente, CPF, endereço, frete e cupom.

## Importante

O backend continua sendo a autoridade para preço, estoque, CPF e desconto. A aplicação não deve confiar no valor calculado no navegador.

O próximo bloco deve implementar:

1. PIX/Mercado Pago;
2. QR Code;
3. cópia do código PIX;
4. acompanhamento do status;
5. página de pedido;
6. webhook/status do pagamento.

Também deve ser feita a migração definitiva do token para cookie HttpOnly quando o backend estiver preparado para isso.
