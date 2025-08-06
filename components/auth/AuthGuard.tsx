'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading

  useLayoutEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === null) return null; // or <Loading />
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
