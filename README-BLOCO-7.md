# Bloco 7 — Header, carrinho visual, filtros e Google

Este bloco preserva a identidade do frontend original do Royal Parfums enquanto a migração continua.

## UX recuperada

- Ícone de usuário/entrar no canto direito do header.
- Ícone de sacola/carrinho com contador.
- Clique no ícone abre o `CartDrawer` existente.
- Botão de filtros no canto esquerdo.
- Sidebar lateral de filtros.
- `ProductCard` com botão para adicionar diretamente ao carrinho.
- Ao adicionar pelo card, o item entra no `CartContext` e o contador do header é atualizado.
- Login com e-mail/senha continua disponível.
- Login com Google foi adicionado.

## Google

Adicione ao `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_do_google
```

O client ID pode ser público no frontend.

O fluxo do servidor usa o token de acesso do Google para obter o perfil verificado e depois emite o JWT da própria aplicação.

## Instalação

```bash
npm install
npm run dev
```

## Observação importante

O bloco deixa a estrutura visual dos filtros pronta, mas a filtragem completa deve continuar sendo conectada ao estado do catálogo na próxima etapa, para não criar uma segunda lógica de produtos diferente da original.

Também mantivemos o carrinho usando o `CartContext` já criado nos blocos anteriores.

## Próximo bloco

Mercado Pago/Pix + criação definitiva do pagamento + webhook + atualização do pedido.
