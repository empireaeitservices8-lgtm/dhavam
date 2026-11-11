const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).trim().replace(/\/+$/, "");

/** Accepts a full URL, relative API path, or filename and always returns a valid image URL. */
export function imageSrc(image?: string | null): string {
  if (!image) return "";
  const trimmed = image.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("/")) {
    return API_URL ? `${API_URL}${trimmed}` : trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    return API_URL ? `${API_URL}/${trimmed}` : `/${trimmed}`;
  }

  return API_URL
    ? `${API_URL}/uploads/${encodeURIComponent(trimmed)}`
    : `/uploads/${encodeURIComponent(trimmed)}`;
}
