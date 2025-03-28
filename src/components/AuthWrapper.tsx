'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Auth from '../app/login/auth';
import axios from 'axios';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicRoutes = ['/login', '/forgot-password'];

    // If the user is not logged in, redirect to login
    if (!Auth.isLoggedIn() || !Auth.isTokenValid()) {
      router.push('/login');
      return;
    }

    // If it's a public route, allow access
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // Add axios interceptor to handle 403 responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          console.log('Access denied:', pathname);
          router.push('/dashboard');
        }
        else if (error.response?.status === 401) {
          console.log('Unauthorized:', pathname);
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [pathname, router]);

  return <>{children}</>;
}
