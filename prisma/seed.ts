import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  EmploymentType,
  PrismaClient,
  ProjectStatus,
  PublishStatus,
  WidgetType,
  WorkMode,
} from "../src/app/generated/prisma/client/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const navItems = [
  { label: "Beranda", href: "/", location: "header", sortOrder: 1 },
  { label: "Tentang Saya", href: "/about", location: "header", sortOrder: 2 },
  { label: "Pengalaman", href: "/experience", location: "header", sortOrder: 3 },
  { label: "Pencapaian", href: "/achievement", location: "header", sortOrder: 4 },
  { label: "Proyek", href: "/projects", location: "header", sortOrder: 5 },
  { label: "Sertifikat", href: "/certificate", location: "header", sortOrder: 6 },
  { label: "Blog", href: "/blog", location: "header", sortOrder: 7 },
  { label: "Kontak", href: "/contact", location: "header", sortOrder: 8 },
];

const statistics = [
  { label: "Tahun Pengalaman di bidang Human Resources", value: 3, unit: "+", icon: "users", sortOrder: 1 },
  { label: "Perusahaan / Instansi Telah Berkolaborasi", value: 6, unit: "+", icon: "building", sortOrder: 2 },
  { label: "Pendidikan Agribisnis - UMSU", value: 1, unit: "S1", icon: "education", sortOrder: 3 },
  { label: "Karyawan Terdampak Melalui Program HR", value: 100, unit: "+", icon: "award", sortOrder: 4 },
];

const expertise = [
  { category: "HR Management", slug: "hr-management", name: "Talent Acquisition & Onboarding", description: "Mengelola proses rekrutmen end-to-end dan pengalaman onboarding karyawan baru.", level: 88, sortOrder: 1 },
  { category: "HR Management", slug: "hr-management", name: "Performance Management", description: "Menyusun pemantauan performa, KPI, dan evaluasi berbasis data.", level: 82, sortOrder: 2 },
  { category: "People Development", slug: "people-development", name: "Employee Relations", description: "Membangun komunikasi internal, engagement, dan hubungan industrial yang sehat.", level: 84, sortOrder: 3 },
  { category: "People Development", slug: "people-development", name: "Learning & Development", description: "Merancang program pelatihan yang relevan dengan kebutuhan organisasi.", level: 80, sortOrder: 4 },
  { category: "Tools", slug: "tools", name: "Microsoft Excel", description: "Pengolahan data HR, rekap absensi, dan laporan performa.", level: 90, sortOrder: 5 },
  { category: "Tools", slug: "tools", name: "HRIS", description: "Administrasi data karyawan, onboarding, payroll support, dan arsip digital.", level: 78, sortOrder: 6 },
  { category: "Tools", slug: "tools", name: "Canva", description: "Membuat materi komunikasi internal, training deck, dan visual HR campaign.", level: 82, sortOrder: 7 },
  { category: "Tools", slug: "tools", name: "Notion", description: "Dokumentasi SOP, tracker proyek, dan knowledge base tim.", level: 76, sortOrder: 8 },
];

const experiences = [
  {
    companyName: "PT Maju Bersama Sejahtera",
    position: "Human Resources Specialist",
    location: "Medan, Indonesia",
    startDate: new Date("2022-01-01"),
    endDate: null,
    isCurrent: true,
    sortOrder: 1,
    description: "Bertanggung jawab dalam pengelolaan proses HR end-to-end serta pengembangan program untuk meningkatkan engagement dan performa karyawan.",
    responsibilities: [
      "Mengelola proses rekrutmen dari identifikasi kebutuhan hingga onboarding.",
      "Mengembangkan dan menjalankan program pelatihan dan pengembangan karyawan.",
      "Menyusun dan menganalisis HR Dashboard untuk mendukung pengambilan keputusan.",
      "Menangani hubungan industrial dan meningkatkan employee engagement.",
    ],
    achievements: [
      "Meningkatkan engagement score melalui program komunikasi internal.",
      "Mempercepat proses rekrutmen tanpa mengorbankan kualitas kandidat.",
    ],
    tools: ["Recruitment", "Training & Development", "HR Analytics", "Employee Relations"],
  },
  {
    companyName: "PT Sumber Daya Mandiri",
    position: "HR Generalist",
    location: "Jakarta, Indonesia",
    startDate: new Date("2019-01-01"),
    endDate: new Date("2022-01-01"),
    isCurrent: false,
    sortOrder: 2,
    description: "Menjalankan fungsi HR generalist dengan fokus pada administrasi SDM, operasional HR, dan pengembangan budaya kerja.",
    responsibilities: [
      "Mengelola administrasi karyawan dan data kepegawaian.",
      "Melaksanakan program onboarding dan orientasi karyawan baru.",
      "Mengelola absensi, cuti, dan lembur menggunakan sistem HRIS.",
      "Mendukung pelaksanaan program engagement dan komunikasi internal.",
    ],
    achievements: [
      "Merapikan dokumentasi karyawan dan alur administrasi operasional.",
      "Meningkatkan ketepatan laporan HR bulanan.",
    ],
    tools: ["HR Administration", "Employee Relations", "HRIS", "Payroll Support"],
  },
  {
    companyName: "PT Cipta Solusi Nusantara",
    position: "HR Staff",
    location: "Bandung, Indonesia",
    startDate: new Date("2017-01-01"),
    endDate: new Date("2019-01-01"),
    isCurrent: false,
    sortOrder: 3,
    description: "Mendukung operasional HR dalam rekrutmen, administrasi karyawan, dan program pelatihan.",
    responsibilities: [
      "Membantu proses screening CV dan penjadwalan interview.",
      "Menyiapkan dokumen kepegawaian dan kontrak kerja.",
      "Mendukung pelaksanaan pelatihan dan kegiatan HR lainnya.",
    ],
    achievements: [
      "Mempercepat koordinasi interview lintas divisi.",
      "Membantu pembaruan arsip karyawan menjadi lebih rapi.",
    ],
    tools: ["Recruitment", "HR Administration", "Training Support", "Data Management"],
  },
];

const projects = [
  {
    category: { name: "HR Analytics", slug: "hr-analytics" },
    title: "HR Dashboard & Employee Data Analytics",
    slug: "hr-dashboard-employee-data-analytics",
    shortDescription: "Mengembangkan dashboard interaktif untuk memonitor data karyawan dan insights HR yang mendukung pengambilan keputusan berbasis data.",
    fullDescription: "Dashboard ini menyatukan data headcount, turnover, absensi, dan engagement agar tim HR dapat membaca kondisi organisasi secara cepat dan mengambil tindakan yang tepat.",
    organization: "Internal HR Project",
    year: 2024,
    duration: "8 minggu",
    status: ProjectStatus.COMPLETED,
    role: "HR Analyst",
    problem: "Data HR tersebar di banyak file sehingga laporan lambat disusun dan sulit dibandingkan.",
    solution: "Membuat struktur data, metrik inti, dan visualisasi yang mudah dipahami oleh stakeholder.",
    implementation: "Menggunakan Microsoft Excel, HRIS export, dan dashboard reporting untuk memantau tren SDM.",
    resultsText: "Pelaporan lebih cepat, insight lebih jelas, dan keputusan HR dapat dibuat dengan konteks data yang lebih lengkap.",
    metrics: [
      { label: "Sumber Data Terintegrasi", value: "6", unit: "+" },
      { label: "Dashboard & Visualisasi", value: "12", unit: "+" },
      { label: "Peningkatan Kecepatan Pelaporan", value: "30", unit: "%" },
    ],
    results: ["Laporan HR bulanan lebih konsisten.", "Stakeholder dapat membaca performa SDM dalam satu tampilan.", "Risiko turnover lebih cepat teridentifikasi."],
    challenges: ["Konsolidasi format data berbeda.", "Menjaga dashboard tetap sederhana untuk pengguna non-teknis."],
    tools: ["Data Analytics", "Dashboard", "HR Metrics", "Power BI"],
    isFeatured: true,
    sortOrder: 1,
  },
  {
    category: { name: "Recruitment", slug: "recruitment" },
    title: "Recruitment Process Improvement",
    slug: "recruitment-process-improvement",
    shortDescription: "Merancang ulang proses rekrutmen untuk meningkatkan efisiensi, kualitas kandidat, dan candidate experience.",
    year: 2024,
    duration: "6 minggu",
    status: ProjectStatus.COMPLETED,
    role: "HR Specialist",
    metrics: [{ label: "Posisi Terisi", value: "25", unit: "+" }],
    results: ["Pipeline kandidat lebih rapi.", "Komunikasi kandidat lebih cepat."],
    challenges: ["Koordinasi kebutuhan lintas user."],
    tools: ["Recruitment", "Process Improvement", "HR Strategy"],
    isFeatured: false,
    sortOrder: 2,
  },
  {
    category: { name: "People Development", slug: "people-development-project" },
    title: "Leadership Training Program",
    slug: "leadership-training-program",
    shortDescription: "Merancang program pelatihan kepemimpinan berbasis kompetensi untuk meningkatkan leadership capability.",
    year: 2023,
    duration: "10 minggu",
    status: ProjectStatus.COMPLETED,
    role: "Learning & Development",
    metrics: [{ label: "Peserta Training", value: "40", unit: "+" }],
    results: ["Materi training lebih aplikatif.", "Follow-up action plan terukur."],
    challenges: ["Menjaga keterlibatan peserta selama program."],
    tools: ["L&D", "Leadership", "Training"],
    isFeatured: false,
    sortOrder: 3,
  },
  {
    category: { name: "Onboarding", slug: "onboarding" },
    title: "Employee Onboarding System",
    slug: "employee-onboarding-system",
    shortDescription: "Mengembangkan sistem onboarding digital untuk mempercepat adaptasi karyawan baru dan meningkatkan pengalaman kerja awal.",
    year: 2023,
    duration: "5 minggu",
    status: ProjectStatus.COMPLETED,
    role: "HR Generalist",
    metrics: [{ label: "Waktu Adaptasi Lebih Cepat", value: "20", unit: "%" }],
    results: ["Checklist onboarding menjadi standar.", "Karyawan baru mendapat arahan lebih jelas."],
    challenges: ["Menyatukan kebutuhan tiap divisi."],
    tools: ["Onboarding", "Digital System", "Employee Experience"],
    isFeatured: false,
    sortOrder: 4,
  },
  {
    category: { name: "HR Analytics", slug: "hr-analytics" },
    title: "People Analytics Reporting",
    slug: "people-analytics-reporting",
    shortDescription: "Menyusun laporan people analytics untuk mengidentifikasi tren SDM dan peluang perbaikan berbasis data.",
    year: 2022,
    duration: "4 minggu",
    status: ProjectStatus.COMPLETED,
    role: "HR Analyst",
    metrics: [{ label: "Insight Operasional", value: "15", unit: "+" }],
    results: ["Data absensi dan headcount lebih mudah dipantau.", "Pola kebutuhan tenaga kerja lebih terlihat."],
    challenges: ["Merapikan data historis yang belum konsisten."],
    tools: ["People Analytics", "Reporting", "Insights"],
    isFeatured: false,
    sortOrder: 5,
  },
];

const achievements = [
  { title: "Talent Acquisition Excellence", description: "Membangun pipeline talenta berkualitas dan menempatkan 25+ posisi strategis.", value: "25", unit: "+", year: 2024, category: "Rekrutmen", icon: "users", sortOrder: 1 },
  { title: "Employee Engagement Improvement", description: "Meningkatkan engagement score sebesar 20% melalui program berbasis data.", value: "20", unit: "%", year: 2024, category: "Engagement", icon: "target", sortOrder: 2 },
  { title: "Learning & Development Impact", description: "Merancang 6+ program pelatihan yang meningkatkan kompetensi dan kesiapan karyawan.", value: "6", unit: "+", year: 2023, category: "Pengembangan", icon: "education", sortOrder: 3 },
  { title: "HR Process Optimization", description: "Mengoptimalkan proses HR sehingga efisiensi operasional meningkat signifikan.", value: "30", unit: "%", year: 2023, category: "Proses", icon: "settings", sortOrder: 4 },
  { title: "Policy & Compliance Strengthening", description: "Menyusun SOP dan kebijakan HR untuk memastikan kepatuhan dan tata kelola.", value: "10", unit: "+", year: 2022, category: "Kebijakan", icon: "document", sortOrder: 5 },
  { title: "HR Analytics Driven Decisions", description: "Memanfaatkan data dan analitik untuk mendukung pengambilan keputusan strategis.", value: "90", unit: "%", year: 2022, category: "Data & Analitik", icon: "chart", sortOrder: 6 },
];

const certifications = [
  { name: "HR Management Professional (HRMP)", issuer: "Human Resources Certification Institute (HRCI)", issuedAt: new Date("2023-05-20"), year: 2023, description: "Sertifikasi unggulan untuk memperkuat kompetensi manajemen HR.", isFeatured: true, sortOrder: 1 },
  { name: "Training of Trainer (TOT)", issuer: "BNSP - LSP MSDM", issuedAt: new Date("2022-08-12"), year: 2022, description: "Kompetensi fasilitasi pelatihan dan desain pembelajaran.", isFeatured: false, sortOrder: 2 },
  { name: "Recruitment & Selection", issuer: "HR Academy", issuedAt: new Date("2021-04-10"), year: 2021, description: "Penguatan proses rekrutmen, seleksi, dan interview berbasis kompetensi.", isFeatured: false, sortOrder: 3 },
  { name: "People Analytics", issuer: "Coursera", issuedAt: new Date("2023-01-15"), year: 2023, description: "Dasar people analytics untuk pengambilan keputusan HR berbasis data.", isFeatured: false, sortOrder: 4 },
  { name: "HR Certification", issuer: "Badan Kepegawaian Negara (BKN)", issuedAt: new Date("2020-11-11"), year: 2020, description: "Sertifikasi dasar tata kelola administrasi dan kepatuhan HR.", isFeatured: false, sortOrder: 5 },
];

const blogPosts = [
  {
    category: { name: "Employee Engagement", slug: "employee-engagement" },
    title: "5 Cara Meningkatkan Employee Engagement di Perusahaan",
    slug: "5-cara-meningkatkan-employee-engagement-di-perusahaan",
    excerpt: "Employee engagement yang tinggi berdampak langsung pada produktivitas, retensi, dan budaya kerja.",
    content: "Employee engagement perlu dibangun melalui komunikasi yang jelas, apresiasi, ruang bertumbuh, leadership yang konsisten, dan pengukuran berkala.",
    readingTime: 6,
    isFeatured: true,
    publishedAt: new Date("2024-05-20"),
    tags: ["Engagement", "Culture", "People Growth"],
  },
  {
    category: { name: "Talent Management", slug: "talent-management" },
    title: "Panduan Membuat Job Description yang Efektif",
    slug: "panduan-membuat-job-description-yang-efektif",
    excerpt: "Job description yang jelas membantu menarik talent yang tepat dan menyelaraskan ekspektasi sejak awal.",
    content: "Job description efektif memuat tujuan posisi, tanggung jawab utama, kompetensi, indikator keberhasilan, dan konteks kerja.",
    readingTime: 5,
    isFeatured: false,
    publishedAt: new Date("2024-05-15"),
    tags: ["Recruitment", "Talent"],
  },
  {
    category: { name: "Onboarding", slug: "onboarding-blog" },
    title: "Strategi Onboarding yang Membuat Karyawan Betah",
    slug: "strategi-onboarding-yang-membuat-karyawan-betah",
    excerpt: "Onboarding yang efektif bukan hanya orientasi, tetapi membangun koneksi dan mempercepat adaptasi karyawan baru.",
    content: "Onboarding yang baik menyatukan persiapan sebelum hari pertama, buddy system, checklist peran, dan evaluasi 30-60-90 hari.",
    readingTime: 5,
    isFeatured: false,
    publishedAt: new Date("2024-05-08"),
    tags: ["Onboarding", "Employee Experience"],
  },
  {
    category: { name: "HR Strategy", slug: "hr-strategy" },
    title: "Peran HR dalam Transformasi Digital",
    slug: "peran-hr-dalam-transformasi-digital",
    excerpt: "HR memiliki peran kunci dalam menyiapkan talenta dan budaya organisasi di era digital.",
    content: "Transformasi digital membutuhkan kesiapan kompetensi, perubahan cara kerja, komunikasi, dan dukungan data dari fungsi HR.",
    readingTime: 6,
    isFeatured: false,
    publishedAt: new Date("2024-05-01"),
    tags: ["HR Strategy", "Digital"],
  },
  {
    category: { name: "Learning & Development", slug: "learning-development" },
    title: "Mengukur ROI Program Pelatihan Karyawan",
    slug: "mengukur-roi-program-pelatihan-karyawan",
    excerpt: "Ketahui cara mengukur dampak pelatihan terhadap kinerja dan hasil bisnis secara nyata.",
    content: "ROI pelatihan bisa dilihat dari perubahan perilaku kerja, peningkatan performa, efisiensi, dan pencapaian indikator bisnis.",
    readingTime: 4,
    isFeatured: false,
    publishedAt: new Date("2024-04-25"),
    tags: ["L&D", "Performance"],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set before running seed.");
  }

  await prisma.profile.updateMany({ data: { isActive: false } });
  const existingProfile = await prisma.profile.findFirst({ where: { name: "Ahamad Fadillah Harahap" } });
  const profileData = {
    name: "Ahamad Fadillah Harahap",
    professionalTitle: "Human Resources Professional",
    headline: "Lulusan S1 Agribisnis UMSU",
    shortDescription: "Saya adalah profesional Human Resources yang berfokus pada pengelolaan talenta, pengembangan budaya kerja, dan mendorong pertumbuhan karyawan serta organisasi secara berkelanjutan.",
    about: "Saya adalah profesional Human Resources yang berfokus pada pengelolaan talenta, pengembangan budaya kerja, dan mendorong pertumbuhan karyawan serta organisasi secara berkelanjutan. Dengan kombinasi analitis, empati, dan pemahaman bisnis, saya berkomitmen untuk menciptakan pengalaman kerja yang positif dan berkinerja tinggi.",
    workPhilosophy: "HR bukan hanya tentang administrasi, tapi tentang menciptakan dampak yang menggerakkan organisasi dan manusia.",
    professionalValues: ["Integritas", "Kolaborasi", "Pengembangan", "Dampak"],
    careerGoals: "Membangun praktik HR yang strategis, berbasis data, dan tetap dekat dengan kebutuhan manusia di dalam organisasi.",
    specializations: ["Talent Acquisition", "People Development", "Employee Relations", "HR Analytics"],
    languages: ["Indonesia", "English"],
    location: "Medan, Sumatera Utara, Indonesia",
    publicEmail: "afadillah117@gmail.com",
    whatsapp: "6287768885573",
    linkedin: "https://www.linkedin.com/",
    availabilityStatus: "Human Resources • People Growth",
    metaTitle: "Ahamad Fadillah Harahap - Portofolio HR",
    metaDescription: "Portofolio profesional Human Resources yang menampilkan pengalaman, proyek, pencapaian, sertifikasi, dan insight HR.",
    isActive: true,
    deletedAt: null,
  };
  await (existingProfile
    ? prisma.profile.update({ where: { id: existingProfile.id }, data: profileData })
    : prisma.profile.create({ data: profileData }));

  await prisma.navigationItem.deleteMany({ where: { location: { in: ["header", "footer"] } } });
  await prisma.navigationItem.createMany({
    data: [
      ...navItems,
      ...navItems.map((item) => ({ ...item, location: "footer" })),
    ],
  });

  await prisma.socialLink.deleteMany({ where: { label: { in: ["Instagram", "WhatsApp", "Email"] } } });
  await prisma.socialLink.createMany({
    data: [
      { label: "Instagram", url: "https://instagram.com/ahmad_harahaap", icon: "instagram", sortOrder: 1 },
      { label: "WhatsApp", url: "https://wa.me/6287768885573", icon: "whatsapp", sortOrder: 2 },
      { label: "Email", url: "mailto:afadillah117@gmail.com", icon: "mail", sortOrder: 3 },
    ],
  });

  await prisma.statistic.deleteMany({ where: { label: { in: statistics.map((item) => item.label) } } });
  await prisma.statistic.createMany({ data: statistics });

  const categoryBySlug = new Map<string, string>();
  for (const item of expertise) {
    const category = await prisma.expertiseCategory.upsert({
      where: { slug: item.slug },
      update: { name: item.category, isActive: true },
      create: { name: item.category, slug: item.slug, isActive: true },
    });
    categoryBySlug.set(item.slug, category.id);
  }
  await prisma.expertise.deleteMany({ where: { name: { in: expertise.map((item) => item.name) } } });
  await prisma.expertise.createMany({
    data: expertise.map((item) => ({
      categoryId: categoryBySlug.get(item.slug),
      name: item.name,
      description: item.description,
      level: item.level,
      sortOrder: item.sortOrder,
      isActive: true,
      deletedAt: null,
    })),
  });

  await prisma.experience.deleteMany({ where: { companyName: { in: experiences.map((item) => item.companyName) } } });
  for (const item of experiences) {
    await prisma.experience.create({
      data: {
        companyName: item.companyName,
        position: item.position,
        employmentType: EmploymentType.FULL_TIME,
        location: item.location,
        workMode: WorkMode.ONSITE,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.isCurrent,
        description: item.description,
        tools: item.tools,
        sortOrder: item.sortOrder,
        isPublished: true,
        deletedAt: null,
        responsibilities: { create: item.responsibilities.map((content, sortOrder) => ({ content, sortOrder: sortOrder + 1 })) },
        achievements: { create: item.achievements.map((content, sortOrder) => ({ content, sortOrder: sortOrder + 1 })) },
      },
    });
  }

  for (const item of projects) {
    const category = await prisma.projectCategory.upsert({
      where: { slug: item.category.slug },
      update: { name: item.category.name, isActive: true },
      create: { name: item.category.name, slug: item.category.slug, isActive: true },
    });
    const project = await prisma.project.upsert({
      where: { slug: item.slug },
      update: {
        categoryId: category.id,
        title: item.title,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        organization: item.organization,
        year: item.year,
        duration: item.duration,
        status: item.status,
        role: item.role,
        problem: item.problem,
        solution: item.solution,
        implementation: item.implementation,
        tools: item.tools,
        resultsText: item.resultsText,
        isFeatured: item.isFeatured,
        isPublished: true,
        sortOrder: item.sortOrder,
        deletedAt: null,
      },
      create: {
        categoryId: category.id,
        title: item.title,
        slug: item.slug,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        organization: item.organization,
        year: item.year,
        duration: item.duration,
        status: item.status,
        role: item.role,
        problem: item.problem,
        solution: item.solution,
        implementation: item.implementation,
        tools: item.tools,
        resultsText: item.resultsText,
        isFeatured: item.isFeatured,
        isPublished: true,
        sortOrder: item.sortOrder,
      },
    });
    await prisma.projectMetric.deleteMany({ where: { projectId: project.id } });
    await prisma.projectResult.deleteMany({ where: { projectId: project.id } });
    await prisma.projectChallenge.deleteMany({ where: { projectId: project.id } });
    await prisma.projectTool.deleteMany({ where: { projectId: project.id } });
    await prisma.projectMetric.createMany({ data: item.metrics.map((metric) => ({ projectId: project.id, ...metric })) });
    await prisma.projectResult.createMany({ data: item.results.map((content, sortOrder) => ({ projectId: project.id, content, sortOrder: sortOrder + 1 })) });
    await prisma.projectChallenge.createMany({ data: item.challenges.map((content, sortOrder) => ({ projectId: project.id, content, sortOrder: sortOrder + 1 })) });
    await prisma.projectTool.createMany({ data: item.tools.map((name) => ({ projectId: project.id, name })) });
  }

  await prisma.achievement.deleteMany({ where: { title: { in: achievements.map((item) => item.title) } } });
  await prisma.achievement.createMany({ data: achievements.map((item) => ({ ...item, isFeatured: item.sortOrder <= 3, isPublished: true, deletedAt: null })) });

  await prisma.certification.deleteMany({ where: { name: { in: certifications.map((item) => item.name) } } });
  await prisma.certification.createMany({
    data: certifications.map(({ year: _year, ...item }) => ({ ...item, neverExpires: true, isPublished: true, deletedAt: null })),
  });

  for (const item of blogPosts) {
    const category = await prisma.blogCategory.upsert({
      where: { slug: item.category.slug },
      update: { name: item.category.name, isActive: true },
      create: { name: item.category.name, slug: item.category.slug, isActive: true },
    });
    const post = await prisma.blogPost.upsert({
      where: { slug: item.slug },
      update: {
        categoryId: category.id,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        author: "Ahamad Fadillah Harahap",
        status: PublishStatus.PUBLISHED,
        publishedAt: item.publishedAt,
        readingTime: item.readingTime,
        isFeatured: item.isFeatured,
        deletedAt: null,
      },
      create: {
        categoryId: category.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        author: "Ahamad Fadillah Harahap",
        status: PublishStatus.PUBLISHED,
        publishedAt: item.publishedAt,
        readingTime: item.readingTime,
        isFeatured: item.isFeatured,
      },
    });
    await prisma.blogPostTag.deleteMany({ where: { postId: post.id } });
    for (const tagName of item.tags) {
      const slug = tagName.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const tag = await prisma.blogTag.upsert({
        where: { slug },
        update: { name: tagName },
        create: { name: tagName, slug },
      });
      await prisma.blogPostTag.create({ data: { postId: post.id, tagId: tag.id } });
    }
  }

  await prisma.dashboardWidget.deleteMany({ where: { title: { in: ["Recruitment Funnel", "Employee Engagement", "Training Coverage"] } } });
  await prisma.dashboardWidget.create({
    data: {
      title: "Recruitment Funnel",
      period: "2024",
      widgetType: WidgetType.BAR,
      sortOrder: 1,
      datasets: {
        create: [
          { label: "Applied", value: 120, color: "#C84B31", sortOrder: 1 },
          { label: "Screening", value: 65, color: "#2D2A26", sortOrder: 2 },
          { label: "Interview", value: 32, color: "#A86F5C", sortOrder: 3 },
          { label: "Hired", value: 12, color: "#B77729", sortOrder: 4 },
        ],
      },
    },
  });
  await prisma.dashboardWidget.create({
    data: {
      title: "Employee Engagement",
      period: "Q2 2024",
      widgetType: WidgetType.LINE,
      sortOrder: 2,
      datasets: {
        create: [
          { label: "Jan", value: 72, color: "#C84B31", sortOrder: 1 },
          { label: "Feb", value: 76, color: "#2D2A26", sortOrder: 2 },
          { label: "Mar", value: 81, color: "#A86F5C", sortOrder: 3 },
        ],
      },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "site_tagline" },
    update: { value: "Empowering People, Growing Together.", isPublic: true },
    create: { key: "site_tagline", value: "Empowering People, Growing Together.", isPublic: true },
  });
}

main()
  .then(() => console.log("Portfolio seed completed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
