'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Auth from '../app/login/auth';
import { getUserRole } from '@/utils/roles'; // Import function to get user role

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const userRole = getUserRole(); 

  useEffect(() => {
    //these dont require authentication
    const publicRoutes = ['/login', '/forgot-password'];

    // define role-based protected routes
    // const roleBasedRoutes: Record<string, string[]> = {
    //   admin: ['/create_quiz', '/manage_users', '/dashboard_test', '/people'], // Admin can access these
    //   ta: ['/create_quiz', '/dashboard_test', '/gradeables'], // TA can access this
    //   student: ['/dashboard_test'], // Redirect students here
    // };

    // If the user is not logged in, redirect to login
    if (!Auth.isLoggedIn() || !Auth.isTokenValid()) {
      router.push('/login');
      return;
    }

    // Check if the current route requires a specific role
    //const allowedRoutes = roleBasedRoutes[userRole] || [];
   //const isAuthorized = allowedRoutes.includes(pathname) || publicRoutes.includes(pathname);

    // If the user is not authorized for the route, redirect them
    // if (!isAuthorized) {
    //   router.push('/dashboard_test'); // Redirect unauthorized users
    // }
  }, [pathname, router, userRole]);

  return <>{children}</>;
}
