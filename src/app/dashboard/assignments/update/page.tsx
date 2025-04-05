'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  Divider,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { currentConfig } from '@/config';
// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;
interface AssignableType {
  id: number;
  title: string;
  description: string;
  deadline: string;
  opens_at?: string;
  reference_files: Array<{
    id: number;
    original_filename: string;
  }>;
}

const UpdateAssignable: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignableId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignable, setAssignable] = useState<AssignableType | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (assignableId) {
      fetchAssignable();
    } else {
      setError('No assignable ID provided');
      setLoading(false);
    }
  }, [assignableId]);

  const fetchAssignable = async () => {
    try {
      const response = await axios.get(`/assignables/${assignableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAssignable(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching assignable:', err);
      setError(err.response?.data?.detail || 'Failed to fetch assignable details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!assignable) return;
    const { name, value } = e.target;
    
    // For date fields, ensure the value includes seconds and milliseconds
    if (name === 'deadline' || name === 'opens_at') {
      const date = new Date(value);
      setAssignable(prev => prev ? { ...prev, [name]: date.toISOString().slice(0, 16) } : null);
    } else {
      setAssignable(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignable) return;

    try {
      setSaving(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', assignable.title);
      
      // Format dates to ISO 8601 with UTC timezone
      const deadlineDate = new Date(assignable.deadline);
      const formattedDeadline = deadlineDate.toISOString();
      formData.append('deadline', formattedDeadline);

      if (assignable.opens_at) {
        const opensAtDate = new Date(assignable.opens_at);
        const formattedOpensAt = opensAtDate.toISOString();
        formData.append('opens_at', formattedOpensAt);
      }

      formData.append('description', assignable.description);

      await axios.put(`/assignables/${assignableId}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Assignable updated successfully!',
        severity: 'success'
      });

      // Redirect back to the submission page after a short delay
      setTimeout(() => {
        router.push('/dashboard/assignments');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating assignable:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to update assignable',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard/assignments')}
          sx={{ mt: 2 }}
        >
          Back to Assignments
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Gradeables header with gradient */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <EditIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Update Assignment
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Update the details of your assignment
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 4,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={assignable?.title || ''}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Deadline"
                name="deadline"
                type="datetime-local"
                value={assignable?.deadline ? assignable.deadline.slice(0, 16) : ''}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Opens At (Optional)"
                name="opens_at"
                type="datetime-local"
                value={assignable?.opens_at ? assignable.opens_at.slice(0, 16) : ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={assignable?.description || ''}
                onChange={handleChange}
                required
                multiline
                rows={4}
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }
                }}
              />
            </Grid>

            {assignable?.reference_files && assignable.reference_files.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 500
                }}>
                  Reference Files:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {assignable.reference_files.map((file) => (
                    <Typography
                      key={file.id}
                      variant="body2"
                      sx={{
                        bgcolor: 'action.hover',
                        p: 1,
                        borderRadius: 1,
                        display: 'inline-block',
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      {file.original_filename}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/dashboard/assignments')}
                  disabled={saving}
                  sx={{
                    textTransform: 'none',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                  sx={{
                    textTransform: 'none',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 600,
                    height: 48,
                    px: 4,
                    backgroundColor: '#3f51b5',
                    '&:hover': {
                      backgroundColor: '#303f9f'
                    }
                  }}
                >
                  {saving ? 'Updating...' : 'Update Assignment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateAssignable;
