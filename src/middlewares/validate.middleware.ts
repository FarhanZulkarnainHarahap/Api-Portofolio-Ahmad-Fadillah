import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/api-error.js";

export function validate(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      return next(new ApiError(422, "Validation failed", parsed.error.flatten()));
    }

    const data = parsed.data as { body?: unknown; params?: unknown; query?: unknown };
    req.body = data.body ?? req.body;
    if (data.params && typeof data.params === "object") {
      Object.assign(req.params, data.params);
    }
    return next();
  };
}
