import { getAuthenticatedUser } from "@/lib/auth-server";

export type UserRole = "user" | "admin";

export async function requireUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export function isAdminRole(role?: string | null) {
  return role === "admin";
}
