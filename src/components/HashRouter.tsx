'use client';

import { useEffect, useState, ReactNode, ComponentType, ReactElement } from 'react';

interface Route {
  path: string;
  // Accept either a ready element (ReactNode) or a component that will be rendered
  // We treat any function as a React component and render it with JSX to respect Rules of Hooks
  component?: ReactNode | ComponentType<{ params?: Record<string, string> }>;
  redirectTo: string; // No longer optional
  requiresAuth?: boolean; // Add auth requirement flag
}

interface HashRouterProps {
  routes: Route[];
  fallback?: ReactNode;
}

export default function HashRouter({ routes, fallback }: HashRouterProps) {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Get initial hash
    const getHashPath = () => {
      const hash = window.location.hash.slice(1); // Remove #
      return hash || '/';
    };

    // Set initial path
    setCurrentPath(getHashPath());

    // Listen for hash changes
    const handleHashChange = () => {
      setCurrentPath(getHashPath());
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Handle redirects FIRST - before any rendering
  useEffect(() => {
    // Check for exact match redirect
    const exactRedirect = routes.find(
      r => r.path === currentPath && r.redirectTo
    );
    
    if (exactRedirect) {
      window.location.href = exactRedirect.redirectTo;
      return;
    }

    // Check for parameterized match redirect
    for (const route of routes) {
      if (!route.redirectTo) continue;
      
      const params = matchPath(route.path, currentPath);
      if (params) {
        window.location.href = route.redirectTo;
        return;
      }
    }
  }, [currentPath, routes]);

  // If we're redirecting, don't render anything
  if (routes.some(route => {
    if (!route.redirectTo) return false;
    return route.path === currentPath || matchPath(route.path, currentPath);
  })) {
    return null;
  }

  // Helper to render a route component properly without invoking it directly
  const renderRoute = (route: Route, params: Record<string, string> = {}) => {
    if (!route.component) {
      return null;
    }
    if (typeof route.component === 'function') {
      const Comp = route.component as ComponentType<{ params?: Record<string, string> }>;
      return <Comp params={params} />;
    }
    return <>{route.component}</>;
  };

  // Try to find an exact match first
  const exactRoute = routes.find(
    route => route.path === currentPath && !route.redirectTo
  );
  if (exactRoute) {
    return renderRoute(exactRoute);
  }

  // Try parameterized match like /gallery/:id
  for (const route of routes) {
    if (route.redirectTo) continue;
    
    const params = matchPath(route.path, currentPath);
    if (params) {
      return renderRoute(route, params);
    }
  }

  return <>{fallback || <div>Page not found</div>}</>;
}

// Navigation helper
export const navigateTo = (path: string) => {
  window.location.hash = path;
};

// Link component for hash-based navigation
interface HashLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function HashLink({ to, children, className, onClick }: HashLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo(to);
    onClick?.();
  };

  return (
    <a href={`#${to}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

// Match paths with ":param" segments. Returns params if matched, otherwise null
function matchPath(pattern: string, path: string): Record<string, string> | null {
  if (!pattern.includes(':')) return null;

  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = path.split('/').filter(Boolean);

  if (patternSegments.length !== pathSegments.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i <patternSegments.length; i++) {
    const p = patternSegments[i];
    const s = pathSegments[i];

    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(s);
      continue;
    }

    if (p !== s) return null;
  }

  return params;
}