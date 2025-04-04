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
  CircularProgress,
  Alert,
  Snackbar,
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
  ListItemSecondaryAction,
  useTheme,
  TextField
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import GradeIcon from '@mui/icons-material/Grade';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter, useSearchParams } from 'next/navigation';
import { currentConfig } from '@/config';

// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;

interface AssignmentType {
  id: number;
  user_id: number;
  submitted_on: string;
  score: number | null;
  max_score: number;
  file: {
    file_url: string;
    original_filename: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface AssignableType {
  id: number;
  title: string;
  description: string;
  opens_at?: string;
  deadline: string;
  max_score: number;
  reference_file?: {
    file_url: string;
    original_filename: string;
  };
}

export default function AssignmentView () {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const assignableId = searchParams.get('id');

  const [assignable, setAssignable] = useState<AssignableType | null>(null);
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentType | null>(null);
  const [gradeScore, setGradeScore] = useState<string>('');

  useEffect(() => {
    console.log('Assignable ID:', assignableId);
    if (assignableId) {
      fetchAssignableDetails();
      fetchAssignments();
    } else {
      setError('No assignable ID provided');
      setLoading(false);
    }
  }, [assignableId]);

  const fetchAssignableDetails = async () => {
    try {
      console.log('Fetching assignable details...');
      const response = await axios.get(`/assignables/${assignableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Assignable details response:', response.data);
      setAssignable(response.data);
    } catch (err: any) {
      console.error('Error fetching assignable details:', err);
      setError('Failed to fetch assignable details');
    }
  };

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments...');
      const response = await axios.get(`/assignables/${assignableId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Assignments response:', response.data);
      setAssignments(response.data);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError('Failed to fetch assignments');
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
      console.error('Error downloading assignment:', err);
      setSnackbar({
        open: true,
        message: 'Failed to download file. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this assignment?')) {
        return;
      }

      await axios.delete(
        `/assignments/${assignmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      await fetchAssignments();
      
      setSnackbar({
        open: true,
        message: 'Assignment deleted successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error deleting submission:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to delete assignment. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (assignment: AssignmentType) => {
    setSelectedAssignment(assignment);
    setGradeScore(assignment.score?.toString() || '');
    setGradeDialogOpen(true);
  };

  const handleGradeSubmit = async () => {
    if (!selectedAssignment || !gradeScore) return;

    try {
      const score = parseInt(gradeScore);
      await axios.put(
        `/assignments/${selectedAssignment.id}/grade`,
        { score },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await fetchAssignments();
      setGradeDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Assignment graded successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error grading assignment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to grade assignment. Please try again.',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!assignable) {
    console.log('Rendering no assignable state');
    return (
      <Box p={3}>
        <Alert severity="error">Assignable not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1a237e',
          }}>
            {assignable?.title}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#033076',
              color: '#033076',
              '&:hover': {
                borderColor: '#033076',
                bgcolor: 'rgba(3, 48, 118, 0.04)'
              }
            }}
          >
            Back to List
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #033076 0%, #1565C0 100%)',
              boxShadow: '0 4px 20px rgba(3, 48, 118, 0.2)',
              borderRadius: 2,
              color: 'white'
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Total Submissions
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                  {assignments.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
              boxShadow: '0 4px 20px rgba(26, 35, 126, 0.2)',
              borderRadius: 2,
              color: 'white'
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Graded Submissions
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                  {assignments.filter(a => a.score !== null).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
              boxShadow: '0 4px 20px rgba(27, 94, 32, 0.2)',
              borderRadius: 2,
              color: 'white'
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Average Score
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                  {assignments.filter(a => a.score !== null).length > 0 
                    ? (assignments.reduce((acc, curr) => acc + (curr.score || 0), 0) / 
                       assignments.filter(a => a.score !== null).length).toFixed(1)
                    : '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Submissions List */}
      <Card sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#F8FAFC'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Submissions
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {assignments.map((assignment) => (
            <ListItem 
              key={assignment.id} 
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                },
                p: 2,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {assignment.user?.name || 'Unknown Student'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.user?.email || 'No email'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Submitted on
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(assignment.submitted_on)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Score
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: assignment.score !== null ? '#2E7D32' : 'text.secondary',
                        fontWeight: assignment.score !== null ? 600 : 400
                      }}
                    >
                      {assignment.score !== null ? `${assignment.score}/${assignment.max_score}` : 'Not graded'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAssignmentDownload(assignment.id, assignment.file.original_filename)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: 2,
                        borderColor: '#033076',
                        color: '#033076',
                        minWidth: '100px',
                        height: '36px',
                        '&:hover': {
                          borderColor: '#033076',
                          bgcolor: 'rgba(3, 48, 118, 0.04)'
                        }
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleGradeClick(assignment)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: 2,
                        bgcolor: '#033076',
                        minWidth: '100px',
                        height: '36px',
                        '&:hover': {
                          bgcolor: '#032558'
                        }
                      }}
                    >
                      Grade
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </ListItem>
          ))}
          {assignments.length === 0 && (
            <ListItem sx={{ py: 8 }}>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No submissions yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submissions will appear here once students submit their work
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>
      </Card>

      {/* Grade Dialog */}
      <Dialog 
        open={gradeDialogOpen} 
        onClose={() => setGradeDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          fontWeight: 600
        }}>
          Grade Assignment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Student: {selectedAssignment?.user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {selectedAssignment?.user?.email}
            </Typography>
            <TextField
              fullWidth
              type="number"
              label={`Score (max: ${selectedAssignment?.max_score})`}
              value={gradeScore}
              onChange={(e) => setGradeScore(e.target.value)}
              inputProps={{
                min: 0,
                max: selectedAssignment?.max_score
              }}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setGradeDialogOpen(false)}
            sx={{ 
              textTransform: 'none',
              borderRadius: 1.5
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGradeSubmit} 
            variant="contained" 
            color="primary"
            sx={{ 
              textTransform: 'none',
              borderRadius: 1.5
            }}
          >
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}