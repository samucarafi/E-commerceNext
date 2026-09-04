# Royal Parfums — base de migração

Esta base transforma o catálogo antigo em páginas Server Component do Next.js, preservando a identidade visual do frontend original.

## Próximas etapas
1. Migrar Auth + cookies HttpOnly.
2. Migrar Cart/Checkout/Orders para Client Contexts apenas onde houver estado de UI.
3. Migrar API Express para Route Handlers/services/repositories mantendo MongoDB.
4. Integrar Mercado Pago/PIX e webhook idempotente.
5. Migrar admin: produtos, usuários, pedidos, cupons, frete e pagamentos.
6. Copiar `public/images/ROYAL.png` e `default-perfume.jpg` do repositório antigo.
7. Criar índices/slugs no MongoDB e invalidar cache após mutações.
