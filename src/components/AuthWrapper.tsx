'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Auth from '../app/login/auth';
import axios from 'axios';

type UserRole = 'prof' | 'admin' | 'student' | 'ta' | string;

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  
  useEffect(() => {
    const publicRoutes = ['/login', '/forgot-password'];
    const restrictedRoutes: Record<string, Array<UserRole>> = {
      '/dashboard/gradeables': ['prof', 'admin', 'ta'],
      '/dashboard/people/teams': ['prof', 'admin', 'ta'],
      '/dashboard/people/tas': ['prof', 'admin', 'ta'],
      '/dashboard/people/student': ['prof', 'admin','ta'],
      '/dashboard/people/skills': ['prof', 'admin', 'ta'],
      '/dashboard/people/add': ['prof', 'admin', 'ta'],
      '/dashboard/forms/create_form': ['prof', 'admin'],
      '/dashboard/submission/creation': ['prof', 'admin', 'ta'],
      '/dashboard/submission/update': ['prof', 'admin', 'ta'],
      '/dashboard/submission/view': ['prof', 'admin', 'ta'],
      '/dashboard/assignments/creation': ['prof', 'admin', 'ta'],
      '/dashboard/assignments/update': ['prof', 'admin', 'ta'],
      '/dashboard/assignments/view': ['prof', 'admin', 'ta'],
    };
    
    // Enhanced function to check if a path matches a restricted route
    const isRestrictedPath = (path: string): boolean => {
      return Object.keys(restrictedRoutes).some(route => {
        const normalizedPath = path.toLowerCase();
        const normalizedRoute = route.toLowerCase();
        return normalizedPath.startsWith(normalizedRoute);
      });
    };

    // If it's a public route, allow access
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // If the user is not logged in, redirect to login
    if (!Auth.isLoggedIn() || !Auth.isTokenValid()) {
      router.push('/login');
      return;
    }

    const currentUserRole = Auth.getRole() || '';
    
    // Immediate check for student access to any dashboard route
    if (currentUserRole === 'student' && isRestrictedPath(pathname)) {
      console.log('Student access denied to restricted route:', pathname);
      router.push('/dashboard');
      return;
    }

    // Check role permissions for restricted paths
    if (isRestrictedPath(pathname)) {
      const matchingRoute = Object.keys(restrictedRoutes).find(route => 
        pathname.toLowerCase().startsWith(route.toLowerCase())
      );
      
      if (matchingRoute) {
        const allowedRoles = restrictedRoutes[matchingRoute];
        if (!allowedRoles.includes(currentUserRole)) {
          console.log(`Access denied for role ${currentUserRole} on path:`, pathname);
          router.push('/dashboard');
          return;
        }
      }
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
          Auth.logOut();
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