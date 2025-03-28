'use client';
import { useRouter } from "next/navigation";
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
import LogoutIcon from '@mui/icons-material/Logout';
import { ThumbUpAlt, ViewQuilt } from '@mui/icons-material';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout as ToolpadDashboardLayout, DashboardLayoutProps } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
//import { getUserRole, normalizeRole, type UserRole } from '@/utils/roles';
import { useEffect, useState } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import "../globals.css";
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import LogoutButton from '@/components/logout';
import Header from '@/components/Header';
//import toolbaritems from '@/components/toolbaritems';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuButton from '@/components/MenuButton';
import { green, purple } from '@mui/material/colors';

// Add these type definitions at the top of the file after imports
type UserRole = 'admin' | 'ta' | 'student';

const normalizeRole = (role: string): UserRole => {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'ta':
      return 'ta';
    default:
      return 'student';
  }
};

// Update the getUserRole function to properly check for admin and ta roles
const getUserRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const roleFromStorage = localStorage.getItem('role');
    if (roleFromStorage) {
      const normalizedRole = roleFromStorage.toLowerCase();
      switch (normalizedRole) {
        case 'admin':
        case 'professor':
        case 'prof':
          return 'admin';
        case 'ta':
        case 'teaching assistant':
          return 'ta';
        case 'student':
          return 'student';
        default:
          return 'student';
      }
    }
  }
  return 'student';
};

const getUserNavigation = (userRole: UserRole): Navigation => {
  const role = normalizeRole(userRole);
  
  // Common header for all roles
  const dashboardHeader = {
    kind: 'header' as const,
    title: 'Dashboard',
  };

  // Common footer items for all roles
  // const footerItems = [
  //   {
  //     kind: 'header' as const,
  //     title: 'Account',
  //   }
  //   // {
  //   //   segment: 'settings',
  //   //   title: 'Settings',
  //   //   icon: <SettingsRoundedIcon />,
  //   // }
  // ];
  
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
        segment: 'dashboard_test/announcements',
        title: 'Announcements',
        icon: <AnnouncementIcon />,
      },
      {
        segment: 'dashboard_test/gradeables',
        title: 'Gradeables',
        icon: <AssignmentRoundedIcon />,
      },
      {
        segment: 'dashboard_test/forms',
        title: 'Form Management',
        icon: <ViewQuilt />,
      },
      {
        segment: 'dashboard_test/assignments',
        title: 'Assignments',
        icon: <SchoolIcon />,
      },
      {
        segment: 'dashboard_test/submission',
        title: 'Documentation',
        icon: <AssignmentRoundedIcon />,
      },
      {
        segment: 'dashboard_test/people',
        title: 'People',
        icon: <PeopleIcon />,
      },
      {
        segment: 'dashboard_test/discussion',
        title: 'Discussions',
        icon: <ForumIcon />,
      },
      {
        segment: 'dashboard_test/quizzes',
        title: 'Quizzes',
        icon: <QuizIcon />,
      },
      {
        segment: 'dashboard_test/feedback',//delete feedback form
        title: 'Feedback Form',
        icon: <ThumbUpAlt />,
      },
      {
        segment: 'dashboard_test/calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
      },
     // ...footerItems
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
        segment: 'dashboard_test/announcements',
        title: 'Announcements',
        icon: <AnnouncementIcon />,
      },
      {
        segment: 'dashboard_test/scores',
        title: 'Gradeables',
        icon: <AssignmentRoundedIcon />,
      },
      //forms for TA?
      {
        segment: 'dashboard_test/assignments',
        title: 'Assignments',
        icon: <SchoolIcon />,
      },
      //documentation
      {
        segment: 'dashboard_test/submission',
        title: 'Documentation',
        icon: <AssignmentRoundedIcon />,
      },
      {
        segment: 'dashboard_test/people',
        title: 'People',
        icon: <PeopleIcon />,
      },
      {
        segment: 'dashboard_test/discussion',
        title: 'Discussions',
        icon: <ForumIcon />,
      },
      {
        segment: 'dashboard_test/quizzes',
        title: 'Quizzes',
        icon: <QuizIcon />,
      },
      {
        segment: 'dashboard_test/feedback',//delete feedback form
        title: 'Feedback Form',
        icon: <ThumbUpAlt />,
      },
      {
        segment: 'dashboard_test/calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
      },
      //...footerItems
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
        segment: 'dashboard_test/announcements',
        title: 'Announcements',
        icon: <AnnouncementIcon />,
      },
      {
        segment: 'dashboard_test/project',
        title: 'Project',
        icon: <SchoolIcon />,
      },
      {
        segment: 'dashboard_test/quizzes',
        title: 'Quizzes',
        icon: <QuizIcon />,
      },
      {
        segment: 'dashboard_test/forms',
        title: 'Forms',
        icon: <ViewQuilt />,
      },
      {
        segment: 'dashboard_test/discussion',
        title: 'Discussions', 
        icon: <ForumIcon />,
      },
      {
        segment: 'dashboard_test/feedback',//delete feedback form
        title: 'Feedback Form',
        icon: <ThumbUpAlt />,
      },
      {
        segment: 'dashboard_test/calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
      },
      //...footerItems
    ];
  }
};

// Theme configuration
const dashboardTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: false, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    // MuiButton: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: '#19244C',
    //       color: '#FFFFFF',
    //       '&:hover': {
    //         backgroundColor: '#0F1A3E',
    //       },
    //     },
    //   },
    // },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f2e6a',
          color: '#a3aac1',
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2e6a',
          color: '#a3aac1',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          fill: '#a3aac1',
          color: '#a3aac1',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fill: '#a3aac1',
          color: '#a3aac1',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F5F5', // Light gray background
          color: '#000000', // Text color
        },
      },
    },
  },
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: green[500],
    },
  }, 
});

// Create a custom event for role changes
declare global {
  interface WindowEventMap {
    'roleChange': CustomEvent<{role: UserRole}>;
  }
}

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        backgroundColor: '#f5f5f5' 
      }}>
        {children}
      </Box>
    </Box>
  );
};

// Update the useEffect hook in the DashboardLayout component
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [role, setRole] = useState<UserRole>('student');
  const [key, setKey] = useState<number>(0);
  const router = useDemoRouter();
  
  useEffect(() => {
    const checkAndSetRole = () => {
      const currentRole = getUserRole();
      console.log('Current role from localStorage:', currentRole); // Debug log
      setRole(currentRole);
    };

    checkAndSetRole();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'role' && event.newValue) {
        const newRole = normalizeRole(event.newValue);
        console.log('Role changed to:', newRole); // Debug log
        setRole(newRole);
        setKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Generate navigation based on user role
  const navigation = getUserNavigation(role);

  function CustomToolbarActions(){
    return (
      <LogoutButton>
        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
        Logout
      </LogoutButton>
    )
  }

  function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="h6">Sahara</Typography>
      <Chip size="small" label="BETA" color="info" />
      {/* <Tooltip title="Connected to production">
        
      </Tooltip> */}
    </Stack>
  );
  }

  return (
    <AuthWrapper>
      <Box sx={{ height: '100vh' }} key={key}>
        <AppProvider
          navigation={navigation}
          theme={dashboardTheme}
        >
          <ToolpadDashboardLayout
            slots={{
              appTitle: CustomAppTitle,
              toolbarActions: CustomToolbarActions,
            }}
            
            
          >
            <DashboardWrapper>
              {children}
            </DashboardWrapper>
          </ToolpadDashboardLayout>
        </AppProvider>
      </Box>
    </AuthWrapper>
  );
}