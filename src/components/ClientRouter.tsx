'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface Route {
  path: string;
  component: ReactNode;
}

interface ClientRouterProps {
  routes: Route[];
  fallback?: ReactNode;
}

export default function ClientRouter({ routes, fallback }: ClientRouterProps) {
  const pathname = usePathname();
  const [currentRoute, setCurrentRoute] = useState<ReactNode>(null);

  useEffect(() => {
    const route = routes.find(r => r.path === pathname);
    if (route) {
      setCurrentRoute(route.component);
    } else {
      setCurrentRoute(fallback || <div>Page not found</div>);
    }
  }, [pathname, routes, fallback]);

  return <>{currentRoute}</>;
}