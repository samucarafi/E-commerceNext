import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getAuthenticatedUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const user = await getAuthenticatedUser();
  return user?.role === "admin";
}

export async function GET() {
  try {
    await connectMongoDB();
    const products = await Product.find({})
      .sort({ isNewProduct: -1, popularity: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products:", error);
    return NextResponse.json({ error: "Não foi possível carregar os produtos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const source = body as Record<string, unknown>;
    const required = ["name", "price", "description", "image", "category"];
    for (const key of required) {
      if (source[key] === undefined || source[key] === "") {
        return NextResponse.json({ error: `O campo ${key} é obrigatório.` }, { status: 400 });
      }
    }

    const productData = {
      name: String(source.name).trim(),
      price: Number(source.price),
      description: String(source.description).trim(),
      image: String(source.image).trim(),
      stock: Number(source.stock ?? 0),
      category: String(source.category),
      type: String(source.type ?? "Perfume"),
      gender: source.gender ? String(source.gender) : undefined,
      brand: String(source.brand ?? "").trim(),
      weight: source.weight === undefined || source.weight === "" ? undefined : Number(source.weight),
      popularity: Number(source.popularity ?? 0),
      isNewProduct: Boolean(source.isNewProduct),
    };

    if (!Number.isFinite(productData.price) || productData.price < 0 ||
        !Number.isFinite(productData.stock) || productData.stock < 0) {
      return NextResponse.json({ error: "Preço ou estoque inválido." }, { status: 400 });
    }

    await connectMongoDB();
    const product = await Product.create(productData);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products:", error);
    return NextResponse.json({ error: "Não foi possível criar o produto." }, { status: 400 });
  }
}
