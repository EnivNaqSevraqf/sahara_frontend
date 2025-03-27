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
  Snackbar
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { currentConfig } from '@/config';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setSelectedFile(file);
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

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      };

      // Create gradeable
      const gradeableResponse = await axios.post(
        'http://localhost:8000/gradeables/create',
        {
          title: title.trim(),
          max_points: maxPoints
        },
        axiosConfig
      );

      const gradeableId = gradeableResponse.data.id;

      // Upload scores
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(
        `http://localhost:8000/gradeables/${gradeableId}/upload-scores`,
        formData,
        {
          ...axiosConfig,
          headers: {
            ...axiosConfig.headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setSubmitStatus({
        severity: 'success',
        message: 'Gradeable created and scores uploaded successfully!'
      });

      // Navigate after successful upload
      setTimeout(() => {
        router.push('/dashboard_test/scores');
      }, 1500);

    } catch (error: any) {
      console.error('Submission error:', error.response || error);
      
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || 'Failed to create gradeable and upload scores';
      
      setSubmitStatus({
        severity: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" align="center" sx={{
        mb: 4,
        p: 2,
        border: '1px solid #e0e0e0',
        borderRadius: '50px',
        color: '#1976d2'
      }}>
        Create Gradeable and Upload Scores
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Paper sx={{ p: 3, width: '100%', maxWidth: '600px' }}>
          <TextField
            label="Test/Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            error={titleError}
            helperText={titleError ? "Title is required" : ""}
            sx={{ mb: 2 }}
          />
          
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
            sx={{ mb: 2 }}
          />
          
          <Paper sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
          }}>
            <Input
              placeholder="Attach scores CSV file"
              fullWidth
              disableUnderline
              sx={{ px: 2 }}
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
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderRadius: '4px',
                backgroundColor: '#1976d2',
                color: 'white',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              <AttachFileIcon />
            </IconButton>
          </Paper>
        </Paper>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            mt: 2,
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': { backgroundColor: '#1565c0' },
            px: 4,
            borderRadius: '4px',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Create Gradeable'}
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
              sx={{ width: '100%' }}
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