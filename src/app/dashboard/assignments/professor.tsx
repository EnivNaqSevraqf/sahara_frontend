'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Divider,
  Grid,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Collapse,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

interface AssignmentType {
  id: number;
  user_id: number;
  submitted_on: string;
  original_filename: string;
  user: {
    name: string;
  };
}

interface AssignableType {
  id: number;
  title: string;
  description: string;
  opens_at?: string;
  deadline: string;
  reference_files: Array<{
    id: number;
    original_filename: string;
  }>;
  submission_status?: {
    has_submitted: boolean;
    submission_id: number | null;
    submitted_on: string | null;
    original_filename: string | null;
  };
  creator_id: number;  // Added to check if current user is creator
  submission_count?: number;  // Add this field
}

export default function ProfessorAssignmentList() {
  const router = useRouter();
  const [assignables, setAssignables] = useState<AssignableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAssignable, setNewAssignable] = useState({
    title: '',
    description: '',
    deadline: '',
    opens_at: ''
  });
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate completion percentage
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const [selectedAssignable, setSelectedAssignable] = useState<AssignableType | null>(null);
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [assignmentsDialogOpen, setAssignmentsDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignables();
  }, []);

  useEffect(() => {
    const totalAssignables = assignables.length;
    const completedAssignables = assignables.filter(doc => doc.submission_status?.has_submitted).length;
    const percentage = totalAssignables > 0 ? Math.round((completedAssignables / totalAssignables) * 100) : 0;
    setCompletionPercentage(percentage);
  }, [assignables]);

  useEffect(() => {
    // Get user role and ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload); // Debug log
        setCurrentUserId(payload.user_id);
        console.log('Current user ID:', payload.user_id); // Debug log
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const fetchAssignables = async () => {
    try {
      setLoading(true);
      console.log('Fetching assignments...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Using token:', token.substring(0, 20) + '...');
      
      const response = await axios.get('/assignables/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Assignments response:', response.data);
      
      // Handle the response format with upcoming, open, and closed arrays
      if (typeof response.data === 'object' && response.data !== null) {
        // Combine all submittables from different categories
        const allAssignables = [
          ...(response.data.upcoming || []),
          ...(response.data.open || []),
          ...(response.data.closed || [])
        ].map((assignable: any) => ({
          ...assignable,
          submission_count: 0 // Default to 0 for now until backend endpoint is ready
        }));
        
        setAssignables(allAssignables);
        setError(null);
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
        console.error('Error fetching assignments:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      
      let errorMessage = 'Failed to fetch assignments';
      if (err.message === 'No authentication token found') {
        errorMessage = 'Please log in to view assignments';
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data)) {
          errorMessage = err.response.data.map((err: { msg?: string; message?: string; loc?: string[] }) => {
            if (err.loc) {
              return `${err.loc.join('.')}: ${err.msg || err.message}`;
            }
            return err.msg || err.message;
          }).join('\n');
        } else if (typeof err.response.data === 'object') {
          // Handle FastAPI validation errors
          if (err.response.data.loc) {
            errorMessage = `${err.response.data.loc.join('.')}: ${err.response.data.msg}`;
          } else if (err.response.data.msg) {
            errorMessage = err.response.data.msg;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.type) {
            errorMessage = `${err.response.data.type}: ${err.response.data.msg || 'Validation error'}`;
          } else {
            errorMessage = Object.entries(err.response.data)
              .map(([key, value]: [string, any]) => `${key}: ${value}`)
              .join('\n');
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentDownload = async (assignmentId: number, fileName: string) => {
    try {
      const response = await axios.get(
        `/assignments/${assignmentId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setSnackbar({
        open: true,
        message: 'File downloaded successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error downloading submission:', err);
      setSnackbar({
        open: true,
        message: 'Failed to download file. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this submission?')) {
        return;
      }

      await axios.delete(`/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh submittables to get updated status
      await fetchAssignables();
      
      setSnackbar({
        open: true,
        message: 'Submission deleted successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error deleting submission:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to delete submission. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleReferenceFileDownload = async (assignableId: number, fileName: string) => {
    try {
      const response = await axios.get(
        `/assignables/${assignableId}/reference-files/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setSnackbar({
        open: true,
        message: 'File downloaded successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error downloading reference file:', err);
      setSnackbar({
        open: true,
        message: 'Failed to download reference file. Please try again.',
        severity: 'error'
      });
    }
  };

  const isSubmissionAllowed = (doc: AssignableType) => {
    const now = new Date();
    const opensAt = doc.opens_at ? new Date(doc.opens_at) : null;
    const deadline = new Date(doc.deadline);
    
    return opensAt ? (now >= opensAt && now <= deadline) : (now <= deadline);
  };

  const isUpcoming = (doc: AssignableType) => {
    if (!doc.opens_at) return false;
    const now = new Date();
    const opensAt = new Date(doc.opens_at);
    return now < opensAt;
  };

  const isPast = (doc: AssignableType) => {
    const now = new Date();
    const deadline = new Date(doc.deadline);
    return now > deadline;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ", " + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Split submittables into categories
  const ongoingAssignables = assignables.filter(doc => isSubmissionAllowed(doc));
  const upcomingAssignables = assignables.filter(doc => isUpcoming(doc));
  const previousAssignables = assignables.filter(doc => isPast(doc));

  const handleExpandClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchSubmissions = async (assignableId: number) => {
    try {
      const response = await axios.get(`/assignables/${assignableId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Find the submittable in the list
      const assignable = assignables.find(a => a.id === assignableId);
      if (assignable) {
        setSelectedAssignable(assignable);
        setAssignments(response.data);
        setAssignmentsDialogOpen(true);
      }
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch submissions. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteSubmittable = async (assignableId: number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this assignable? This action cannot be undone.')) {
        return;
      }

      await axios.delete(`/assignables/${assignableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh submittables list
      await fetchAssignables();
      
      setSnackbar({
        open: true,
        message: 'Assignment deleted successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to delete assignment. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleUpdateAssignment = (assignableId: number) => {
    router.push(`/dashboard/assignments/update?id=${assignableId}`);
  };

  const handleCreateAssignment = () => {
    router.push('/dashboard/assignments/creation');
  };

  const handleViewSubmissions = (assignableId: number) => {
    router.push(`/dashboard/assignments/view?id=${assignableId}`);
  };

  // Render a single submittable item
  const renderAssignableItem = (doc: AssignableType, index: number) => {
    const isAllowed = isSubmissionAllowed(doc);
    const hasSubmitted = doc.submission_status?.has_submitted;
    const isExpanded = expandedId === doc.id;
    const isCreator = currentUserId === doc.creator_id;
    
    console.log('Rendering assignment:', { // Debug log
      docId: doc.id,
      currentUserId,
      creatorId: doc.creator_id,
      isCreator
    });
    
    return (
      <Card 
        key={doc.id} 
        sx={{ 
          mb: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.08)'
          }
        }}
      >
        <CardContent 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' },
            p: 3,
            '&:last-child': { pb: 3 },
            transition: 'background-color 0.2s ease'
          }}
          onClick={() => handleExpandClick(doc.id)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label="Assignment" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ 
                  mr: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: '28px',
                  borderRadius: '14px',
                  px: 1
                }} 
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'text.primary',
                  letterSpacing: '-0.01em'
                }}
              >
                {doc.title}
              </Typography>
            </Box>
            {isExpanded ? 
              <ExpandLessIcon sx={{ color: 'text.secondary', fontSize: '1.5rem' }} /> : 
              <ExpandMoreIcon sx={{ color: 'text.secondary', fontSize: '1.5rem' }} />
            }
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
            {doc.opens_at && (
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.95rem'
                }}
              >
                <AccessTimeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#033076', opacity: 0.8 }} />
                Opens at: {formatDate(doc.opens_at)}
              </Typography>
            )}
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.95rem'
              }}
            >
              <AccessTimeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#033076', opacity: 0.8 }} />
              Due on: {formatDate(doc.deadline)}
            </Typography>
          </Box>
        </CardContent>

        <Collapse in={isExpanded}>
          <CardContent sx={{ p: 3, pt: 0 }}>
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.primary',
                  mb: 1.5
                }}
              >
                Description
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  fontSize: '0.95rem',
                  lineHeight: 1.7
                }}
              >
                {doc.description}
              </Typography>
            </Box>

            {/* System Instructions */}
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.primary',
                  mb: 1.5
                }}
              >
                System Instructions
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.95rem',
                  lineHeight: 1.7
                }}
              >
                You are given an extra 10 minutes after due time to submit this assignment. However, please note that any submissions made after the due time are marked as late submissions.
              </Typography>
            </Box>

            {/* Results Section */}
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'text.primary',
                  mb: 1.5
                }}
              >
                Results
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.95rem',
                  lineHeight: 1.7
                }}
              >
                Results will be available after {formatDate(doc.deadline)}
              </Typography>
            </Box>

            {/* Reference Files Section */}
            {doc.reference_files && doc.reference_files.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'text.primary',
                    mb: 1.5
                  }}
                >
                  Reference Files
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {doc.reference_files.map((file) => (
                    <Button
                      key={file.id}
                      variant="outlined"
                      size="medium"
                      startIcon={<AttachFileIcon sx={{ fontSize: '1.2rem' }} />}
                      onClick={() => handleReferenceFileDownload(doc.id, file.original_filename)}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        py: 1,
                        px: 2,
                        borderRadius: 1.5,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.dark',
                          bgcolor: 'primary.50'
                        }
                      }}
                    >
                      {file.original_filename}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            {hasSubmitted && doc.submission_status?.submitted_on && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="body1" 
                  color="success.main" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                >
                  <CheckCircleIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Submitted: {formatDate(doc.submission_status.submitted_on)}
                  {doc.submission_status.original_filename && (
                    <>
                      {' - '}
                      <Button
                        size="medium"
                        onClick={() => handleAssignmentDownload(doc.submission_status!.submission_id!, doc.submission_status!.original_filename!)}
                        sx={{ 
                          textTransform: 'none',
                          minWidth: 'auto',
                          p: 0,
                          ml: 1,
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          color: 'primary.main',
                          '&:hover': {
                            color: 'primary.dark',
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        {doc.submission_status.original_filename}
                      </Button>
                      <IconButton
                        size="medium"
                        onClick={() => handleDeleteAssignment(doc.submission_status!.submission_id!)}
                        sx={{ 
                          ml: 0.5, 
                          color: 'error.main',
                          padding: 1,
                          '&:hover': {
                            bgcolor: 'error.50'
                          }
                        }}
                        title="Delete submission"
                      >
                        <DeleteIcon sx={{ fontSize: '1.3rem' }} />
                      </IconButton>
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', p: 3, pt: 0 }}>
            {isCreator && (
              <>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<AttachFileIcon sx={{ fontSize: '1.2rem' }} />}
                  onClick={() => handleViewSubmissions(doc.id)}
                  sx={{ 
                    mr: 2,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    borderRadius: 1.5,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'info.50'
                    }
                  }}
                >
                  View All Submissions
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon sx={{ fontSize: '1.2rem' }} />}
                  onClick={() => handleUpdateAssignment(doc.id)}
                  sx={{ 
                    mr: 2,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    borderRadius: 1.5,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  Update Assignment
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon sx={{ fontSize: '1.2rem' }} />}
                  onClick={() => handleDeleteAssignment(doc.id)}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    borderRadius: 1.5,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'error.50'
                    }
                  }}
                >
                  Delete Assignment
                </Button>
              </>
            )}
          </CardActions>
        </Collapse>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '1200px', 
      margin: '0 auto',
      bgcolor: 'background.default'
    }}>
      {/* Course navigation */}
      <Box sx={{ 
        mb: 4, 
        pb: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="body2" component="div">
            <span style={{ color: '#3f51b5', cursor: 'pointer', fontWeight: 500 }}>Course Home</span> / 
            <span style={{ cursor: 'pointer', color: 'text.secondary' }}> Assignments</span>
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={handleCreateAssignment}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: '#033076',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Create Assignment
        </Button>
      </Box>
      
      {/* Ongoing/Upcoming Documents */}
      {(ongoingAssignables.length > 0 || upcomingAssignables.length > 0) && (
        <>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#033076'
            }}
          >
            <AssignmentIcon /> Ongoing/Upcoming Documents
          </Typography>
          
          <Grid container spacing={2}>
            {ongoingAssignables.map((doc, index) => (
              <Grid item xs={12} key={doc.id}>
                {renderAssignableItem(doc, index)}
              </Grid>
            ))}
            {upcomingAssignables.map((doc, index) => (
              <Grid item xs={12} key={doc.id}>
                {renderAssignableItem(doc, index)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Previous Documents */}
      {previousAssignables.length > 0 && (
        <>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              mt: 6, 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary'
            }}
          >
            <AssignmentIcon /> Previous Documents
          </Typography>
          
          <Grid container spacing={2}>
            {previousAssignables.map((doc, index) => (
              <Grid item xs={12} key={doc.id}>
                {renderAssignableItem(doc, index)}
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Submissions Dialog */}
      <Dialog
        open={assignmentsDialogOpen}
        onClose={() => {
          setAssignmentsDialogOpen(false);
          setSelectedAssignable(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 600,
          fontSize: '1.25rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          All Submissions for {selectedAssignable?.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {assignments.length === 0 ? (
            <Typography 
              color="text.secondary" 
              align="center"
              sx={{ 
                py: 4,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              No submissions yet
            </Typography>
          ) : (
            <List>
              {assignments.map((assignment) => (
                <ListItem 
                  key={assignment.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ 
                        fontWeight: 500,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {assignment.original_filename}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      >
                        Team: {assignment.user.name} | Submitted: {formatDate(assignment.submitted_on)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => handleAssignmentDownload(assignment.id, assignment.original_filename)}
                      sx={{ 
                        textTransform: 'none',
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      Download
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => {
              setAssignmentsDialogOpen(false);
              setSelectedAssignable(null);
            }}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};