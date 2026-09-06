import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
  }
  return secret;
}

export function signEmailVerificationToken(userId: string) {
  return jwt.sign(
    { userId, type: "email-verification" },
    getJwtSecret(),
    { expiresIn: "24h", algorithm: "HS256" },
  );
}

export function verifyEmailVerificationToken(token: string) {
  const payload = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  }) as { userId?: string; type?: string };

  if (
    payload.type !== "email-verification" ||
    !payload.userId ||
    typeof payload.userId !== "string"
  ) {
    throw new Error("Token de verificação inválido.");
  }

  return payload.userId;
}
