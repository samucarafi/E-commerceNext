import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth-server";

async function requireAdmin() {
  const user = await getAuthenticatedUser();
  return user?.role === "admin" ? user : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  await connectMongoDB();
  const { id } = await params;
  const user = await User.findById(id).select("-password -cpfEncrypted -cpfHash").lean();
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const source = body as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (source.name !== undefined) {
      const name = String(source.name).trim();
      if (name.length < 3) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
      data.name = name;
    }

    if (source.email !== undefined) data.email = String(source.email).trim().toLowerCase();
    if (source.role !== undefined) data.role = source.role === "admin" ? "admin" : "user";
    if (source.verified !== undefined) data.verified = Boolean(source.verified);
    if (source.phone !== undefined) data.phone = String(source.phone).trim();
    if (source.password) {
      const password = String(source.password);
      if (password.length < 6) return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
      data.password = await bcrypt.hash(password, 12);
    }

    if (data.email) {
      const duplicate = await User.findOne({ email: data.email, _id: { $ne: id } }).lean();
      if (duplicate) return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
    }

    await connectMongoDB();

    if (String(admin._id) === id && data.role === "user") {
      return NextResponse.json({ error: "Você não pode remover sua própria permissão de administrador." }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .select("-password -cpfEncrypted -cpfHash")
      .lean();

    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH /api/admin/usuarios/[id]:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  try {
    const { id } = await params;
    if (String(admin._id) === id) {
      return NextResponse.json({ error: "Você não pode excluir seu próprio usuário." }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    return NextResponse.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("DELETE /api/admin/usuarios/[id]:", error);
    return NextResponse.json({ error: "Não foi possível excluir o usuário." }, { status: 500 });
  }
}
