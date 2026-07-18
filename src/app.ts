import express from "express";
import * as helmetModule from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import * as rateLimitModule from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";

const helmet = helmetModule.default;
const rateLimit = rateLimitModule.rateLimit;

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => res.json({ success: true, message: "API healthy" }));
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/public", publicRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
