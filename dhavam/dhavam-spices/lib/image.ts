const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");

/** Accepts a full URL, relative API path, or filename and always returns a valid image URL. */
export function imageSrc(image?: string | null): string {
  if (!image) return "";
  const trimmed = image.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("/")) {
    return `${API_URL}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `${API_URL}/${trimmed}`;
  }

  return `${API_URL}/uploads/${encodeURIComponent(trimmed)}`;
}
