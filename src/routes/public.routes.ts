import { Router } from "express";
import rateLimit from "express-rate-limit";
import { PublishStatus } from "../app/generated/prisma/client/index.js";
import { prisma } from "../config/db.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getPagination, sendList, sendSuccess } from "../utils/http.js";
import { ApiError } from "../utils/api-error.js";
import { contactSchema } from "../validators/public.validator.js";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  "/profile",
  asyncHandler(async (_req, res) => {
    const profile = await prisma.profile.findFirst({
      where: { isActive: true, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });
    return sendSuccess(res, "Profile retrieved successfully", profile);
  }),
);

router.get(
  "/statistics",
  asyncHandler(async (_req, res) => {
    const data = await prisma.statistic.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return sendSuccess(res, "Statistics retrieved successfully", data);
  }),
);

router.get(
  "/experiences",
  asyncHandler(async (_req, res) => {
    const data = await prisma.experience.findMany({
      where: { isPublished: true, deletedAt: null },
      include: { responsibilities: { orderBy: { sortOrder: "asc" } }, achievements: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    });
    return sendSuccess(res, "Experiences retrieved successfully", data);
  }),
);

router.get(
  "/expertise",
  asyncHandler(async (_req, res) => {
    const data = await prisma.expertise.findMany({
      where: { isActive: true, deletedAt: null },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return sendSuccess(res, "Expertise retrieved successfully", data);
  }),
);

router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {
      isPublished: true,
      deletedAt: null,
      ...(req.query.featured === "true" ? { isFeatured: true } : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        include: { category: true, metrics: true, results: true, challenges: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);
    return sendList(res, "Projects retrieved successfully", data, { page, limit, total, totalPages: Math.ceil(total / limit) });
  }),
);

router.get(
  "/projects/:slug",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { slug: String(req.params.slug), isPublished: true, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        metrics: true,
        results: { orderBy: { sortOrder: "asc" } },
        challenges: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!project) throw new ApiError(404, "Project not found");
    return sendSuccess(res, "Project retrieved successfully", project);
  }),
);

router.get("/achievements", listPublished("achievement", "Achievements retrieved successfully"));
router.get("/documents", listPublished("portfolioDocument", "Documents retrieved successfully"));
router.get("/certifications", listPublished("certification", "Certifications retrieved successfully"));

router.get(
  "/testimonials",
  asyncHandler(async (_req, res) => {
    const data = await prisma.testimonial.findMany({
      where: { isApproved: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return sendSuccess(res, "Testimonials retrieved successfully", data);
  }),
);

router.get(
  "/blog",
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = { status: PublishStatus.PUBLISHED, deletedAt: null };
    const [data, total] = await prisma.$transaction([
      prisma.blogPost.findMany({ where, include: { category: true, tags: { include: { tag: true } } }, orderBy: { publishedAt: "desc" }, skip, take: limit }),
      prisma.blogPost.count({ where }),
    ]);
    return sendList(res, "Blog posts retrieved successfully", data, { page, limit, total, totalPages: Math.ceil(total / limit) });
  }),
);

router.get(
  "/blog/:slug",
  asyncHandler(async (req, res) => {
    const post = await prisma.blogPost.findFirst({
      where: { slug: String(req.params.slug), status: PublishStatus.PUBLISHED, deletedAt: null },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!post) throw new ApiError(404, "Article not found");
    await prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    return sendSuccess(res, "Article retrieved successfully", post);
  }),
);

router.get(
  "/dashboard-widgets",
  asyncHandler(async (_req, res) => {
    const data = await prisma.dashboardWidget.findMany({
      where: { isActive: true },
      include: { datasets: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
    return sendSuccess(res, "Dashboard widgets retrieved successfully", data);
  }),
);

router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const [settings, navigation, socials] = await prisma.$transaction([
      prisma.siteSetting.findMany({ where: { isPublic: true } }),
      prisma.navigationItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.socialLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);
    return sendSuccess(res, "Settings retrieved successfully", { settings, navigation, socials });
  }),
);

router.post(
  "/contact",
  contactLimiter,
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    if (req.body.website) throw new ApiError(400, "Invalid submission");
    const message = await prisma.contactMessage.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        company: req.body.company || null,
        subject: req.body.subject,
        message: req.body.message,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });
    return sendSuccess(res, "Message sent successfully", message, 201);
  }),
);

function listPublished(modelName: "achievement" | "portfolioDocument" | "certification", message: string) {
  return asyncHandler(async (_req, res) => {
    const args = {
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
    };
    const data =
      modelName === "achievement"
        ? await prisma.achievement.findMany(args)
        : modelName === "portfolioDocument"
          ? await prisma.portfolioDocument.findMany(args)
          : await prisma.certification.findMany(args);
    return sendSuccess(res, message, data);
  });
}

export default router;
