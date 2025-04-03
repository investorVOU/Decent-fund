// Helper for handling base URLs, particularly for GitHub Pages deployments

/**
 * Returns the base URL for the application, accounting for
 * GitHub Pages or other deployment environments
 */
export function getBaseUrl(): string {
  // Check for environment variable (defined in .env.production)
  const envBaseUrl = import.meta.env.VITE_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }
  
  // Default to root path if not specified
  return '/';
}

/**
 * Prepends the base URL to a given path
 * @param path The relative path to prepend the base URL to
 * @returns The complete URL with base path
 */
export function withBaseUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Avoid double slashes by handling trailing/leading slashes
  if (baseUrl.endsWith('/') && path.startsWith('/')) {
    return `${baseUrl}${path.substring(1)}`;
  }
  if (!baseUrl.endsWith('/') && !path.startsWith('/')) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
}