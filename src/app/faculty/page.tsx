'use client';

import { useEffect } from 'react';

export default function FacultyPage() {
  useEffect(() => {
    window.location.hash = '/faculty';
    // If served without SPA shell, also push to root so HashRouter takes over
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return null;
}
