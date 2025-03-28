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

interface SubmissionType {
  id: number;
  team_id: number;
  submitted_on: string;
  score: number | null;
  max_score: number;
  file: {
    file_url: string;
    original_filename: string;
  };
}

interface SubmittableType {
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

export default function SubmissionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const submittableId = searchParams.get('id');

  const [submittable, setSubmittable] = useState<SubmittableType | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionType | null>(null);
  const [gradeScore, setGradeScore] = useState<string>('');

  useEffect(() => {
    console.log('Submittable ID:', submittableId);
    if (submittableId) {
      fetchSubmittableDetails();
      fetchSubmissions();
    } else {
      setError('No submittable ID provided');
      setLoading(false);
    }
  }, [submittableId]);

  const fetchSubmittableDetails = async () => {
    try {
      console.log('Fetching submittable details...');
      const response = await axios.get(`/submittables/${submittableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Submittable details response:', response.data);
      setSubmittable(response.data);
    } catch (err: any) {
      console.error('Error fetching submittable details:', err);
      setError('Failed to fetch submittable details');
    }
  };

  const fetchSubmissions = async () => {
    try {
      console.log('Fetching submissions...');
      const response = await axios.get(`/submittables/${submittableId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Submissions response:', response.data);
      setSubmissions(response.data);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionDownload = async (submissionId: number, fileName: string) => {
    try {
      const response = await axios.get(
        `/submissions/${submissionId}/download`,
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

  const handleDeleteSubmission = async (submissionId: number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this submission?')) {
        return;
      }

      await axios.delete(
        `/submissions/${submissionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      await fetchSubmissions();
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission: SubmissionType) => {
    setSelectedSubmission(submission);
    setGradeScore(submission.score?.toString() || '');
    setGradeDialogOpen(true);
  };

  const handleGradeSubmit = async () => {
    if (!selectedSubmission || !gradeScore) return;

    try {
      const score = parseInt(gradeScore);
      await axios.put(
        `/submissions/${selectedSubmission.id}/grade`,
        { score },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await fetchSubmissions();
      setGradeDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Submission graded successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error grading submission:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to grade submission. Please try again.',
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

  if (!submittable) {
    console.log('Rendering no submittable state');
    return (
      <Box p={3}>
        <Alert severity="error">Submittable not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Submittable Details */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ 
            background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
          }}>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {submittable.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                {submittable.description}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`Opens: ${formatDate(submittable.opens_at || '')}`}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`Deadline: ${formatDate(submittable.deadline)}`}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<GradeIcon />}
                  label={`Max Score: ${submittable.max_score}`}
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

        {/* Submissions List */}
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
                  Submissions ({submissions.length})
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
                {submissions.map((submission) => (
                  <ListItem 
                    key={submission.id} 
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
                            {submission.file.original_filename}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Team ID: {submission.team_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Submitted: {formatDate(submission.submitted_on)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={submission.score !== null ? 'success.main' : 'text.secondary'}
                            sx={{ fontWeight: submission.score !== null ? 500 : 400 }}
                          >
                            Score: {submission.score !== null ? `${submission.score}/${submission.max_score}` : 'Not graded'}
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
                          onClick={() => handleSubmissionDownload(submission.id, submission.file.original_filename)}
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
                          onClick={() => handleGradeClick(submission)}
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 1.5
                          }}
                        >
                          Grade
                        </Button>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteSubmission(submission.id)}
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
                {submissions.length === 0 && (
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
          Grade Submission
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter score (max: {selectedSubmission?.max_score})
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={gradeScore}
              onChange={(e) => setGradeScore(e.target.value)}
              inputProps={{
                min: 0,
                max: selectedSubmission?.max_score
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