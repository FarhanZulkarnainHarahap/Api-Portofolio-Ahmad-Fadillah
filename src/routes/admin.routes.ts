import { Router } from "express";
import slugify from "slugify";
import { Prisma } from "../app/generated/prisma/client/index.js";
import { prisma } from "../config/db.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { getPagination, sendList, sendSuccess } from "../utils/http.js";
import { sanitizeRichText } from "../utils/sanitize.js";
import { uploadToCloudinary, type UploadFolder, deleteCloudinaryMedia } from "../services/cloudinary.service.js";
import { logActivity } from "../services/activity.service.js";

const router = Router();
router.use(requireAuth);

type CrudDelegate = {
  findMany(args?: Record<string, unknown>): Promise<unknown[]>;
  findUnique(args: Record<string, unknown>): Promise<unknown | null>;
  findFirst(args: Record<string, unknown>): Promise<unknown | null>;
  count(args?: Record<string, unknown>): Promise<number>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  updateMany(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
};

type CrudConfig = {
  delegate: CrudDelegate;
  entity: string;
  hasPublished?: boolean;
  hasActive?: boolean;
  hasFeatured?: boolean;
  softDelete?: boolean;
  sortable?: boolean;
  searchable?: string[];
  include?: Record<string, unknown>;
};

const crudConfigs: Record<string, CrudConfig> = {
  profile: { delegate: prisma.profile as unknown as CrudDelegate, entity: "profile", hasActive: true, softDelete: true, searchable: ["name", "headline"] },
  statistics: { delegate: prisma.statistic as unknown as CrudDelegate, entity: "statistic", hasActive: true, softDelete: true, sortable: true, searchable: ["label"] },
  education: { delegate: prisma.education as unknown as CrudDelegate, entity: "education", hasActive: true, softDelete: true, sortable: true, searchable: ["institution", "degree"] },
  experiences: { delegate: prisma.experience as unknown as CrudDelegate, entity: "experience", hasPublished: true, softDelete: true, sortable: true, searchable: ["companyName", "position"], include: { responsibilities: true, achievements: true } },
  "expertise-categories": { delegate: prisma.expertiseCategory as unknown as CrudDelegate, entity: "expertiseCategory", hasActive: true, sortable: true, searchable: ["name"] },
  expertise: { delegate: prisma.expertise as unknown as CrudDelegate, entity: "expertise", hasActive: true, softDelete: true, sortable: true, searchable: ["name"], include: { category: true } },
  "project-categories": { delegate: prisma.projectCategory as unknown as CrudDelegate, entity: "projectCategory", hasActive: true, sortable: true, searchable: ["name"] },
  projects: { delegate: prisma.project as unknown as CrudDelegate, entity: "project", hasPublished: true, hasFeatured: true, softDelete: true, sortable: true, searchable: ["title", "organization"], include: { category: true, metrics: true, results: true, challenges: true, projectTools: true } },
  achievements: { delegate: prisma.achievement as unknown as CrudDelegate, entity: "achievement", hasPublished: true, hasFeatured: true, softDelete: true, sortable: true, searchable: ["title", "category"] },
  "document-categories": { delegate: prisma.documentCategory as unknown as CrudDelegate, entity: "documentCategory", hasActive: true, sortable: true, searchable: ["name"] },
  documents: { delegate: prisma.portfolioDocument as unknown as CrudDelegate, entity: "portfolioDocument", hasPublished: true, softDelete: true, sortable: true, searchable: ["title"] },
  certifications: { delegate: prisma.certification as unknown as CrudDelegate, entity: "certification", hasPublished: true, hasFeatured: true, softDelete: true, sortable: true, searchable: ["name", "issuer"] },
  testimonials: { delegate: prisma.testimonial as unknown as CrudDelegate, entity: "testimonial", hasFeatured: true, softDelete: true, sortable: true, searchable: ["name", "company"] },
  "blog-categories": { delegate: prisma.blogCategory as unknown as CrudDelegate, entity: "blogCategory", hasActive: true, sortable: true, searchable: ["name"] },
  "blog-tags": { delegate: prisma.blogTag as unknown as CrudDelegate, entity: "blogTag", searchable: ["name"] },
  "blog-posts": { delegate: prisma.blogPost as unknown as CrudDelegate, entity: "blogPost", hasFeatured: true, softDelete: true, searchable: ["title", "excerpt"], include: { category: true, tags: { include: { tag: true } } } },
  "dashboard-widgets": { delegate: prisma.dashboardWidget as unknown as CrudDelegate, entity: "dashboardWidget", hasActive: true, sortable: true, searchable: ["title"], include: { datasets: true } },
  "site-settings": { delegate: prisma.siteSetting as unknown as CrudDelegate, entity: "siteSetting", searchable: ["key"] },
  navigation: { delegate: prisma.navigationItem as unknown as CrudDelegate, entity: "navigationItem", hasActive: true, sortable: true, searchable: ["label", "href"] },
  socials: { delegate: prisma.socialLink as unknown as CrudDelegate, entity: "socialLink", hasActive: true, sortable: true, searchable: ["label"] },
  messages: { delegate: prisma.contactMessage as unknown as CrudDelegate, entity: "contactMessage", softDelete: true, searchable: ["name", "email", "subject"] },
};

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [
      projects,
      experiences,
      blogPosts,
      documents,
      certifications,
      newMessages,
      draftPosts,
      publishedProjects,
      recentActivity,
    ] = await prisma.$transaction([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.experience.count({ where: { deletedAt: null } }),
      prisma.blogPost.count({ where: { deletedAt: null } }),
      prisma.portfolioDocument.count({ where: { deletedAt: null } }),
      prisma.certification.count({ where: { deletedAt: null } }),
      prisma.contactMessage.count({ where: { status: "NEW", deletedAt: null } }),
      prisma.blogPost.count({ where: { status: "DRAFT", deletedAt: null } }),
      prisma.project.count({ where: { isPublished: true, deletedAt: null } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    return sendSuccess(res, "Dashboard retrieved successfully", {
      projects,
      experiences,
      blogPosts,
      documents,
      certifications,
      newMessages,
      draftPosts,
      publishedProjects,
      recentActivity,
    });
  }),
);

router.post(
  "/media/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(422, "File is required");
    const folder = ((req.body.folder as UploadFolder) || "media") as UploadFolder;
    const media = await uploadToCloudinary(req.file, folder);
    await logActivity(req, "UPLOAD_MEDIA", "media", media.id, media.originalFilename ?? undefined);
    return sendSuccess(res, "Media uploaded successfully", media, 201);
  }),
);

router.get(
  "/media",
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = { deletedAt: null };
    const [data, total] = await prisma.$transaction([
      prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.media.count({ where }),
    ]);
    return sendList(res, "Media retrieved successfully", data, { page, limit, total, totalPages: Math.ceil(total / limit) });
  }),
);

router.delete(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await deleteCloudinaryMedia(id);
    await logActivity(req, "DELETE_MEDIA", "media", id);
    return sendSuccess(res, "Media deleted successfully");
  }),
);

const listResource = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const config = getConfig(resource);
  const { page, limit, skip } = getPagination(req.query);
  const where = buildSearchWhere(config, req.query.search as string | undefined);
  const [data, total] = await Promise.all([
    config.delegate.findMany({
      where,
      include: config.include,
      orderBy: config.sortable ? [{ sortOrder: "asc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
      skip,
      take: limit,
    }),
    config.delegate.count({ where }),
  ]);

  return sendList(res, `${config.entity} list retrieved successfully`, data, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

const getResource = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const id = String(req.params.id);
  const config = getConfig(resource);
  const data = await config.delegate.findUnique({ where: { id }, include: config.include });
  if (!data) throw new ApiError(404, `${config.entity} not found`);
  return sendSuccess(res, `${config.entity} retrieved successfully`, data);
});

const createResource = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const config = getConfig(resource);
  const data = normalizeData(resource, req.body);
  const created = await createByResource(resource, data);
  await logActivity(req, `CREATE_${config.entity.toUpperCase()}`, config.entity, getId(created));
  return sendSuccess(res, `${config.entity} created successfully`, created, 201);
});

const updateResource = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const id = String(req.params.id);
  const config = getConfig(resource);
  const data = normalizeData(resource, req.body);
  const updated = await updateByResource(resource, id, data);
  await logActivity(req, `UPDATE_${config.entity.toUpperCase()}`, config.entity, id);
  return sendSuccess(res, `${config.entity} updated successfully`, updated);
});

const deleteResource = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const id = String(req.params.id);
  const config = getConfig(resource);
  if (config.softDelete) {
    await config.delegate.update({ where: { id }, data: { deletedAt: new Date() } });
  } else {
    await config.delegate.delete({ where: { id } });
  }
  await logActivity(req, `DELETE_${config.entity.toUpperCase()}`, config.entity, id);
  return sendSuccess(res, `${config.entity} deleted successfully`);
});

const togglePublished = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const id = String(req.params.id);
  const config = getConfig(resource);
  if (!config.hasPublished) throw new ApiError(400, "Resource does not support publish state");
  const updated = await config.delegate.update({
    where: { id },
    data: { isPublished: Boolean(req.body.isPublished) },
  });
  await logActivity(req, "TOGGLE_PUBLISH", config.entity, id);
  return sendSuccess(res, "Publish state updated", updated);
});

const toggleFeatured = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const id = String(req.params.id);
  const config = getConfig(resource);
  if (!config.hasFeatured) throw new ApiError(400, "Resource does not support featured state");
  const updated = await config.delegate.update({
    where: { id },
    data: { isFeatured: Boolean(req.body.isFeatured) },
  });
  await logActivity(req, "TOGGLE_FEATURED", config.entity, id);
  return sendSuccess(res, "Featured state updated", updated);
});

const reorderResource = asyncHandler(async (req, res) => {
  const resource = String(req.params.resource);
  const config = getConfig(resource);
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  await prisma.$transaction(
    items.map((item: { id: string; sortOrder: number }) =>
      config.delegate.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }) as Prisma.PrismaPromise<unknown>,
    ),
  );
  await logActivity(req, "REORDER", config.entity);
  return sendSuccess(res, "Order updated successfully");
});

function getConfig(resource: string) {
  const config = crudConfigs[resource];
  if (!config) throw new ApiError(404, "Admin resource not found");
  return config;
}

function buildSearchWhere(config: CrudConfig, search?: string) {
  const base: Record<string, unknown> = {};
  if (config.softDelete) {
    base.deletedAt = null;
  }

  if (!search || !config.searchable?.length) return base;

  return {
    ...base,
    OR: config.searchable.map((field) => ({ [field]: { contains: search, mode: "insensitive" } })),
  };
}

function normalizeData(resource: string, body: Record<string, unknown>) {
  const data = { ...body };
  if ("slug" in data && !data.slug && typeof data.title === "string") data.slug = toSlug(data.title);
  if ("slug" in data && !data.slug && typeof data.name === "string") data.slug = toSlug(data.name);
  if (resource === "blog-posts" && typeof data.content === "string") data.content = sanitizeRichText(data.content);
  return data;
}

function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

function getId(value: unknown) {
  return typeof value === "object" && value && "id" in value ? String(value.id) : undefined;
}

async function createByResource(resource: string, data: Record<string, unknown>) {
  if (resource === "projects") {
    return prisma.project.create({ data: projectPayload(data), include: crudConfigs.projects.include });
  }
  if (resource === "experiences") {
    return prisma.experience.create({ data: experiencePayload(data), include: crudConfigs.experiences.include });
  }
  return getConfig(resource).delegate.create({ data });
}

async function updateByResource(resource: string, id: string, data: Record<string, unknown>) {
  if (resource === "projects") {
    return prisma.$transaction(async (tx) => {
      await tx.projectMetric.deleteMany({ where: { projectId: id } });
      await tx.projectResult.deleteMany({ where: { projectId: id } });
      await tx.projectChallenge.deleteMany({ where: { projectId: id } });
      await tx.projectTool.deleteMany({ where: { projectId: id } });
      return tx.project.update({ where: { id }, data: projectPayload(data), include: crudConfigs.projects.include });
    });
  }
  if (resource === "experiences") {
    return prisma.$transaction(async (tx) => {
      await tx.experienceResponsibility.deleteMany({ where: { experienceId: id } });
      await tx.experienceAchievement.deleteMany({ where: { experienceId: id } });
      return tx.experience.update({ where: { id }, data: experiencePayload(data), include: crudConfigs.experiences.include });
    });
  }
  return getConfig(resource).delegate.update({ where: { id }, data });
}

function projectPayload(data: Record<string, unknown>) {
  const metrics = Array.isArray(data.metrics) ? data.metrics : [];
  const results = Array.isArray(data.results) ? data.results : [];
  const challenges = Array.isArray(data.challenges) ? data.challenges : [];
  const projectTools = Array.isArray(data.projectTools) ? data.projectTools : [];
  const payload = { ...data };
  delete payload.metrics;
  delete payload.results;
  delete payload.challenges;
  delete payload.projectTools;

  return {
    ...payload,
    metrics: { create: metrics },
    results: { create: results },
    challenges: { create: challenges },
    projectTools: { create: projectTools },
  } as Prisma.ProjectCreateInput;
}

function experiencePayload(data: Record<string, unknown>) {
  const responsibilities = Array.isArray(data.responsibilities) ? data.responsibilities : [];
  const achievements = Array.isArray(data.achievements) ? data.achievements : [];
  const payload = { ...data };
  delete payload.responsibilities;
  delete payload.achievements;

  return {
    ...payload,
    responsibilities: { create: responsibilities },
    achievements: { create: achievements },
  } as Prisma.ExperienceCreateInput;
}

router.get("/:resource", listResource);
router.post("/:resource", createResource);
router.patch("/:resource/reorder", reorderResource);
router.get("/:resource/:id", getResource);
router.patch("/:resource/:id", updateResource);
router.delete("/:resource/:id", deleteResource);
router.patch("/:resource/:id/publish", togglePublished);
router.patch("/:resource/:id/featured", toggleFeatured);

export default router;
