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

// Role selector component for testing
const RoleSwitcher = ({ currentRole, onRoleChange }: { currentRole: string, onRoleChange: (role: UserRole) => void }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>Role Selection (For Testing)</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Change roles to see different dashboard views
      </Typography>
      <FormGroup row>
        <FormControlLabel 
          control={
            <Switch 
              checked={normalizeRole(currentRole as UserRole) === 'student'} 
              onChange={() => onRoleChange('student')} 
            />
          } 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">Student</Typography>
            </Box>
          }
        />
        <FormControlLabel 
          control={
            <Switch 
              checked={normalizeRole(currentRole as UserRole) === 'ta'} 
              onChange={() => onRoleChange('ta')} 
            />
          } 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">Teaching Assistant</Typography>
            </Box>
          }
        />
        <FormControlLabel 
          control={
            <Switch 
              checked={normalizeRole(currentRole as UserRole) === 'admin'} 
              onChange={() => onRoleChange('admin')} 
            />
          } 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AdminPanelSettingsIcon sx={{ mr: 0.5 }} fontSize="small" />
              <Typography variant="body2">Administrator</Typography>
            </Box>
          }
        />
      </FormGroup>
    </Paper>
  );
};

// Student Dashboard Component
const StudentDashboard: React.FC = () => (
  <Box>
    <Typography variant="h4" component="h1" gutterBottom>
      Student Dashboard
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Your Upcoming Assignments
            </Typography>
            <Chip label="3 Due Soon" color="primary" size="small" />
          </Box>
          
          <List disablePadding>
            {[
              { title: 'Lab Report 3', due: '2 days', course: 'CS 253' },
              { title: 'Midterm Exam', due: '1 week', course: 'MATH 221' },
              { title: 'Project Proposal', due: '2 weeks', course: 'CS 253' }
            ].map((item, index) => (
              <ListItem key={index} disablePadding divider={index < 2}>
                <ListItemButton>
                  <ListItemText 
                    primary={item.title} 
                    secondary={`Due in ${item.due} • ${item.course}`}
                    primaryTypographyProps={{ fontWeight: index === 0 ? 'bold' : 'regular' }}
                  />
                  <ArrowForwardIcon color="action" fontSize="small" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Button variant="outlined" sx={{ mt: 2 }}>View All Assignments</Button>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Course Progress
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', my: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress variant="determinate" value={65} size={120} thickness={5} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" component="div" color="text.secondary">
                  65%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>Semester Completed</Typography>
          </Box>
          
          <Typography variant="body2" paragraph>
            You're making good progress. Keep up the good work!
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Recent Announcements
          </Typography>
          
          <List disablePadding>
            {[
              { title: 'Midterm Schedule Posted', date: 'Today', course: 'CS 253' },
              { title: 'Guest Lecture Next Week', date: 'Yesterday', course: 'MATH 221' }
            ].map((item, index) => (
              <ListItem key={index} disablePadding divider={index === 0}>
                <ListItemButton>
                  <ListItemText 
                    primary={item.title} 
                    secondary={`${item.date} • ${item.course}`}
                  />
                  <ArrowForwardIcon color="action" fontSize="small" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

// TA Dashboard Component
const TADashboard: React.FC = () => (
  <Box>
    <Typography variant="h4" component="h1" gutterBottom>
      Teaching Assistant Dashboard
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Pending Grading Tasks
          </Typography>
          
          <List disablePadding>
            {[
              { title: 'Assignment 2 Submissions', count: 15, deadline: '2 days' },
              { title: 'Lab Reports', count: 8, deadline: '1 week' },
              { title: 'Quiz 3 Responses', count: 22, deadline: 'No deadline' }
            ].map((item, index) => (
              <ListItem key={index} disablePadding divider={index < 2}>
                <ListItemButton>
                  <ListItemText 
                    primary={item.title} 
                    secondary={`${item.count} submissions • Due in ${item.deadline}`}
                    primaryTypographyProps={{ fontWeight: index === 0 ? 'bold' : 'regular' }}
                  />
                  <Button size="small" variant="contained" color="primary">
                    Grade
                  </Button>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Student Questions
            </Typography>
            <Chip label="4 New" color="error" size="small" />
          </Box>
          
          <List disablePadding>
            {[
              { student: 'Alice Smith', question: 'Question about lab 3 submission', time: '15 minutes ago' },
              { student: 'Bob Johnson', question: 'Clarification on midterm topics', time: '2 hours ago' },
              { student: 'Carol Williams', question: 'Extension request for assignment', time: '1 day ago' }
            ].map((item, index) => (
              <ListItem key={index} disablePadding divider={index < 2}>
                <ListItemButton>
                  <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {item.student[0]}
                  </Avatar>
                  <ListItemText 
                    primary={item.question} 
                    secondary={`${item.student} • ${item.time}`}
                  />
                  <ArrowForwardIcon color="action" fontSize="small" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Button variant="outlined" sx={{ mt: 2 }}>View All Questions</Button>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Course Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h3" color="primary.main">82%</Typography>
                  <Typography variant="body2">Average Assignment Score</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h3" color="primary.main">19</Typography>
                  <Typography variant="body2">Students Requiring Attention</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h3" color="primary.main">94%</Typography>
                  <Typography variant="body2">Assignment Submission Rate</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

// Admin Dashboard Component
const AdminDashboard: React.FC = () => (
  <Box>
    <Typography variant="h4" component="h1" gutterBottom>
      Administrator Dashboard
    </Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h3" color="primary.main">346</Typography>
          <Typography variant="body1" gutterBottom>Total Users</Typography>
          <Typography variant="body2" color="text.secondary">24 new this week</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h3" color="primary.main">15</Typography>
          <Typography variant="body1" gutterBottom>Active Courses</Typography>
          <Typography variant="body2" color="text.secondary">3 pending approval</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h3" color="success.main">98.2%</Typography>
          <Typography variant="body1" gutterBottom>System Uptime</Typography>
          <Typography variant="body2" color="text.secondary">Last incident: 12 days ago</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h3" color="warning.main">8</Typography>
          <Typography variant="body1" gutterBottom>Support Tickets</Typography>
          <Typography variant="body2" color="text.secondary">3 urgent, 5 normal</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Recent System Activity
            </Typography>
            <Button size="small" color="primary">View All</Button>
          </Box>
          
          <List disablePadding>
            {[
              { action: 'Course added', details: 'CS 355 - Database Systems', time: '2 hours ago' },
              { action: 'User role changed', details: 'David Brown from student to TA', time: '5 hours ago' },
              { action: 'System backup', details: 'Automated daily backup', time: '1 day ago' },
              { action: 'User deleted', details: 'Account removed at user request', time: '2 days ago' }
            ].map((item, index) => (
              <ListItem key={index} disablePadding divider={index < 3}>
                <ListItemButton>
                  <ListItemText 
                    primary={item.action} 
                    secondary={`${item.details} • ${item.time}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            System Status
          </Typography>
          
          <List disablePadding>
            {[
              { service: 'Authentication Service', status: 'Operational', indicator: 'success' },
              { service: 'Database Server', status: 'Operational', indicator: 'success' },
              { service: 'File Storage', status: 'Operational', indicator: 'success' },
              { service: 'Email Service', status: 'Degraded', indicator: 'warning' }
            ].map((item, index) => (
              <ListItem key={index} disablePadding divider={index < 3}>
                <ListItemText 
                  primary={item.service} 
                  secondary={item.status}
                />
                <Chip 
                  size="small" 
                  sx={{ width: 12, height: 12 }} 
                  color={item.indicator as 'success' | 'warning' | 'error'} 
                />
              </ListItem>
            ))}
          </List>
          
          <Button variant="outlined" sx={{ mt: 2 }}>View Detailed Report</Button>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

// Main Dashboard Component
export default function Dashboard() {
  const [role, setRole] = useState<UserRole>('student');
  
  useEffect(() => {
    // Get role from localStorage on component mount
    setRole(getUserRole());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    // Update state
    setRole(newRole);
    
    // Save to localStorage
    setUserRole(newRole);
    
    // Dispatch custom event to notify layout about role change
    const event = new CustomEvent('roleChange', { 
      detail: { role: newRole }
    });
    window.dispatchEvent(event);
    
    // Force navigation refresh by adding a small delay and reloading the page
    // This ensures other components depending on role are updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Render dashboard based on normalized role
  const renderDashboard = () => {
    const normalizedRole = normalizeRole(role);
    
    switch(normalizedRole) {
      case 'ta':
        return <TADashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'student':
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <RoleSwitcher currentRole={role} onRoleChange={handleRoleChange} />
      {renderDashboard()}
    </Box>
  );
}
