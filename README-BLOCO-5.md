# Bloco 5 — Backend dentro do Next.js

Este bloco inicia a migração real do backend Express para a própria aplicação Next.js.

## O que entrou

- conexão MongoDB com cache para desenvolvimento;
- models Mongoose de usuário, produto e configuração de frete;
- `POST /api/auth/register`;
- `POST /api/auth/login`;
- `GET /api/auth/profile`;
- `GET /api/products`;
- `GET /api/products/:id`;
- `GET /api/shipping-config`;
- autenticação JWT compatível com o `AuthContext` atual;
- páginas SSR de produtos consultando Mongo diretamente;
- base de middleware para futuras áreas privadas.

## Dependências

```bash
npm install mongoose bcryptjs jsonwebtoken
npm install -D @types/jsonwebtoken
```

O `package.json` deste bloco já foi atualizado. Se você estiver aplicando os arquivos por cima de uma cópia existente, rode também:

```bash
npm install
```

## `.env.local`

Agora precisamos preencher:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=/api

MONGODB_URI=sua_string_do_mongodb
JWT_SECRET=uma_chave_secreta_forte
```

Ainda não precisa preencher:

```env
MP_ACCESS_TOKEN=
RESEND_API_KEY=
LOGGI_API_KEY=
```

Vou avisar conforme cada integração for migrada.

## Teste

1. Preencha `MONGODB_URI` e `JWT_SECRET`.
2. Rode `npm install`.
3. Rode `npm run dev`.
4. Acesse `http://localhost:3001`.
5. Teste cadastro e login.
6. Confira se os produtos vêm do Mongo.

## Observação

O token continua no `localStorage` neste bloco para manter compatibilidade com o `AuthContext` que já construímos.

Depois da migração funcional do backend, faremos uma etapa específica para trocar isso por cookie `HttpOnly`, melhorando a segurança sem misturar essa mudança com a migração do banco.

## Próximo bloco

Migrar o checkout real para `app/api/checkout`, incluindo:

- validação dos produtos no Mongo;
- estoque;
- CPF;
- endereço;
- cupons;
- criação do pedido;
- cálculo definitivo dos totais;
- integração com Mercado Pago PIX.
