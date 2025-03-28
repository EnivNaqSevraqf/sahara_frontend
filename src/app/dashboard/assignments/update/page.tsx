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

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

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
      console.error('Error fetching assignment:', err);
      setError(err.response?.data?.detail || 'Failed to fetch assignment details');
    } finally {
      setLoading(false);
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
      formData.append('deadline', assignable.deadline);
      formData.append('description', assignable.description);
      if (assignable.opens_at) {
        formData.append('opens_at', assignable.opens_at);
      }

      await axios.put(`/assignables/${assignableId}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSnackbar({
        open: true,
        message: 'Assignment updated successfully!',
        severity: 'success'
      });

      // Redirect back to the submission page after a short delay
      setTimeout(() => {
        router.push('/dashboard/assignments');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to update assignment',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!assignable) return;
    const { name, value } = e.target;
    setAssignable(prev => prev ? { ...prev, [name]: value } : null);
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
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Course navigation */}
      <Box sx={{ mb: 3, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" component="div">
          <span style={{ color: '#3f51b5', cursor: 'pointer' }}>Course Home</span> / 
          <span style={{ cursor: 'pointer' }}> Update Assignment</span>
        </Typography>
      </Box>

      {/* Blue Banner */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Update Assignment
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Update the details of your assignment.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
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
                sx={{ mb: 2 }}
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
                sx={{ mb: 2 }}
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
                sx={{ mb: 2 }}
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
                sx={{ mb: 2 }}
              />
            </Grid>

            {assignable?.reference_files && assignable.reference_files.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
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
                        display: 'inline-block'
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
                  onClick={() => router.push('/dashboard/submission')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving ? 'Updating...' : 'Update Submittable'}
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
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateAssignable;