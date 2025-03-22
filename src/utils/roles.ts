'use client';

// User role types
export type UserRole = 'user' | 'student' | 'TA' | 'ta' | 'admin';

/**
 * Get the current user's role from local storage
 * @returns The user role or 'student' as default if not found
 */
export function getUserRole(): UserRole {
  // if (typeof window !== 'undefined') {
    const role = localStorage.getItem('userRole');
    if (role === 'user' || role === 'student' || role === 'TA' || role === 'ta' || role === 'admin') {
      return role as UserRole;
    }
  // }
  return 'student'; // Default role
}

/**
 * Set the user role in local storage
 */
export function setUserRole(role: UserRole): void {
  // if (typeof window !== 'undefined') {
    localStorage.setItem('userRole', role);
  // }
}

/**
 * Normalize role name for consistent usage across the application
 * (e.g., 'TA' and 'ta' are treated the same)
 */
export function normalizeRole(role: UserRole): 'student' | 'ta' | 'admin' {
  if (role === 'user' || role === 'student') {
    return 'student';
  } else if (role === 'TA' || role === 'ta') {
    return 'ta';
  }
  return role;
}