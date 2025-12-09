
// Base API URL for the application
export const API_BASE_URL = "https://apiaasc.veetusaapadu.in/";

// Helper function to get full image URL
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If the path is already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Ensure API_BASE_URL ends with a single slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${baseUrl}${cleanPath}`;
};
