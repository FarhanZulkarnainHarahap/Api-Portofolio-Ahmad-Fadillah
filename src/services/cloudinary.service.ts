import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { Express } from "express";
import { MediaType } from "../app/generated/prisma/client/index.js";
import { env } from "../config/env.js";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/api-error.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const folderMap = {
  profile: "hr-portfolio/profile",
  projects: "hr-portfolio/projects",
  documents: "hr-portfolio/documents",
  certifications: "hr-portfolio/certifications",
  blog: "hr-portfolio/blog",
  testimonials: "hr-portfolio/testimonials",
  media: "hr-portfolio/media",
} as const;

export type UploadFolder = keyof typeof folderMap;

export function assertCloudinaryConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(503, "Cloudinary is not configured");
  }
}

export async function uploadToCloudinary(file: Express.Multer.File, folder: UploadFolder) {
  assertCloudinaryConfigured();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folderMap[folder],
          resource_type: file.mimetype === "application/pdf" ? "raw" : "auto",
          original_filename: file.originalname,
        },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error ?? new Error("Upload failed"));
          else resolve(uploadResult);
        },
      )
      .end(file.buffer);
  });

  return prisma.media.create({
    data: {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mediaType: file.mimetype === "application/pdf" ? MediaType.PDF : MediaType.IMAGE,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      originalFilename: file.originalname,
      folder: folderMap[folder],
      metadata: { mimetype: file.mimetype },
    },
  });
}

export async function deleteCloudinaryMedia(mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return;
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(media.publicId, { resource_type: media.resourceType });
  await prisma.media.update({ where: { id: media.id }, data: { deletedAt: new Date() } });
}
