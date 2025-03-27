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

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

interface SubmissionType {
  id: number;
  team_id: number;
  submitted_on: string;
  original_filename: string;
  team: {
    name: string;
  };
}

interface SubmittableType {
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
}

const DocumentSubmissionList: React.FC = () => {
  const router = useRouter();
  const [submittables, setSubmittables] = useState<SubmittableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSubmittable, setNewSubmittable] = useState({
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

  const [selectedSubmittable, setSelectedSubmittable] = useState<SubmittableType | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubmittables();
  }, []);

  useEffect(() => {
    const totalSubmittables = submittables.length;
    const completedSubmittables = submittables.filter(doc => doc.submission_status?.has_submitted).length;
    const percentage = totalSubmittables > 0 ? Math.round((completedSubmittables / totalSubmittables) * 100) : 0;
    setCompletionPercentage(percentage);
  }, [submittables]);

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

  const fetchSubmittables = async () => {
    try {
      setLoading(true);
      console.log('Fetching submittables...');
      
      const response = await axios.get('/submittables/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Submittables response:', response.data);
      
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

      await axios.delete(`/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

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
    }
  };

  const handleReferenceFileDownload = async (submittableId: number, fileName: string) => {
    try {
      const response = await axios.get(
        `/submittables/${submittableId}/reference-files/download`,
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

  const fetchSubmissions = async (submittableId: number) => {
    try {
      const response = await axios.get(`/submittables/${submittableId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Find the submittable in the list
      const submittable = submittables.find(s => s.id === submittableId);
      if (submittable) {
        setSelectedSubmittable(submittable);
        setSubmissions(response.data);
        setSubmissionsDialogOpen(true);
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

  const handleDeleteSubmittable = async (submittableId: number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this submittable? This action cannot be undone.')) {
        return;
      }

      await axios.delete(`/submittables/${submittableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh submittables list
      await fetchSubmittables();
      
      setSnackbar({
        open: true,
        message: 'Submittable deleted successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error deleting submittable:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to delete submittable. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleUpdateSubmittable = (submittableId: number) => {
    router.push(`/dashboard_test/project/submission/prof/update?id=${submittableId}`);
  };

  const handleCreateSubmittable = () => {
    router.push('/dashboard_test/project/submission/prof/creation');
  };

  // Render a single submittable item
  const renderSubmittableItem = (doc: SubmittableType, index: number) => {
    const isAllowed = isSubmissionAllowed(doc);
    const hasSubmitted = doc.submission_status?.has_submitted;
    const isExpanded = expandedId === doc.id;
    const isCreator = currentUserId === doc.creator_id;
    
    console.log('Rendering submittable:', { // Debug log
      docId: doc.id,
      currentUserId,
      creatorId: doc.creator_id,
      isCreator
    });
    
    return (
      <Card 
        key={doc.id} 
        sx={{ 
          mb: 2,
          borderLeft: 4,
          borderColor: hasSubmitted ? 'success.main' : isAllowed ? 'primary.main' : 'text.disabled'
        }}
      >
        <CardContent 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          onClick={() => handleExpandClick(doc.id)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label="Document" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 2 }} 
              />
              <Typography variant="h6" component="div">
                {doc.title}
              </Typography>
            </Box>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
        </CardContent>

        <Collapse in={isExpanded}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {doc.description}
            </Typography>

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
                      onClick={() => handleReferenceFileDownload(doc.id, file.original_filename)}
                      sx={{ textTransform: 'none' }}
                    >
                      {file.original_filename}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            {hasSubmitted && doc.submission_status?.submitted_on && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Submitted: {formatDate(doc.submission_status.submitted_on)}
                  {doc.submission_status.original_filename && (
                    <>
                      {' - '}
                      <Button
                        size="small"
                        onClick={() => handleSubmissionDownload(doc.submission_status!.submission_id!, doc.submission_status!.original_filename!)}
                        sx={{ textTransform: 'none', minWidth: 'auto', p: 0, ml: 0.5 }}
                      >
                        {doc.submission_status.original_filename}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSubmission(doc.submission_status!.submission_id!)}
                        sx={{ ml: 0.5, color: 'error.main' }}
                        title="Delete submission"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            {isCreator && (
              <>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<AttachFileIcon />}
                  onClick={() => {
                    console.log('Fetching submissions for:', doc.id);
                    fetchSubmissions(doc.id);
                  }}
                  sx={{ mr: 1 }}
                >
                  View All Submissions
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => handleUpdateSubmittable(doc.id)}
                  sx={{ mr: 1 }}
                >
                  Update Submittable
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    console.log('Deleting submittable:', doc.id);
                    handleDeleteSubmittable(doc.id);
                  }}
                >
                  Delete Submittable
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
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Course navigation and Create button */}
      <Box sx={{ mb: 3, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" component="div">
          <span style={{ color: '#3f51b5', cursor: 'pointer' }}>Course Home</span> / 
          <span style={{ cursor: 'pointer' }}> Documents</span>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleCreateSubmittable}
        >
          Create Submittable
        </Button>
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

      {/* Submissions Dialog */}
      <Dialog
        open={submissionsDialogOpen}
        onClose={() => {
          setSubmissionsDialogOpen(false);
          setSelectedSubmittable(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          All Submissions for {selectedSubmittable?.title}
        </DialogTitle>
        <DialogContent>
          {submissions.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No submissions yet
            </Typography>
          ) : (
            <List>
              {submissions.map((submission) => (
                <ListItem key={submission.id}>
                  <ListItemText
                    primary={submission.original_filename}
                    secondary={`Team: ${submission.team.name} | Submitted: ${formatDate(submission.submitted_on)}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSubmissionDownload(submission.id, submission.original_filename)}
                    >
                      Download
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSubmissionsDialogOpen(false);
            setSelectedSubmittable(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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