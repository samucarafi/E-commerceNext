import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getAuthenticatedUser } from "@/lib/auth-server";

async function requireAdmin() {
  const user = await getAuthenticatedUser();
  return user?.role === "admin" ? user : null;
}

function normalizePayload(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  const strings = ["name", "description", "image", "category", "type", "gender", "brand"];
  for (const key of strings) {
    if (body[key] !== undefined) data[key] = String(body[key]).trim();
  }

  for (const key of ["price", "stock", "weight", "popularity"]) {
    if (body[key] !== undefined) {
      const value = Number(body[key]);
      if (!Number.isFinite(value) || value < 0) throw new Error(`Campo inválido: ${key}`);
      data[key] = value;
    }
  }

  if (body.isNewProduct !== undefined) data.isNewProduct = Boolean(body.isNewProduct);
  return data;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();

    if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar o produto." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const data = normalizePayload(body as Record<string, unknown>);
    await connectMongoDB();

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("PATCH /api/products/[id]:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o produto." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    await connectMongoDB();

    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });

    return NextResponse.json({ message: "Produto excluído com sucesso." });
  } catch (error) {
    console.error("DELETE /api/products/[id]:", error);
    return NextResponse.json({ error: "Não foi possível excluir o produto." }, { status: 500 });
  }
}
