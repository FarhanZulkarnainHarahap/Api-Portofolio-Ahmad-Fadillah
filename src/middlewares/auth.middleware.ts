import type { RequestHandler } from "express";
import { Role } from "../app/generated/prisma/client/index.js";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { verifyAccessToken } from "../services/token.service.js";

export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const bearer = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const token = bearer || cookieToken;

  if (!token) throw new ApiError(401, "Authentication required");

  const payload = verifyAccessToken(token);
  const admin = await prisma.admin.findFirst({
    where: { id: payload.sub, isActive: true },
    select: { id: true, email: true, role: true },
  });

  if (!admin) throw new ApiError(401, "Invalid session");

  req.admin = admin;
  return next();
});

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(new ApiError(403, "Insufficient permission"));
    }

    return next();
  };
}
