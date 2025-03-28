'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { getUserRole, normalizeRole, setUserRole, type UserRole } from './utils';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

// Configure axios base URL
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Add request interceptor to handle errors
axios.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Please check if the backend server is running');
    }
    return Promise.reject(error);
  }
);

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  created_by: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface Assignment {
  id: number;
  title: string;
  due_date: string;
}

interface Gradeable {
  id: number;
  title: string;
  submission_count: number;
}

interface UserProfile {
  name: string;
  email: string;
}

interface DashboardProps {
  announcements: Announcement[];
  assignments?: Assignment[];
  gradeables?: Gradeable[];
  loading: boolean;
}

// Add this common style object
const styles = {
  paper: {
    p: 3,
    border: '1px solid #e3f2fd',
    backgroundColor: '#fbfdff',
  },
  header: {
    color: '#1976d2',
    fontWeight: 500,
  },
  viewAllButton: {
    color: '#1976d2',
    '&:hover': {
      backgroundColor: '#e3f2fd',
    },
  },
  listItemButton: {
    '&:hover': {
      backgroundColor: '#e3f2fd',
    },
  },
};

// Student Dashboard Component
const StudentDashboard: React.FC<DashboardProps> = ({ announcements, assignments = [], loading }) => {
  const router = useRouter();

  const handleAnnouncementClick = () => {
    router.push('/dashboard/announcements');
  };

  const handleAnnouncementItemClick = (announcementId: number) => {
    router.push(`/dashboard/announcements?expanded=${announcementId}`);
  };

  const handleAssignmentClick = (assignmentId: number) => {
    router.push(`/dashboard/assignments/${assignmentId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Assignments Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={styles.header}>
                My Assignments
              </Typography>
              <Button 
                size="small"
                sx={styles.viewAllButton}
                onClick={() => router.push('/dashboard/assignments')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : assignments.length > 0 ? (
              <List disablePadding>
                {assignments.map((assignment, index) => (
                  <ListItem key={assignment.id} disablePadding divider={index < assignments.length - 1}>
                    <ListItemButton sx={styles.listItemButton} onClick={() => handleAssignmentClick(assignment.id)}>
                      <ListItemText 
                        primary={assignment.title}
                        secondary={`Due: ${new Date(assignment.due_date).toLocaleDateString()}`}
                      />
                      <ArrowForwardIcon color="action" fontSize="small" />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No assignments due
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Announcements Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={styles.header}>
                Recent Announcements
              </Typography>
              <Button 
                size="small"
                sx={styles.viewAllButton}
                onClick={handleAnnouncementClick}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : announcements.length > 0 ? (
              <List disablePadding>
                {announcements.map((announcement, index) => (
                  <ListItem key={announcement.id} disablePadding divider={index < announcements.length - 1}>
                    <ListItemButton sx={styles.listItemButton} onClick={() => handleAnnouncementItemClick(announcement.id)}>
                      <ListItemText 
                        primary={announcement.title}
                        secondary={formatDate(announcement.created_at)}
                      />
                      <ArrowForwardIcon color="action" fontSize="small" />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No recent announcements
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// TA Dashboard Component
const TADashboard: React.FC<DashboardProps> = ({ announcements, gradeables = [], loading }) => {
  const router = useRouter();

  const handleGradeableClick = (gradeableId: number) => {
    router.push(`/dashboard/scores/${gradeableId}`);
  };

  const handleAnnouncementClick = (announcementId: number) => {
    router.push(`/dashboard/announcements?expanded=${announcementId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={styles.header}>
                Pending Gradeables
              </Typography>
              <Button 
                size="small"
                sx={styles.viewAllButton}
                onClick={() => router.push('/dashboard/gradeables')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} sx={{ color: '#1976d2' }} />
              </Box>
            ) : gradeables.length > 0 ? (
              <List disablePadding>
                {gradeables.map((gradeable, index) => (
                  <ListItem key={gradeable.id} disablePadding divider={index < gradeables.length - 1}>
                    <ListItemButton 
                      sx={styles.listItemButton}
                      onClick={() => handleGradeableClick(gradeable.id)}
                    >
                      <ListItemText 
                        primary={gradeable.title}
                        secondary={`${gradeable.submission_count} submissions pending`}
                      />
                      <Button 
                        size="small" 
                        variant="contained" 
                        sx={{ backgroundColor: '#1976d2' }}
                      >
                        Grade
                      </Button>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No pending gradeables
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={styles.header}>
                Recent Announcements
              </Typography>
              <Button 
                size="small"
                sx={styles.viewAllButton}
                onClick={() => router.push('/dashboard/announcements')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List disablePadding>
                {announcements.map((announcement, index) => (
                  <ListItem key={announcement.id} disablePadding divider={index < announcements.length - 1}>
                    <ListItemButton sx={styles.listItemButton} onClick={() => handleAnnouncementClick(announcement.id)}>
                      <ListItemText 
                        primary={announcement.title}
                        secondary={`${formatDate(announcement.created_at)} • ${announcement.created_by?.name || 'Unknown User'}`}
                      />
                      <ArrowForwardIcon color="action" fontSize="small" />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
// ... (keep previous interfaces and styles)

export default function Dashboard() {
  const [role, setRole] = useState<UserRole>('student');
  const [userName, setUserName] = useState<string>('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch announcements function (keep previous implementation)
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Sort announcements by date and get most recent
      const sortedAnnouncements = response.data.sort((a: Announcement, b: Announcement) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setAnnouncements(sortedAnnouncements.slice(0, 5)); // Get 5 most recent announcements
      setError(null);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError('Failed to fetch announcements');
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user name
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<UserProfile>('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUserName(response.data.name || 'User');
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setUserName('User');
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      const normalizedRole = normalizeRole(storedRole as UserRole);
      setRole(normalizedRole);
      
      // Fetch announcements and user profile
      fetchAnnouncements();
      fetchUserProfile();
    }
  }, []); 

  // Welcome Section Component
  const WelcomeSection = () => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };

    return (
      <Box 
        sx={{ 
          width: '100%', 
          backgroundColor: '#f0f4f8', 
          p: 3, 
          mb: 3,
          borderRadius: 2 
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#033076' }}>
          {getGreeting()},
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#555', mt: 1 }}>
          {role === 'student' 
            ? 'Stay organized and efficiently manage your project work, course assignments, and deadlines.' 
            : 'Manage course activities, grade submissions, and track student progress.'}
        </Typography>
      </Box>
    );
  };

  // Announcements Section Component
  const AnnouncementsSection = () => {
    const handleAnnouncementClick = (announcementId: number) => {
      router.push(`/dashboard/announcements?expanded=${announcementId}`);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    };

    return (
      <Paper elevation={0} sx={{
        width: '100%', 
        p: 3, 
        border: '1px solid #e3f2fd',
        backgroundColor: '#fbfdff',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ color: '#033076', fontWeight: 500 }}>
            Recent Announcements
          </Typography>
          <Button 
            size="small"
            sx={{
              color: '#033076',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              }
            }}
            onClick={() => router.push('/dashboard/announcements')}
          >
            View All
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : announcements.length > 0 ? (
          <List disablePadding>
            {announcements.map((announcement, index) => (
              <ListItem key={announcement.id} disablePadding divider={index < announcements.length - 1}>
                <ListItemButton 
                  sx={{
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    }
                  }} 
                  onClick={() => handleAnnouncementClick(announcement.id)}
                >
                  <ListItemText 
                    primary={announcement.title}
                    secondary={`${formatDate(announcement.created_at)} • ${announcement.created_by?.name || 'Unknown User'}`}
                  />
                  <ArrowForwardIcon color="action" fontSize="small" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No recent announcements
          </Typography>
        )}
      </Paper>
    );
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <WelcomeSection />
      <AnnouncementsSection />
    </Box>
  );
}