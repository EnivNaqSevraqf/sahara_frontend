'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function FeedbackPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      // Redirect based on role
      if (role === 'prof' || role === 'ta') {
        router.push('/dashboard_test/feedback/admin');
      } else {
        router.push('/dashboard_test/feedback/student');
      }
    } else {
      // If no role is found, redirect to login
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}