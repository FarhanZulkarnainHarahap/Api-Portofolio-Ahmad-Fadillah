import multer from "multer";
import { ApiError } from "../utils/api-error.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      cb(new ApiError(415, "Unsupported file type"));
      return;
    }

    cb(null, true);
  },
});
