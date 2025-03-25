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
  Snackbar
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

interface SubmittableType {
  id: number;
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
}

const DocumentSubmissionList: React.FC = () => {
  const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [submittables, setSubmittables] = useState<SubmittableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    formData.append('files', file);

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

  const handleReferenceFileDownload = async (submittableId: number, fileId: number, fileName: string) => {
    try {
      console.log('Downloading reference file:', { submittableId, fileId, fileName });
      
      const response = await axios.get(
        `/submittables/${submittableId}/reference-files/${fileId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      console.log('Download response:', {
        status: response.status,
        headers: response.headers,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
      });

      // Check if we received a valid response
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty file data');
      }

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
      console.error('Error downloading reference file:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
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

  // Render a single submittable item
  const renderSubmittableItem = (doc: SubmittableType, index: number) => {
    const isAllowed = isSubmissionAllowed(doc);
    const hasSubmitted = doc.submission_status?.has_submitted;
    
    return (
      <Paper 
        key={doc.id} 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderLeft: 4, 
          borderColor: hasSubmitted ? 'success.main' : isAllowed ? 'primary.main' : 'text.disabled'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label="Document" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 2 }} 
              />
              <Typography variant="h6" component="div">
                {doc.description}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              {doc.opens_at && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Opens at: {formatDate(doc.opens_at)}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Due on: {formatDate(doc.deadline)}
              </Typography>
            </Box>

            {/* Reference Files Section */}
            {doc.reference_files && doc.reference_files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Reference Files:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {doc.reference_files.map((file) => (
                    <Button
                      key={file.id}
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => handleReferenceFileDownload(doc.id, file.id, file.original_filename)}
                      sx={{ textTransform: 'none' }}
                    >
                      {file.original_filename}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            {hasSubmitted && doc.submission_status?.submitted_on && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Submitted: {formatDate(doc.submission_status.submitted_on)}
                  {doc.submission_status.original_filename && ` - ${doc.submission_status.original_filename}`}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <input
              type="file"
              ref={(el) => { fileInputRefs.current[index] = el; }}
              onChange={(e) => handleFileChange(e, doc.id)}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            <Button
              variant={hasSubmitted ? "outlined" : "contained"}
              color={hasSubmitted ? "success" : "primary"}
              startIcon={hasSubmitted ? <CheckCircleIcon /> : <AttachFileIcon />}
              onClick={() => handleUploadClick(index)}
              disabled={!isAllowed}
            >
              {hasSubmitted ? 'Resubmit' : 'Submit Document'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
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
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Course navigation */}
      <Box sx={{ mb: 3, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" component="div">
          <span style={{ color: '#3f51b5', cursor: 'pointer' }}>Course Home</span> / 
          <span style={{ cursor: 'pointer' }}> Documents</span>
        </Typography>
      </Box>
      
      {/* Progress chart */}
      <Paper 
        elevation={3} 
        sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
            <CircularProgress 
              variant="determinate" 
              value={completionPercentage} 
              size={80} 
              thickness={4} 
              color="primary" 
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
              <Typography variant="h6" component="div" color="text.secondary">
                {`${completionPercentage}%`}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              Project Progress
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {submittables.filter(doc => doc.submission_status?.has_submitted).length} of {submittables.length} documents submitted
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="body2" color={completionPercentage === 100 ? 'success.main' : 'info.main'}>
            {completionPercentage === 100 
              ? 'All documents submitted!' 
              : `${submittables.length - submittables.filter(doc => doc.submission_status?.has_submitted).length} documents remaining`}
          </Typography>
        </Box>
      </Paper>
      
      {/* Ongoing/Upcoming Documents */}
      {(ongoingSubmittables.length > 0 || upcomingSubmittables.length > 0) && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Ongoing/Upcoming Documents
          </Typography>
          
          {ongoingSubmittables.map((doc, index) => renderSubmittableItem(doc, index))}
          {upcomingSubmittables.map((doc, index) => renderSubmittableItem(doc, index))}
        </>
      )}
      
      {/* Previous Documents */}
      {previousSubmittables.length > 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
            Previous Documents
          </Typography>
          
          {previousSubmittables.map((doc, index) => renderSubmittableItem(doc, index))}
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentSubmissionList;