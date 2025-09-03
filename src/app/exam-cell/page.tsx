'use client';

import { useEffect } from 'react';

export default function ExamCellPageRedirect() {
  useEffect(() => {
    window.location.hash = '/exam-cell';
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return null;
}
