# Royal Parfums — Bloco 2

Este bloco adiciona a base de estado global do cliente:

- AuthContext com sessão baseada em cookie/credenciais do backend.
- CartContext com persistência local e limite de estoque.
- CartDrawer lateral no mesmo padrão visual premium.
- Botão real de adicionar produto à sacola.
- Login e cadastro.
- Checkout inicial com `noindex`.
- Providers globais.

## Instalação

Copie o conteúdo deste bloco para o projeto `E-commerceNext`.

Confirme no `.env.local`:

```env
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Observação importante

Os caminhos de autenticação foram isolados no `AuthContext`. Como o backend antigo usa rotas específicas, o próximo bloco deve validar os endpoints exatos e centralizar isso em `services/auth.service.ts`, evitando espalhar URLs pela aplicação.

Também vamos substituir o `localStorage` de autenticação legado por cookie HttpOnly no fluxo definitivo, mantendo o carrinho local.
