import path from "path";

// Locally this defaults to public/uploads (simple, no setup needed for dev).
// In production, set UPLOADS_DIR to a path inside your persisted volume
// (e.g. /app/data/uploads) — see DEPLOY.md.
export function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "public", "uploads");
}

export const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
