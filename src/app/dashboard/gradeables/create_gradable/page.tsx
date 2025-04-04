'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Input,
  IconButton,
  Alert,
  Button,
  TextField,
  Snackbar,
  Divider,
  Grid
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface SubmitStatus {
  severity: 'success' | 'error';
  message: string;
}

const CreateGradeable: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [maxPoints, setMaxPoints] = useState<number>(100);

  // Validation states
  const [titleError, setTitleError] = useState(false);
  const [maxPointsError, setMaxPointsError] = useState(false);

  // Validate authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitStatus({
        severity: 'error',
        message: 'Authentication required. Please login.'
      });
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [router]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Title validation
    if (!title.trim()) {
      setTitleError(true);
      isValid = false;
    } else {
      setTitleError(false);
    }

    // Max points validation
    if (maxPoints <= 0 || maxPoints > 1000) {
      setMaxPointsError(true);
      isValid = false;
    } else {
      setMaxPointsError(false);
    }

    return isValid;
  };

  const validateCsvFormat = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        
        // Check if file is empty
        if (lines.length < 2) {
          setSubmitStatus({
            severity: 'error',
            message: 'CSV file must contain a header row and at least one data row'
          });
          resolve(false);
          return;
        }

        // Check header row
        const header = lines[0].trim().toLowerCase().split(',');
        const requiredColumns = ['roll_no', 'score'];
        const missingColumns = requiredColumns.filter(col => 
          !header.includes(col.toLowerCase())
        );

        if (missingColumns.length > 0) {
          setSubmitStatus({
            severity: 'error',
            message: `CSV file must contain the following columns: ${missingColumns.join(', ')}`
          });
          resolve(false);
          return;
        }

        // Validate data rows
        const scoreIndex = header.indexOf('score');
        let isValid = true;
        let lineNumber = 2; // Start from line 2 (after header)

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines

          const values = line.split(',');
          
          // Check if row has correct number of columns
          if (values.length !== header.length) {
            setSubmitStatus({
              severity: 'error',
              message: `Invalid number of columns in row ${lineNumber}. Expected ${header.length} columns.`
            });
            isValid = false;
            break;
          }

          // Validate score value
          const score = parseFloat(values[scoreIndex]);
          if (isNaN(score) || score < 0 || score > maxPoints) {
            setSubmitStatus({
              severity: 'error',
              message: `Invalid score in row ${lineNumber}. Score must be a number between 0 and ${maxPoints}.`
            });
            isValid = false;
            break;
          }

          lineNumber++;
        }

        resolve(isValid);
      };

      reader.onerror = () => {
        setSubmitStatus({
          severity: 'error',
          message: 'Error reading CSV file'
        });
        resolve(false);
      };

      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
      const isValidType = allowedTypes.includes(file.type) || file.name.endsWith('.csv');
      
      if (isValidType) {
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          setSubmitStatus({
            severity: 'error',
            message: 'File size exceeds 10MB limit'
          });
          return;
        }

        // Validate CSV format
        const isValidFormat = await validateCsvFormat(file);
        if (isValidFormat) {
          setSelectedFile(file);
          setSubmitStatus({
            severity: 'success',
            message: 'CSV file format is valid'
          });
        } else {
          event.target.value = ''; // Reset input
        }
      } else {
        setSubmitStatus({
          severity: 'error',
          message: 'Please select a valid CSV file'
        });
        event.target.value = ''; // Reset input
      }
    }
  };

  const handleSubmit = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    // Validate file upload
    if (!selectedFile) {
      setSubmitStatus({
        severity: 'error',
        message: 'Please select a CSV file to upload scores'
      });
      return;
    }

    // Validate CSV format again before submitting
    const isValidFormat = await validateCsvFormat(selectedFile);
    if (!isValidFormat) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true
      };
      const formData = new FormData();
      formData.append('title', title);
      formData.append('max_points', maxPoints.toString());
      formData.append('file', selectedFile); // Append the CSV file
  

      // Create gradeable
      const gradeableResponse = await axios.post(
        'http://localhost:8000/gradeables/create',
        formData,
        {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (!gradeableResponse.data.id) {
        throw new Error('Failed to create gradeable: No ID returned');
      }

      const gradeableId = gradeableResponse.data.id;

      setSubmitStatus({
        severity: 'success',
        message: 'Gradeable created and scores uploaded successfully!'
      });

      setTimeout(() => {
        router.push('/dashboard/gradeables');
      }, 1500);

    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Handle error message properly
      let errorMessage = 'Failed to create gradeable and upload scores';
      
      if (error.response?.data?.detail && typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      setSubmitStatus({
        severity: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '1200px', 
      margin: '0 auto',
      bgcolor: 'background.default'
    }}>
      {/* Course navigation */}
      <Box sx={{ 
        mb: 4, 
        pb: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="body2" component="div">
            <span style={{ color: '#3f51b5', cursor: 'pointer', fontWeight: 500 }}>Course Home</span> / 
            <span style={{ cursor: 'pointer', color: 'text.secondary' }}> Gradeables</span>
          </Typography>
        </Box>
      </Box>

      {/* Gradient Header */}
      <Box 
        sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
          borderRadius: 2,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Typography variant="h4" component="h1" sx={{
          fontWeight: 600,
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <AssignmentIcon sx={{ fontSize: '2rem' }} /> Create Gradeable and Upload Scores
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.9, maxWidth: '700px', mx: 'auto' }}>
          Create a new gradeable by providing a title, maximum points, and uploading a CSV file with student scores.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Paper sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: '700px',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'text.primary',
                  letterSpacing: '-0.01em'
                }}
              >
                Gradeable Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Test/Assignment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                error={titleError}
                helperText={titleError ? "Title is required" : ""}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Maximum Points"
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(Number(e.target.value))}
                fullWidth
                required
                error={maxPointsError}
                helperText={maxPointsError ? "Points must be between 1 and 1000" : ""}
                inputProps={{ min: 1, max: 1000 }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'text.primary',
                  letterSpacing: '-0.01em'
                }}
              >
                Upload Scores
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Paper sx={{
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                }
              }}>
                <Input
                  placeholder="Attach scores CSV file"
                  fullWidth
                  disableUnderline
                  sx={{ 
                    px: 2,
                    py: 1,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                  value={selectedFile ? selectedFile.name : ''}
                  readOnly
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv,application/vnd.ms-excel"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="contained"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<AttachFileIcon />}
                  sx={{
                    borderRadius: '4px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': { backgroundColor: '#1565c0' },
                    height: '100%',
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Browse
                </Button>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Upload a CSV file containing student scores. Maximum file size: 10MB.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={<CloudUploadIcon />}
          sx={{
            mt: 2,
            mb: 4,
            backgroundColor: '#1976d2',
            color: '#fff',
            px: 4,
            py: 1,
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#1565c0',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          {isSubmitting ? 'Creating Gradeable...' : 'Create Gradeable'}
        </Button>

        {submitStatus && (
          <Snackbar 
            open={!!submitStatus} 
            autoHideDuration={6000} 
            onClose={() => setSubmitStatus(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity={submitStatus.severity} 
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
              onClose={() => setSubmitStatus(null)}
            >
              {submitStatus.message}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
};

export default CreateGradeable;