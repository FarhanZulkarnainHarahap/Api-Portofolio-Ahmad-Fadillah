import type { Response } from "express";

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function sendSuccess(res: Response, message: string, data: unknown = null, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendList(res: Response, message: string, data: unknown[], meta: Meta) {
  return res.json({ success: true, message, data, meta });
}

export function getPagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
