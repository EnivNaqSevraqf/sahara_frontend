'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { normalizeRole, type UserRole } from './utils';
import { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Divider from '@mui/material/Divider';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DescriptionIcon from '@mui/icons-material/Description';
import ForumIcon from '@mui/icons-material/Forum';

// Configure axios base URL
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Add request interceptor to handle errors
axios.interceptors.request.use(
  (config) => {
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
  // created_by: {
  //   id: number;
  //   name: string;
  //   email: string;
  //   role: string;
  // };
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  opens_at?: string;
  deadline: string;
  due_date: string; // This appears to be used in the Dashboard for assignments
  max_score: number;
  reference_files: Array<{
    original_filename: string;
  }>;
  submission_status?: {
    has_submitted: boolean;
    submission_id: number | null;
    submitted_on: string | null;
    original_filename: string | null;
    score: number | null;
  };
}

interface AssignmentResponse {
  upcoming: Assignment[];
  open: Assignment[];
  closed: Assignment[];

}

interface Gradeable {
  id: number;
  title: string;
  submission_count: number;
}

interface Submission {
  id: number;
  title: string;
  deadline: string;
  has_submitted: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  team_name?: string;
}

interface CourseStats {
  submittedDocuments: number;
  totalDocuments: number;
  upcomingDeadlines: number;
  averageScore: number;
}

export default function Dashboard() {
  const [role, setRole] = useState<UserRole>('student');
  const [userName, setUserName] = useState<string>('');
  const [userTeam, setUserTeam] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradeables, setGradeables] = useState<Gradeable[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    submittedDocuments: 0,
    totalDocuments: 0,
    upcomingDeadlines: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError,] = useState<string | null>(null);
  const router = useRouter();

  // State for individual section loading
  const [sectionsLoading, setSectionsLoading] = useState({
    announcements: true,
    assignments: true,
    submissions: true,
    gradeables: true,
    profile: true
  });

  const fetchAnnouncements = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, announcements: true }));
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<Announcement[]>('/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Response data:", response.data);
      // const allAnnouncements = response.data.map((item: any) => ({
      //   id: item.id,
      //   title: item.title,
      //   content: item.content,
      //   created_at: item.created_at,
      //   // created_by: item.created_by
      // }));
      const announcements: Announcement[] = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        created_at: item.created_at,
      }));
      const sortedAnnouncements = announcements.sort((a: Announcement, b: Announcement) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setAnnouncements(sortedAnnouncements.slice(0, 5));
      setError(null);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setSectionsLoading(prev => ({ ...prev, announcements: false }));
    }
  };

  // Fetch assignments for student
  const fetchAssignments = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, assignments: true }));
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<AssignmentResponse>('/assignables/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Sort by due date and get upcoming ones
      const upcomingAssignments = response.data.upcoming;
      const sortedAssignments = upcomingAssignments.sort((a: Assignment, b: Assignment) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
      console.log("Assignments:", response.data);
      setAssignments(sortedAssignments.slice(0, 4)); // Get 4 upcoming assignments
      // const totalAssignments = response.data.total;
      // console.log("Total assignments:", totalAssignments);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, assignments: false }));
    }
  };

  // Fetch submissions for student
  const fetchSubmissions = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, submissions: true }));
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/submittables/', {  // Added trailing slash
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const allSubmissions = [
        ...response.data.upcoming,
        ...response.data.open
      ].map((item: any) => ({
        id: item.id,
        title: item.title,
        deadline: item.deadline,
        has_submitted: item.submission_status?.has_submitted || false
      }));

      console.log("All submissions:", allSubmissions);

      const sortedSubmissions = allSubmissions.sort((a: Submission, b: Submission) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
      
      setSubmissions(sortedSubmissions.slice(0, 4));
      
      const totalDocs = [...response.data.upcoming, ...response.data.open, ...response.data.closed].length;
      const submittedDocs = [...response.data.upcoming, ...response.data.open, ...response.data.closed]
        .filter((doc: any) => doc.submission_status?.has_submitted).length;
      
      setStats(prev => ({
        ...prev,
        submittedDocuments: submittedDocs,
        totalDocuments: totalDocs,
        upcomingDeadlines: response.data.upcoming.length + response.data.open.length
      }));
      
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, submissions: false }));
    }
  };

  // Fetch gradeables for TA/Admin
  const fetchGradeables = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, gradeables: true }));
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/gradeables', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const pendingGradeables = response.data
        .filter((item: any) => item.submission_count > 0)
        .sort((a: any, b: any) => b.submission_count - a.submission_count);
      
      setGradeables(pendingGradeables.slice(0, 4));
    } catch (error: any) {
      console.error('Error fetching gradeables:', error);
    } finally {
      setSectionsLoading(prev => ({ ...prev, gradeables: false }));
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setSectionsLoading(prev => ({ ...prev, profile: true }));
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
      setUserTeam(response.data.team_name || null);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setUserName('User');
    } finally {
      setSectionsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      const normalizedRole = normalizeRole(storedRole as UserRole);
      setRole(normalizedRole);
      
      fetchAnnouncements();
      fetchUserProfile();
      
      if (normalizedRole === 'student') {
        fetchAssignments();
        fetchSubmissions();
      } else {
        fetchGradeables();
      }

      setLoading(false);
    }
  }, []); 

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate.getTime() - now.getTime();
    
    if (diffTime < 0) return "Overdue";
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else {
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m remaining`;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const WelcomeHeader = () => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 2,
          background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              {role === 'admin' ? 
                <AdminPanelSettingsIcon sx={{ fontSize: 48 }} /> :
                role === 'ta' ? 
                <SchoolIcon sx={{ fontSize: 48 }} /> :
                <PersonIcon sx={{ fontSize: 48 }} />
              }
            </Box>

            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {getGreeting()}, {userName.split(' ')[0]}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {role === 'admin' 
                  ? 'Manage course activities and track overall progress'
                  : role === 'ta'
                  ? 'Grade submissions and provide guidance to students'
                  : 'Stay organized and manage your project work efficiently'}
              </Typography>
            </Box>
          </Box>
          
          {role === 'student' && userTeam && (
            <Chip 
              icon={<GroupIcon />}
              label={`Team: ${userTeam}`}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 500,
                py: 2,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          )}
        </Box>
      </Paper>
    );
  };

  const StudentQuickStats = () => {
    const completionPercentage = stats.totalDocuments > 0 
      ? Math.round((stats.submittedDocuments / stats.totalDocuments) * 100)
      : 0;

    return (
      <Paper
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fbfdff',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.50' }}>
                <AssignmentIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Documents Completed</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.submittedDocuments}/{stats.totalDocuments}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'info.50' }}>
                <TimelineIcon color="info" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Completion</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {completionPercentage}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'warning.50' }}>
                <AccessTimeIcon color="warning" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Upcoming Deadlines</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.upcomingDeadlines}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'success.50' }}>
                <GradeIcon color="success" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Avg. Score</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const StaffQuickStats = () => {
    return (
      <Paper
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fbfdff', 
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.50' }}>
                <AssignmentIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Pending Grading</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {gradeables.reduce((total, g) => total + g.submission_count, 0)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'success.50' }}>
                <GroupIcon color="success" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Active Teams</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  12
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'warning.50' }}>
                <CalendarMonthIcon color="warning" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">This Week</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  3 Deadlines
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'info.50' }}>
                <ForumIcon color="info" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">New Discussions</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  5
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const RecentAnnouncements = () => {
    const handleAnnouncementClick = (announcementId: number) => {
      router.push(`/dashboard/announcements?expanded=${announcementId}`);
    };

    return (
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fbfdff',
          mb: 4
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnnouncementIcon sx={{ color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3f51b5' }}>
              Recent Announcements
            </Typography>
          </Box>
          <Button 
            size="small"
            onClick={() => router.push('/dashboard/announcements')}
            sx={{
              color: '#3f51b5',
              '&:hover': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
              },
              textTransform: 'none'
            }}
          >
            View All
          </Button>
        </Box>

        {sectionsLoading.announcements ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#3f51b5' }} />
          </Box>
        ) : announcements.length > 0 ? (
          <List sx={{ p: 0 }}>
            {announcements.map((announcement, index) => (
              <React.Fragment key={announcement.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleAnnouncementClick(announcement.id)}
                    sx={{ 
                      px: 3, 
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {announcement.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <AccessTimeIcon fontSize="small" />
                            {formatDate(announcement.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ArrowForwardIcon color="action" fontSize="small" />
                  </ListItemButton>
                </ListItem>
                {index < announcements.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No recent announcements
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const UpcomingSubmissions = () => {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fbfdff',
          mb: 4
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon sx={{ color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3f51b5' }}>
              Upcoming Documents
            </Typography>
          </Box>
          <Button 
            size="small"
            onClick={() => router.push('/dashboard/submission')}
            sx={{
              color: '#3f51b5',
              '&:hover': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
              },
              textTransform: 'none'
            }}
          >
            View All
          </Button>
        </Box>

        {sectionsLoading.submissions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#3f51b5' }} />
          </Box>
        ) : submissions.length > 0 ? (
          <List sx={{ p: 0 }}>
            {submissions.map((submission, index) => (
              <React.Fragment key={submission.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => router.push(`/dashboard/submission?expanded=${submission.id}`)}
                    sx={{ 
                      px: 3, 
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {submission.title}
                          </Typography>
                          {submission.has_submitted && (
                            <Chip 
                              size="small" 
                              icon={<CheckCircleIcon fontSize="small" />} 
                              label="Submitted" 
                              color="success" 
                              variant="outlined"
                              sx={{ height: 24 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <AccessTimeIcon fontSize="small" />
                            Due: {formatDate(submission.deadline)}
                          </Typography>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color={submission.has_submitted ? "success.main" : "warning.main"}
                            sx={{ ml: 2, fontWeight: 500 }}
                          >
                            {submission.has_submitted ? 
                              "Completed" : 
                              getTimeRemaining(submission.deadline)
                            }
                          </Typography>
                        </Box>
                      }
                    />
                    <ArrowForwardIcon color="action" fontSize="small" />
                  </ListItemButton>
                </ListItem>
                {index < submissions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No upcoming documents
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const PendingGradeables = () => {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fbfdff',
          mb: 4
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GradeIcon sx={{ color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3f51b5' }}>
              Pending Gradeables
            </Typography>
          </Box>
          <Button 
            size="small"
            onClick={() => router.push('/dashboard/gradeables')}
            sx={{
              color: '#3f51b5',
              '&:hover': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
              },
              textTransform: 'none'
            }}
          >
            View All
          </Button>
        </Box>

        {sectionsLoading.gradeables ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#3f51b5' }} />
          </Box>
        ) : gradeables.length > 0 ? (
          <List sx={{ p: 0 }}>
            {gradeables.map((gradeable, index) => (
              <React.Fragment key={gradeable.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => router.push(`/dashboard/gradeables/${gradeable.id}`)}
                    sx={{ 
                      px: 3, 
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {gradeable.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                          >
                            {gradeable.submission_count} {gradeable.submission_count === 1 ? 'submission' : 'submissions'} pending
                          </Typography>
                        </Box>
                      }
                    />
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        bgcolor: '#3f51b5',
                        minWidth: '80px',
                        '&:hover': {
                          bgcolor: '#303f9f',
                        },
                        borderRadius: 1,
                        textTransform: 'none'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/gradeables/${gradeable.id}`);
                      }}
                    >
                      Grade
                    </Button>
                  </ListItemButton>
                </ListItem>
                {index < gradeables.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No pending gradeables
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const UpcomingAssignments = () => {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fbfdff',
          mb: 4
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon sx={{ color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3f51b5' }}>
              Upcoming Assignments
            </Typography>
          </Box>
          <Button 
            size="small"
            onClick={() => router.push('/dashboard/assignments')}
            sx={{
              color: '#3f51b5',
              '&:hover': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
              },
              textTransform: 'none'
            }}
          >
            View All
          </Button>
        </Box>

        {sectionsLoading.assignments ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#3f51b5' }} />
          </Box>
        ) : assignments.length > 0 ? (
          <List sx={{ p: 0 }}>
            {assignments.map((assignment, index) => (
              <React.Fragment key={assignment.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}
                    sx={{ 
                      px: 3, 
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {assignment.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <TodayIcon fontSize="small" />
                            Due: {formatDate(assignment.due_date)}
                          </Typography>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="warning.main"
                            sx={{ ml: 2, fontWeight: 500 }}
                          >
                            {getTimeRemaining(assignment.due_date)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ArrowForwardIcon color="action" fontSize="small" />
                  </ListItemButton>
                </ListItem>
                {index < assignments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No upcoming assignments
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1500px', mx: 'auto' }}>
      <WelcomeHeader />
      
      {role === 'student' ? <StudentQuickStats /> : <StaffQuickStats />}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {role === 'student' 
            ? <UpcomingSubmissions /> 
            : <PendingGradeables />
          }
        </Grid>
        
        <Grid item xs={12} md={6}>
          <RecentAnnouncements />
        </Grid>
        
        {role === 'student' && (
          <Grid item xs={12}>
            <UpcomingAssignments />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}