import type { MetadataRoute } from "next";

const BASE_URL = "https://www.icrcustomcreations.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/orders",
          "/account",
          "/login",
          "/register",
          "/forgot-password",
          "/api/",
          "/r/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/photos/", "/templates/", "/logo.png"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
