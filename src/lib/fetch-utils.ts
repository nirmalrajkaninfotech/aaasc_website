// Default fallback data for when API is not available
const defaultFallback = {
  error: 'API not available',
  message: 'The requested data is not available at the moment. Please try again later.'
};

// Utility function for fetch calls with proper caching and fallback
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: any = defaultFallback
): Promise<T> {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isStaticExport = process.env.NEXT_PHASE === 'phase-export';
    
    // For static export, return fallback data immediately
    if (isStaticExport) {
      console.warn(`[Static Export] Using fallback data for: ${url}`);
      return fallbackData as T;
    }
    
    const fetchOptions: RequestInit = {
      ...options,
      cache: isDevelopment ? 'no-store' : 'force-cache',
      next: isDevelopment ? undefined : { revalidate: 3600 } // Revalidate every hour in production
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      console.error(`[fetchWithCache] Error fetching ${url}: ${response.status} ${response.statusText}`);
      return fallbackData as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[fetchWithCache] Error in fetch for ${url}:`, error);
    return fallbackData as T;
  }
}

// Utility function for API calls that should always use caching with fallback
export async function fetchWithAlwaysCache<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: any = defaultFallback
): Promise<T> {
  try {
    const isStaticExport = process.env.NEXT_PHASE === 'phase-export';
    
    // For static export, return fallback data immediately
    if (isStaticExport) {
      console.warn(`[Static Export] Using fallback data for: ${url}`);
      return fallbackData as T;
    }
    
    const fetchOptions: RequestInit = {
      ...options,
      cache: 'force-cache',
      next: { revalidate: 3600 } // Revalidate every hour
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      console.error(`[fetchWithAlwaysCache] Error fetching ${url}: ${response.status} ${response.statusText}`);
      return fallbackData as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[fetchWithAlwaysCache] Error in fetch for ${url}:`, error);
    return fallbackData as T;
  }
}

// Helper function to create a fallback response
export function createFallbackResponse<T>(data: Partial<T> = {}, message: string = ''): T {
  return {
    ...defaultFallback,
    ...data,
    message: message || defaultFallback.message,
    _isFallback: true
  } as unknown as T;
}
