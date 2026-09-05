import { NextResponse } from "next/server";

export function apiError(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

export function unauthorized() {
  return apiError("Não autenticado.", 401);
}

export function forbidden() {
  return apiError("Acesso não autorizado.", 403);
}
