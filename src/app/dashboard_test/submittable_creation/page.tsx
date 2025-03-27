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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', name);
      formData.append('deadline', dueDate.toISOString());
      formData.append('description', description);
      if (opensAt) {
        formData.append('opens_at', opensAt.toISOString());
      }
      if (referenceFile) {
        formData.append('file', referenceFile);
      }

      // Make API call to create submittable
      const response = await axios.post('/submittables/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
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
      }
    } catch (error: any) {
      console.error('Error creating submittable:', error);
      let errorMessage = 'An error occurred while creating the submittable';
      
      if (error.response) {
        // Handle specific error messages from the backend
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.detail || 'Invalid input data';
            break;
          case 401:
            errorMessage = 'You are not authorized to create submittables';
            break;
          case 404:
            errorMessage = 'User not found';
            break;
          case 500:
            errorMessage = 'Server error occurred';
            break;
          default:
            errorMessage = error.response.data.detail || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'No response received from server';
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
                label="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                required
                sx={{ mb: 2 }}
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
                label="Description (Optional)"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
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