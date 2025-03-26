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

const CreateGradeable = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxPoints, setMaxPoints] = useState<number>(100);

  // Add token validation on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitStatus({
        severity: 'error',
        message: 'No authentication token found. Please login again.'
      });
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
      const isValidType = allowedTypes.includes(file.type) || file.name.endsWith('.csv');
      
      if (isValidType) {
        // Validate file size (e.g., max 10MB)
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
    // Enhanced input validation
    const validationErrors = [];
    
    if (!title.trim()) {
      validationErrors.push('Assignment title is required');
    }
    
    if (!selectedFile) {
      validationErrors.push('Please select a CSV file');
    }
    
    if (maxPoints <= 0) {
      validationErrors.push('Maximum points must be greater than 0');
    }

    if (validationErrors.length > 0) {
      setSubmitStatus({
        severity: 'error',
        message: validationErrors.join('. ')
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Update axios config with CORS settings
      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      };

      // Create gradeable with minimal details
      const gradeableResponse = await axios.post(
        'http://localhost:8000/gradeables/create',
        {
          title: title.trim(),
          description: description.trim() || 'Offline Test Scores',
          max_points: maxPoints,
          due_date: new Date().toISOString() // Use current date as default
        },
        axiosConfig
      );

      const gradeableId = gradeableResponse.data.id;

      // Upload scores
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

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
        message: 'Scores uploaded successfully!'
      });

      // Navigate after successful upload
      setTimeout(() => {
        router.push('/dashboard_test/scores');
      }, 1500);

    } catch (error: any) {
      console.error('Error details:', error.response || error);
      
      let errorMessage = 'Failed to upload scores';
      
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please login again as professor or TA.';
        localStorage.removeItem('token');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('token');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: '50px',
          color: '#1976d2'
        }}
      >
        Upload Test Scores
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Paper sx={{ p: 3, width: '100%', maxWidth: '600px' }}>
          <TextField
            label="Test/Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />
          
          <TextField
            label="Maximum Points"
            type="number"
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            fullWidth
            required
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 1000 }}
          />
          
          <Paper
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #e0e0e0',
            }}
          >
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
              onClick={handleAttachClick}
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
          {isSubmitting ? 'Uploading...' : 'Upload Scores'}
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