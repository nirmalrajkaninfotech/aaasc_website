// Base URL for API requests
export function getBaseUrl(): string {
  // In the browser, we'll use relative URLs
  if (typeof window !== 'undefined') return '';
  
  // Get the site URL from the environment or runtime config
  const siteUrl = 
    process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof window === 'undefined' && (require('next/config').default().publicRuntimeConfig.NEXT_PUBLIC_SITE_URL)) ||
    'http://localhost:3000';
    
  return siteUrl;
}

interface FetchApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<T> {
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // For server-side requests, we need to use the full URL
  const baseUrl = getBaseUrl();
  const url = typeof window === 'undefined' 
    ? `${baseUrl}${path}`
    : path;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // For server-side requests, add the host header
  if (typeof window === 'undefined') {
    try {
      const host = new URL(baseUrl).host;
      if (host) {
        headers.host = host;
      }
    } catch (error) {
      console.error('Error parsing base URL:', error);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }

  return response.json();
}
