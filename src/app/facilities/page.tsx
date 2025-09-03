'use client';

import { useEffect } from 'react';

export default function FacilitiesPage() {
  useEffect(() => {
    window.location.hash = '/facilities';
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return null;
}