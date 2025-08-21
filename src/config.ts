// Base API URL for the application
// Use relative URL for API routes in the same domain
const getBaseUrl = (): string => {
  // In the browser, we'll use relative URLs
  if (typeof window !== 'undefined') return '';
  // On server, use the Vercel URL if available, otherwise default to localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();

// Helper function to get full image URL
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If the path is already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // For server-side rendering, use the full URL with base
  if (typeof window === 'undefined') {
    return path.startsWith('/') 
      ? `${API_BASE_URL}${path}` 
      : `${API_BASE_URL}/${path}`;
  }
  
  // In the browser, use relative URLs for same-origin requests
  return path.startsWith('/') ? path : `/${path}`;
};
