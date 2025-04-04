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
  CardActions
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import { currentConfig } from '@/config';

// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;

interface SubmittableType {
  id: number;
  title: string;
  description: string;
  opens_at?: string;
  deadline: string;
  max_score: number;
  reference_files: Array<{
    id: number;
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

export default function StudentSubmissionList() {
  const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [submittables, setSubmittables] = useState<SubmittableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate completion percentage
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    fetchSubmittables();
  }, []);

  useEffect(() => {
    const totalSubmittables = submittables.length;
    const completedSubmittables = submittables.filter(doc => doc.submission_status?.has_submitted).length;
    const percentage = totalSubmittables > 0 ? Math.round((completedSubmittables / totalSubmittables) * 100) : 0;
    setCompletionPercentage(percentage);
  }, [submittables]);

  const fetchSubmittables = async () => {
    try {
      setLoading(true);
      console.log('Fetching submittables...');
      console.log('Token:', localStorage.getItem('token')); // Log token for debugging
      
      const response = await axios.get('/submittables/', {  // Added trailing slash
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Response:', response.data);
      
      // Combine all submittables from different categories
      const allSubmittables = [
        ...response.data.upcoming,
        ...response.data.open,
        ...response.data.closed
      ];
      
      setSubmittables(allSubmittables);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching submittables:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      setError(`Failed to fetch submittables: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, submittableId: number) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);  // Changed from 'files' to 'file' to match backend

    try {
      setLoading(true);
      const response = await axios.post(
        `/submittables/${submittableId}/submit`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Refresh submittables to get updated status
      await fetchSubmittables();
      
      setSnackbar({
        open: true,
        message: 'File submitted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting file:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit file. Please try again.',
        severity: 'error'
      });
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

      // Create a blob with the correct type
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
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
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this submission?')) {
        return;
      }

      setLoading(true);
      await axios.delete(
        `/submissions/${submissionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh submittables to get updated status
      await fetchSubmittables();
      
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

  const handleReferenceFileDownload = async (submittableId: number, fileName: string) => {
    try {
      console.log('Downloading reference file:', { submittableId, fileName });
      
      const response = await axios.get(
        `/submittables/${submittableId}/reference-files/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      // Create a blob with the correct type from headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
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
      
      let errorMessage = 'Failed to download reference file.';
      if (err.response?.status === 404) {
        errorMessage = 'File not found on the server.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to download this file.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setSnackbar({
        open: true,
        message: `${errorMessage} Please try again.`,
        severity: 'error'
      });
    }
  };

  const isSubmissionAllowed = (doc: SubmittableType) => {
    const now = new Date();
    const opensAt = doc.opens_at ? new Date(doc.opens_at) : null;
    const deadline = new Date(doc.deadline);
    
    return opensAt ? (now >= opensAt && now <= deadline) : (now <= deadline);
  };

  const isUpcoming = (doc: SubmittableType) => {
    if (!doc.opens_at) return false;
    const now = new Date();
    const opensAt = new Date(doc.opens_at);
    return now < opensAt;
  };

  const isPast = (doc: SubmittableType) => {
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
  const ongoingSubmittables = submittables.filter(doc => isSubmissionAllowed(doc));
  const upcomingSubmittables = submittables.filter(doc => isUpcoming(doc));
  const previousSubmittables = submittables.filter(doc => isPast(doc));

  const handleExpandClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Render a single submittable item
  const renderSubmittableItem = (doc: SubmittableType, index: number) => {
    const isAllowed = isSubmissionAllowed(doc);
    const hasSubmitted = doc.submission_status?.has_submitted;
    const isExpanded = expandedId === doc.id;
    
    return (
      <Card 
        key={doc.id} 
        sx={{ 
          mb: 2,
          borderLeft: 4,
          borderColor: hasSubmitted ? 'success.main' : isAllowed ? 'primary.main' : 'text.disabled',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          },
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%'
        }}
      >
        <CardContent 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
            p: 3
          }}
          onClick={() => handleExpandClick(doc.id)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label="Assignment" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ 
                  borderRadius: 1,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  px: 1
                }} 
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '1.25rem',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {doc.title}
              </Typography>
            </Box>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          
          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {doc.opens_at && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.875rem'
                }}
              >
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Opens at: {formatDate(doc.opens_at)}
              </Typography>
            )}
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '0.875rem'
              }}
            >
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Due on: {formatDate(doc.deadline)}
            </Typography>
          </Box>
        </CardContent>

        <Collapse in={isExpanded}>
          <CardContent sx={{ bgcolor: 'background.paper', p: 3 }}>
            {/* Description Section */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  mb: 1.5,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Description
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.primary', 
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.01em'
                }}
              >
                {doc.description}
              </Typography>
            </Box>

            {/* System Instructions */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  mb: 1.5,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                System Instructions
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                You are given an extra 10 minutes after due time to submit this assignment. However, please note that any submissions made after the due time are marked as late submissions.
              </Typography>
            </Box>

            {/* Question Files */}
            {doc.reference_files && doc.reference_files.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    mb: 1.5,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Question Files
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {doc.reference_files.map((file) => (
                    <Button
                      key={file.id}
                      variant="text"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => handleReferenceFileDownload(doc.id, file.original_filename)}
                      sx={{ 
                        textTransform: 'none',
                        color: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {file.original_filename}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Uploaded Answer Files */}
            {hasSubmitted && doc.submission_status?.submitted_on && (
              <Box sx={{ mb: 2.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    mb: 1.5,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Uploaded Answer Files
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AttachFileIcon />}
                    onClick={() => handleSubmissionDownload(doc.submission_status!.submission_id!, doc.submission_status!.original_filename!)}
                    sx={{ 
                      textTransform: 'none',
                      color: 'primary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {doc.submission_status.original_filename}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSubmission(doc.submission_status!.submission_id!)}
                    sx={{ color: 'error.main' }}
                    title="Delete submission"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Results Section */}
            <Box sx={{ mb: 2.5 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  mb: 1.5,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Results
              </Typography>
              {doc.submission_status && doc.submission_status.score !== null ? (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 500,
                    fontSize: '1rem',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {doc.submission_status.score} / {doc.max_score} points
                </Typography>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Results will be available after {formatDate(doc.deadline)}
                </Typography>
              )}
            </Box>
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', p: 3, bgcolor: 'background.paper' }}>
            <input
              type="file"
              ref={(el) => { fileInputRefs.current[index] = el; }}
              onChange={(e) => handleFileChange(e, doc.id)}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            {hasSubmitted ? (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteSubmission(doc.submission_status!.submission_id!)}
                disabled={!isAllowed}
              >
                Delete Submission
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AttachFileIcon />}
                onClick={() => handleUploadClick(index)}
                disabled={!isAllowed}
              >
                Submit Document
              </Button>
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
      {/* Progress chart */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress 
              variant="determinate" 
              value={completionPercentage} 
              size={100} 
              thickness={4} 
              sx={{ color: 'white' }}
            />
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
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {`${completionPercentage}%`}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              Project Progress
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {submittables.filter(doc => doc.submission_status?.has_submitted).length} of {submittables.length} documents submitted
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          p: 2,
          borderRadius: 2
        }}>
          <TimelineIcon />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {completionPercentage === 100 
              ? 'All documents submitted!' 
              : `${submittables.length - submittables.filter(doc => doc.submission_status?.has_submitted).length} documents remaining`}
          </Typography>
        </Box>
      </Paper>
      
      {/* Ongoing/Upcoming Documents */}
      {(ongoingSubmittables.length > 0 || upcomingSubmittables.length > 0) && (
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
              color: 'primary.main'
            }}
          >
            <AssignmentIcon /> Ongoing/Upcoming Documents
          </Typography>
          
          <Grid container spacing={2}>
            {ongoingSubmittables.map((doc, index) => (
              <Grid item xs={12} key={doc.id}>
                {renderSubmittableItem(doc, index)}
              </Grid>
            ))}
            {upcomingSubmittables.map((doc, index) => (
              <Grid item xs={12} key={doc.id}>
                {renderSubmittableItem(doc, index)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Previous Documents */}
      {previousSubmittables.length > 0 && (
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
            {previousSubmittables.map((doc, index) => (
              <Grid item xs={12} key={doc.id}>
                {renderSubmittableItem(doc, index)}
              </Grid>
            ))}
          </Grid>
        </>
      )}

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