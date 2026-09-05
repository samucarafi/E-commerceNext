import { getProducts } from "@/lib/products";
import ProdutosAdminClient from "./ProdutosAdminClient";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return <ProdutosAdminClient />;
}
