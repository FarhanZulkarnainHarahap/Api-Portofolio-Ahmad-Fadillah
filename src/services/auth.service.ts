import bcrypt from "bcrypt";
import { Role } from "../app/generated/prisma/client/index.js";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/api-error.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "./token.service.js";

const refreshMs = 7 * 24 * 60 * 60 * 1000;

export async function loginAdmin(input: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } });
  const passwordValid = admin ? await bcrypt.compare(input.password, admin.passwordHash) : false;

  await prisma.loginActivity.create({
    data: {
      adminId: admin?.id,
      email: input.email,
      success: Boolean(admin && passwordValid && admin.isActive),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });

  if (!admin || !passwordValid || !admin.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  const payload = { sub: admin.id, email: admin.email, role: admin.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      adminId: admin.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshMs),
    },
  });

  return {
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    accessToken,
    refreshToken,
  };
}

export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { admin: true },
  });

  if (!storedToken || !storedToken.admin.isActive) {
    throw new ApiError(401, "Invalid refresh token");
  }

  await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } });

  const nextPayload = {
    sub: storedToken.admin.id,
    email: storedToken.admin.email,
    role: storedToken.admin.role,
  };
  const accessToken = signAccessToken(nextPayload);
  const nextRefreshToken = signRefreshToken(nextPayload);

  await prisma.refreshToken.create({
    data: {
      adminId: storedToken.admin.id,
      tokenHash: hashToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + refreshMs),
    },
  });

  return { accessToken, refreshToken: nextRefreshToken };
}

export async function createAdminManually(input: { name: string; email: string; password: string; role?: Role }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.admin.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? Role.SUPER_ADMIN,
    },
  });
}
