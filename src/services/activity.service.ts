import type { Request } from "express";
import { prisma } from "../config/db.js";

export async function logActivity(req: Request, action: string, entity?: string, entityId?: string, description?: string) {
  const admin = req.admin;
  if (!admin) return;

  await prisma.activityLog.create({
    data: {
      adminId: admin.id,
      action,
      entity,
      entityId,
      description,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    },
  });
}
