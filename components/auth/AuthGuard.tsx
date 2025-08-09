'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios/apiClient';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading

  useLayoutEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get("/accounts/authorize");
        if (response.data.status) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.href = "https://ai.physio";
        }
      } catch (error) {
        setIsAuthenticated(false);
        window.location.href = "https://ai.physio";

      }
    }
    checkAuth();
  }, []);

  if (isAuthenticated === null) return null; // or <Loading />
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
