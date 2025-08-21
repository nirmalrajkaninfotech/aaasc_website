// Base API URL for the application
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aasc.veetusaapadu.in';

// Helper function to get full image URL
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If the path is already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // If path starts with a forward slash, append directly to base URL
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  
  // For relative paths, add a slash between base URL and path
  return `${API_BASE_URL}/${path}`;
};
