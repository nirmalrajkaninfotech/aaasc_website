'use client';

import { useEffect, useState, ReactNode } from 'react';

interface Route {
  path: string;
  component: ReactNode | ((params: Record<string, string>) => ReactNode);
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

  // Try to find an exact match first
  const exactRoute = routes.find(route => route.path === currentPath);
  if (exactRoute) {
    return <>{typeof exactRoute.component === 'function' ? (exactRoute.component as (p: Record<string, string>) => ReactNode)({}) : exactRoute.component}</>;
  }

  // Try parameterized match like /gallery/:id
  for (const route of routes) {
    const params = matchPath(route.path, currentPath);
    if (params) {
      if (typeof route.component === 'function') {
        return <>{(route.component as (p: Record<string, string>) => ReactNode)(params)}</>;
      }
      return <>{route.component}</>;
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

  for (let i = 0; i < patternSegments.length; i++) {
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