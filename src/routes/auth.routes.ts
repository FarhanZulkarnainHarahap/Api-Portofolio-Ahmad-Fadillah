import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { env, isProduction } from "../config/env.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendSuccess } from "../utils/http.js";
import { ApiError } from "../utils/api-error.js";
import { hashToken } from "../services/token.service.js";
import { loginAdmin, refreshSession } from "../services/auth.service.js";
import { changePasswordSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: isProduction || env.COOKIE_SECURE,
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/",
};

function setAuthCookies(res: Parameters<typeof sendSuccess>[0], accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const session = await loginAdmin({
      email: req.body.email,
      password: req.body.password,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    setAuthCookies(res, session.accessToken, session.refreshToken);
    return sendSuccess(res, "Login successful", { admin: session.admin });
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) throw new ApiError(401, "Refresh token required");

    const session = await refreshSession(refreshToken);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return sendSuccess(res, "Session refreshed");
  }),
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    return sendSuccess(res, "Logout successful");
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
    });
    return sendSuccess(res, "Current admin retrieved", admin);
  }),
);

router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw new ApiError(404, "Admin not found");
    const valid = await bcrypt.compare(req.body.currentPassword, admin.passwordHash);
    if (!valid) throw new ApiError(400, "Current password is incorrect");

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(req.body.nextPassword, 12) },
    });
    return sendSuccess(res, "Password updated");
  }),
);

export default router;
