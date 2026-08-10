import type { MetadataRoute } from "next";
const routes = ["", "/program", "/courses", "/trainers", "/about", "/admissions", "/contact", "/privacy", "/terms", "/disclaimer"];
export default function sitemap(): MetadataRoute.Sitemap { return routes.map(route => ({ url: `https://www.saitechlabs.in${route}`, lastModified: new Date("2026-08-10"), changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : 0.8 })); }
