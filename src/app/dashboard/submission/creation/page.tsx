'use client';
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { 
  Edit, 
  Delete, 
  Visibility, 
  FileDownload, 
  CloudUpload,
  AccessTime,
  AttachFile,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

// Configure axios base URL to handle different ports
axios.defaults.baseURL = 'http://localhost:8000';

// Define Event interface with optional opensAt field
interface Event {
  id: number;
  name: string;
  opensAt: Dayjs | null;
  dueDate: Dayjs;
  description: string;
  referenceFile: File | null;
  file_url?: string;
  original_filename?: string;
}

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Axios Interceptor Debug:');
  console.log('Request URL:', config.url);
  console.log('Token exists:', !!token);
  console.log('Token value:', token);
  console.log('Request headers:', config.headers);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Updated headers:', config.headers);
  }
  return config;
}, (error) => {
  console.error('Axios Interceptor Error:', error);
  return Promise.reject(error);
});

const EventCreationApp: React.FC = () => {
  // State for form inputs
  const [name, setName] = useState<string>('');
  const [opensAt, setOpensAt] = useState<Dayjs | null>(null);
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [description, setDescription] = useState<string>('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [maxScore, setMaxScore] = useState<number>(100);

  // Handle reference file input
  const handleReferenceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReferenceFile(event.target.files[0]);
    }
  };

  // Publish event handler
  const handlePublishEvent = async () => {
    // Validate inputs
    if (!name || !dueDate || !description) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields (Name, Due Date, and Description)',
        severity: 'error'
      });
      return;
    }

    // Validate max score
    if (maxScore <= 0) {
      setSnackbar({
        open: true,
        message: 'Maximum score must be greater than zero',
        severity: 'error'
      });
      return;
    }

    // Validate that opensAt is before due date if opensAt is set
    if (opensAt && opensAt.isAfter(dueDate)) {
      setSnackbar({
        open: true,
        message: 'Opens at date must be before or equal to the due date',
        severity: 'error'
      });
      return;
    }

    // Validate that dueDate is not in the past
    if (dueDate.isBefore(dayjs())) {
      setSnackbar({
        open: true,
        message: 'Due date cannot be in the past',
        severity: 'error'
      });
      return;
    }

    // Check if user is logged in and has professor role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Please log in to create a submittable',
        severity: 'error'
      });
      return;
    }

    if (role == 'student') {
      setSnackbar({
        open: true,
        message: 'Only professors/TAs can create submittables',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', name);
      formData.append('deadline', dueDate.toISOString());
      formData.append('description', description);
      formData.append('max_score', maxScore.toString());
      if (opensAt) {
        formData.append('opens_at', opensAt.toISOString());
      }
      if (referenceFile) {
        formData.append('file', referenceFile);
      }

      // Debug logging for request
      console.log('Request Debug:');
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Make API call to create submittable
      const response = await axios.post('/submittables/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response:', response);

      if (response.status === 201 || response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Submittable created successfully!',
          severity: 'success'
        });

        // Reset form
        setName('');
        setOpensAt(null);
        setDueDate(null);
        setDescription('');
        setReferenceFile(null);

        // Redirect to the submittables list page after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard/submission';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating submittable:', error);
      
      let errorMessage = 'An error occurred while creating the submittable';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
          }, 3000);
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create submittables.';
        } else if (error.response.status === 422) {
          // Handle validation errors
          const validationErrors = error.response.data;
          if (Array.isArray(validationErrors)) {
            errorMessage = validationErrors.map(err => err.msg || err.message).join('\n');
          } else if (validationErrors.detail) {
            errorMessage = typeof validationErrors.detail === 'string' 
              ? validationErrors.detail 
              : 'Validation error occurred';
          }
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', p: 2 }}>
        {/* Course navigation */}
        <Box sx={{ mb: 3, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" component="div">
            <span style={{ color: '#3f51b5', cursor: 'pointer' }}>Course Home</span> / 
            <span style={{ cursor: 'pointer' }}> Create Submission</span>
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
            Create New Submittable
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Create a new submittable for your students to complete.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maximum Score"
                type="number"
                value={maxScore}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setMaxScore(value);
                }}
                required
                inputProps={{ 
                  min: 1,
                  step: 1,
                  placeholder: "Enter maximum possible score (e.g., 100)",
                  style: { 
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }
                }}
                helperText="Enter the maximum possible score for this submittable"
                sx={{ 
                  mb: 2,
                  '& input[type=number]': {
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Opens At"
                value={opensAt}
                onChange={(newValue) => setOpensAt(newValue)}
                ampm={true}
                minutesStep={1}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { mb: 2 },
                    placeholder: "MMM D, YYYY hh:mm AM/PM",
                    inputProps: {
                      pattern: "[0-9/: ]*[AaPp][Mm]?",
                      title: "Enter date and time (e.g., Jan 1, 2024 11:59 PM)"
                    }
                  },
                  actionBar: {
                    actions: ['clear', 'accept']
                  }
                }}
                format="MMM D, YYYY hh:mm A"
                closeOnSelect={false}
                onAccept={(newValue) => {
                  if (newValue) {
                    setOpensAt(newValue);
                  }
                }}
                disableOpenPicker={false}
                openTo="hours"
                readOnly={false}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                ampm={true}
                minutesStep={1}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { mb: 2 },
                    placeholder: "MMM D, YYYY hh:mm AM/PM",
                    inputProps: {
                      pattern: "[0-9/: ]*[AaPp][Mm]?",
                      title: "Enter date and time (e.g., Jan 1, 2024 11:59 PM)"
                    }
                  },
                  actionBar: {
                    actions: ['clear', 'accept']
                  }
                }}
                format="MMM D, YYYY hh:mm A"
                closeOnSelect={false}
                onAccept={(newValue) => {
                  if (newValue) {
                    setDueDate(newValue);
                  }
                }}
                disableOpenPicker={false}
                openTo="hours"
                readOnly={false}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Reference File (Optional)
              </Typography>
              {referenceFile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label={referenceFile.name}
                    onDelete={() => setReferenceFile(null)}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFile />}
                    size="small"
                  >
                    Change Reference File
                    <input
                      type="file"
                      hidden
                      onChange={handleReferenceFileChange}
                    />
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFile />}
                  sx={{ mb: 2 }}
                >
                  Upload Reference File
                  <input
                    type="file"
                    hidden
                    onChange={handleReferenceFileChange}
                  />
                </Button>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePublishEvent}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Create Submittable
              </Button>
            </Grid>
          </Grid>
        </Paper>

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
    </LocalizationProvider>
  );
};

export default EventCreationApp;