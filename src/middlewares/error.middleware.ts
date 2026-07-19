import type { ErrorRequestHandler } from "express";
import { Prisma } from "../app/generated/prisma/client/index.js";
import { env, isProduction } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors ?? [],
    });
  }

  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message = error.code === "P2002" ? "Data already exists" : "Database request failed";
    return res.status(400).json({ success: false, message, errors: [{ code: error.code }] });
  }

  const payload: Record<string, unknown> = {
    success: false,
    message: isProduction ? "Internal server error" : error.message,
  };

  if (env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  return res.status(500).json(payload);
};
