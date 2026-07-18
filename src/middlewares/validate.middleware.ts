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
    req.params = (data.params ?? req.params) as typeof req.params;
    req.query = (data.query ?? req.query) as typeof req.query;
    return next();
  };
}
