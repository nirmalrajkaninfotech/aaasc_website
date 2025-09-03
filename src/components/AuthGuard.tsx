import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Force full reload to clear any cached state
      window.location.href = '/login?redirect=/admin';
    }
  }, []);

  return <>{children}</>;
}
