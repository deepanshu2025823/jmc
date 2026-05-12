/**
 * Single source of truth for the site's base URL + branding,
 * used across SEO (metadata, sitemap, JSON-LD, OG tags).
 *
 * Override via env:
 *   NEXT_PUBLIC_STORE_URL  — preferred (canonical https://jmcskinsecrets.com)
 *   NEXTAUTH_URL           — fallback used elsewhere in the app
 */

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_STORE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://jmcskinsecrets.com"
).replace(/\/$/, "");

export const SITE_NAME = process.env.STORE_NAME || "JMC Secret Rituals";

export const SITE_TAGLINE = "Luxury Skincare Rituals";

export const SITE_DESCRIPTION =
  "Experience the art of skincare with JMC Secret Rituals — dermatologist-tested, ingredient-led formulations for radiant, healthy skin.";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
