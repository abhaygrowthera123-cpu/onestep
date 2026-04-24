/**
 * Resolves an image path to a full URL.
 * - External URLs (http/https) are returned as-is.
 * - Local upload paths are prefixed with the backend base URL from env or window.location.
 */
export function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // In production the frontend and backend share the same origin.
  // In dev, Vite proxies /api but not /uploads, so we need the explicit port.
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
}
