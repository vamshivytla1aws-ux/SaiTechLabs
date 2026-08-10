import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/admin/", "/student/", "/api/student/", "/status/", "/feedback/student/", "/feedback/college/", "/certificate/"] }, sitemap: "https://www.saitechlabs.in/sitemap.xml" }; }
