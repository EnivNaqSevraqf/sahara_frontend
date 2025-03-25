'use client';

import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ForumIcon from '@mui/icons-material/Forum';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { ViewQuilt } from '@mui/icons-material';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import useRouter from 'next/router';
import { getUserRole, setUserRole, normalizeRole, type UserRole } from '@/utils/roles';
import { useEffect, useState } from 'react';
import AuthWrapper from '../../components/AuthWrapper';
import "../globals.css";

// Define navigation items based on user role
const getUserNavigation = (userRole: UserRole): Navigation => {
  const role = normalizeRole(userRole);
  
  // Common header for all roles
  const dashboardHeader = {
    kind: 'header' as const,
    title: 'Dashboard',
  };
  
  // Admin navigation items
  if (role === 'admin') {
    return [
      dashboardHeader,
      {
        segment: 'dashboard_test',
        title: 'Overview',
        icon: <DashboardIcon />,
      },
      {
        segment: 'announcements',
        title: 'Announcements',
        icon: <AnnouncementIcon />,
      },
      {
        segment: 'gradeables',
        title: 'Gradeables',
        icon: <AssignmentRoundedIcon />,
      },
      {
        segment: 'forms',
        title: 'Form Management',
        icon: <ViewQuilt />,
      },
      {
        segment: 'people',
        title: 'People',
        icon: <PeopleIcon />,
      },
      {
        segment: 'discussions',
        title: 'Discussions',
        icon: <ForumIcon />,
      },
      {
        segment: 'dashboard_test/calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
        // path: '/calendar',
      },
      {
        kind: 'header' as const,
        title: 'System',
      },
      {
        segment: 'settings',
        title: 'Settings',
        icon: <SettingsRoundedIcon />,
      },
    ];
  } 
  // TA navigation items
  else if (role === 'ta') {
    return [
      dashboardHeader,
      {
        segment: 'dashboard_test',
        title: 'Overview',
        icon: <DashboardIcon />,
      },
      {
        segment: 'gradeables',
        title: 'Gradeables',
        icon: <AssignmentRoundedIcon />,
      },
      {
        segment: 'courses',
        title: 'Courses',
        icon: <SchoolIcon />,
      },
      {
        segment: 'users',
        title: 'Users',
        icon: <PeopleIcon />,
      },
      {
        segment: '/dashboard_test/calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
      },
      {
        kind: 'header' as const,
        title: 'Account',
      },
      {
        segment: 'settings',
        title: 'Settings',
        icon: <SettingsRoundedIcon />,
      },
    ];
  }
  // Student/User navigation items (default)
  else {
    return [
      dashboardHeader,
      {
        segment: 'dashboard_test',
        title: 'Overview',
        icon: <DashboardIcon />,
      },
      {
        segment: 'announcements',
        title: 'Announcements',
        icon: <AnnouncementIcon />,
      },
      {
        segment: 'project',
        title: 'Project',
        icon: <SchoolIcon />,
      },
      {
        segment: 'quizzes',
        title: 'Quizzes',
        icon: <QuizIcon />,
      },
      {
        segment: 'discussions',
        title: 'Discussions', 
        icon: <ForumIcon />,
      },
      {
        segment: '/dashboard_test/calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
        // path: '/calendar',
      },
      {
        segment: 'forms',
        title: 'Forms',
        icon: <ViewQuilt />,
      },
      {
        kind: 'header' as const,
        title: 'Account',
      },
      {
        segment: 'settings',
        title: 'Settings',
        icon: <SettingsRoundedIcon />,
      },
    ];
  }
};

// Theme configuration
const dashboardTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Create a custom event for role changes
declare global {
  interface WindowEventMap {
    'roleChange': CustomEvent<{role: UserRole}>;
  }
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [role, setRole] = useState<UserRole>('student');
  const [key, setKey] = useState<number>(0); // Key to force re-render
  const router = useDemoRouter('/dashboard_test');
  // const router = useRouter();
  
  // Listen for role changes
  useEffect(() => {
    // Get initial role
    const userRole = getUserRole();
    setRole(userRole);
    
    // Function to handle role change events
    const handleRoleChange = (event: CustomEvent<{role: UserRole}>) => {
      setRole(event.detail.role);
      setKey(prev => prev + 1); // Force re-render by changing key
    };
    
    // Add event listener for custom role change events
    window.addEventListener('roleChange', handleRoleChange as EventListener);
    
    // Setup storage event listener to detect changes from other tabs/components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userRole' && event.newValue) {
        const newRole = event.newValue as UserRole;
        if (newRole !== role) {
          setRole(newRole);
          setKey(prev => prev + 1); // Force re-render by changing key
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('roleChange', handleRoleChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Generate navigation based on user role
  const navigation = getUserNavigation(role);

  return (
    //<AuthWrapper>
    <Box sx={{ height: '100vh' }} key={key}>
      <AppProvider
        navigation={navigation}
        // router={router}
        theme={dashboardTheme}
      >
        <ToolpadDashboardLayout>
          {children}
        </ToolpadDashboardLayout>
      </AppProvider>
    </Box>
    //</AuthWrapper>
  );
}