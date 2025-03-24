'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Auth from '../app/login/auth'; // Adjust the import path as needed

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // List of public routes that don't require authentication
    const publicRoutes = ['/login','/forgot-password'];

    // Check if the current route is a public route
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not a public route, check authentication
    if (!isPublicRoute) {
      // Check if user is logged in and token is valid
      if (!Auth.isLoggedIn() || !Auth.isTokenValid()) {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}