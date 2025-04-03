// Helper for handling base URLs, particularly for GitHub Pages and Vercel deployments

/**
 * Returns the base URL for the application, accounting for
 * GitHub Pages, Vercel, or other deployment environments
 */
export function getBaseUrl(): string {
  // Check for environment variable (defined in .env.production)
  const envBaseUrl = import.meta.env.VITE_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }
  
  // Check for Vercel deployment
  if (window.location.hostname.includes('vercel.app')) {
    // In Vercel, we serve the API from the same domain, so use the current origin
    return window.location.origin;
  }
  
  // Default to root path if not in any special environment
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