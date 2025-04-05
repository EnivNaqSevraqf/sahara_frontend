'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import ProfessorAssignmentList from './professor';
import StudentAssignmentList from './student';

export default function AssignmentsList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const rrole = localStorage.getItem('role');
    // setRole(localStorage.getItem('role'));
    console.log("Role:", rrole);
    
    if (rrole) {
      // Redirect based on role
      // if (role === 'prof' || role === 'ta') {
      //   // router.push('/dashboard/feedback/admin');
      //   return <ProfessorSubmissionList />;
      // } else {
      //   // router.push('/dashboard/feedback/student');

      // }
      setRole(rrole);
      console.log("Role found:", rrole);
      setLoading(false);
    } else {
      // If no role is found, redirect to login
      console.log("Redirecting to login");
      // router.push('/login');
    }
  }, [router]);

  if(loading) {
    // Show loading state while checking role
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if(role === 'prof' || role === 'ta') {
    return <ProfessorAssignmentList />;
  } else if(role === 'student') {
    return <StudentAssignmentList />;
  }

  // Show loading state while redirecting
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}