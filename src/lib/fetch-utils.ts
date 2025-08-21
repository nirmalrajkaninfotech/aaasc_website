// Utility function for fetch calls with proper caching
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const fetchOptions: RequestInit = {
    ...options,
    cache: isDevelopment ? 'no-store' : 'force-cache',
    next: isDevelopment ? undefined : { revalidate: 3600 } // Revalidate every hour in production
  };

  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Utility function for API calls that should always use caching
export async function fetchWithAlwaysCache<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const fetchOptions: RequestInit = {
    ...options,
    cache: 'force-cache',
    next: { revalidate: 3600 } // Revalidate every hour
  };

  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
