import type { Role } from "../app/generated/prisma/client/index.js";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}
