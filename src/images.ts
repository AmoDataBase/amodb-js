import { DEFAULT_IMAGE_BASE_URL } from './constants';
import type { ImageSize } from './options';

/**
 * Builds an image URL: `https://img.amodb.dev/t/p/{size}{path}`.
 * Returns null for a null, undefined or empty path. A missing leading slash is added.
 */
export function imageUrl(
  path: string | null | undefined,
  size: ImageSize = 'w500',
  baseUrl: string = DEFAULT_IMAGE_BASE_URL,
): string | null {
  if (!path) return null;
  const file = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/+$/, '')}/${size}${file}`;
}
