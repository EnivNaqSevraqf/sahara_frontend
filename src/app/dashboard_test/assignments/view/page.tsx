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

export default function AssignmentView() {
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
    console.log('Assignment ID:', assignableId);
    if (assignableId) {
      fetchAssignableDetails();
      fetchAssignments();
    } else {
      setError('No assignment ID provided');
      setLoading(false);
    }
  }, [assignableId]);

  const fetchAssignableDetails = async () => {
    try {
      console.log('Fetching assignment details...');
      const response = await axios.get(`/assignables/${assignableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Assignment details response:', response.data);
      setAssignable(response.data);
    } catch (err: any) {
      console.error('Error fetching assignment details:', err);
      setError('Failed to fetch assignment details');
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
      console.error('Error deleting assignment:', err);
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
    console.log('Rendering no assignment state');
    return (
      <Box p={3}>
        <Alert severity="error">Assignment not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Assignment Details */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ 
            background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
          }}>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {assignable.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                {assignable.description}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`Opens: ${formatDate(assignable.opens_at || '')}`}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`Deadline: ${formatDate(assignable.deadline)}`}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<GradeIcon />}
                  label={`Max Score: ${assignable.max_score}`}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments List */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Assignments ({assignments.length})
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AttachFileIcon />}
                  onClick={() => router.back()}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 1.5,
                    px: 3
                  }}
                >
                  Back to List
                </Button>
              </Box>
              <List>
                {assignments.map((assignment) => (
                  <ListItem 
                    key={assignment.id} 
                    divider
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {assignment.file.original_filename}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            User ID: {assignment.user_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Submitted: {formatDate(assignment.submitted_on)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={assignment.score !== null ? 'success.main' : 'text.secondary'}
                            sx={{ fontWeight: assignment.score !== null ? 500 : 400 }}
                          >
                            Score: {assignment.score !== null ? `${assignment.score}/${assignment.max_score}` : 'Not graded'}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleAssignmentDownload(assignment.id, assignment.file.original_filename)}
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 1.5
                          }}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => handleGradeClick(assignment)}
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 1.5
                          }}
                        >
                          Grade
                        </Button>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          color="error"
                          sx={{ 
                            '&:hover': {
                              bgcolor: 'error.50'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {assignments.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="h6" 
                          color="text.secondary" 
                          align="center"
                          sx={{ 
                            py: 4,
                            fontWeight: 500
                          }}
                        >
                          No submissions yet
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          align="center"
                        >
                          Submissions will appear here once students submit their work
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grade Dialog */}
      <Dialog 
        open={gradeDialogOpen} 
        onClose={() => setGradeDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
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
            <Typography variant="body1" gutterBottom>
              Enter score (max: {selectedAssignment?.max_score})
            </Typography>
            <TextField
              fullWidth
              type="number"
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
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}