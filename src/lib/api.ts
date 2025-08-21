// Base URL for API requests
export function getBaseUrl(): string {
  // In the browser, we'll use relative URLs
  if (typeof window !== 'undefined') return '';
  
  // In Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // In local development or other environments
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
  
  // Get base URL
  const baseUrl = getBaseUrl();
  
  // Construct the full URL for server-side requests
  const url = typeof window === 'undefined' 
    ? `${baseUrl}${path}`
    : path;

  // Get any existing headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // For server-side requests, ensure proper headers
  if (typeof window === 'undefined') {
    try {
      // Get the session cookie from the environment if it exists
      const adminSession = process.env.ADMIN_SESSION_COOKIE;
      
      // Add the session cookie to the request if available
      if (adminSession) {
        requestHeaders['Cookie'] = `admin_session=${adminSession}`;
      }

      // In Vercel, we need to set the host header
      if (process.env.VERCEL) {
        const { host } = new URL(baseUrl);
        if (host) {
          requestHeaders.host = host;
        }
        // Add Vercel specific headers if needed
        if (process.env.VERCEL_ENV) {
          requestHeaders['x-vercel-deployment-url'] = process.env.VERCEL_URL || '';
        }
      }
    } catch (error) {
      console.error('Error setting up request headers:', error);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }

  return response.json();
}
