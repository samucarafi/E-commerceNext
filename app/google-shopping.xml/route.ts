import { getProducts } from "@/lib/products";
import type { Product } from "@/types/product";

const DEFAULT_SITE_URL = "https://royalparfums.com.br";

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(value: string, baseUrl: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, `${baseUrl}/`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function productItem(product: Product, baseUrl: string): string | null {
  const id = product._id || product.id;
  const name = product.name?.trim();
  const slug = product.slug?.trim();
  const price = Number(product.price);
  const imageUrl = absoluteUrl(product.image || "", baseUrl);

  // O Merchant Center exige dados essenciais e uma imagem pública por produto.
  if (!id || !name || !slug || !Number.isFinite(price) || price <= 0 || !imageUrl) {
    return null;
  }

  const productUrl = `${baseUrl}/produtos/${encodeURIComponent(slug)}`;
  const description =
    product.description?.trim() || `${name}${product.brand ? ` - ${product.brand}` : ""}.`;

  const fields: Array<[string, string]> = [
    ["g:id", id],
    ["g:title", name],
    ["g:description", description],
    ["g:link", productUrl],
    ["g:image_link", imageUrl],
    ["g:condition", "new"],
    ["g:availability", Number(product.stock) > 0 ? "in_stock" : "out_of_stock"],
    ["g:price", `${price.toFixed(2)} BRL`],
    ["g:product_type", product.type || ""],
    ["g:brand", product.brand?.trim() || ""],
  ];

  const xmlFields = fields
    .filter(([, value]) => Boolean(value))
    .map(([tag, value]) => `      <${tag}>${escapeXml(value)}</${tag}>`)
    .join("\n");

  return `    <item>\n${xmlFields}\n    </item>`;
}

export async function GET() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
  ).replace(/\/+$/, "");

  try {
    const products = await getProducts();
    const items = products
      .map((product) => productItem(product, baseUrl))
      .filter((item): item is string => Boolean(item));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Royal Parfums</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Catálogo de produtos da Royal Parfums</description>
${items.join("\n")}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[Google Merchant Feed] Erro ao gerar feed:", error);
    return new Response("Não foi possível gerar o feed de produtos.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
