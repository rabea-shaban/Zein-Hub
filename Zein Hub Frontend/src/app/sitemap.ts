import { MetadataRoute } from "next";
import { getPrograms, getSiteConfig } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteConfig = getSiteConfig();
  const baseUrl = siteConfig.url;

  const staticRoutes = [
    "",
    "/programs",
    "/about",
    "/instructors",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const programRoutes = getPrograms().map((program) => ({
    url: `${baseUrl}/programs/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...programRoutes];
}
