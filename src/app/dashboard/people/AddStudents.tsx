'use client';
import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Input,
  IconButton,
  Alert,
  Button,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Header from './components/Header';
import { buttonStyles } from './constants/theme';
import axios from 'axios';
import { currentConfig } from '@/config';

const AddStudents = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please select a CSV file');
        event.target.value = ''; // Reset input
      }
    }
  };
  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitStatus({
        severity: 'error',
        message: 'Please select a CSV file first'
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${currentConfig.apiBaseUrl}/upload-students/`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitStatus({
        severity: 'success',
        message: 'File uploaded successfully!'
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setSubmitStatus({
        severity: 'error',
        message: 'Failed to upload file. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ 
      p: 3 }}>
      {/* <Header title="ADD STUDENTS" /> */}

      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: '50px',
        }}
      >
        Add Students
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Paper
          sx={{
            width: '100%',
            maxWidth: '600px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
          }}
        >
          <Input
            placeholder="Attach .csv file"
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
            accept=".csv"
            style={{ display: 'none' }}
          />
          <IconButton
            onClick={handleAttachClick}
            sx={{
              ...buttonStyles.secondary,
              borderRadius: '4px',
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </Paper>

        {selectedFile && (
          <Alert 
            severity="success" 
            sx={{ 
              width: '100%', 
              maxWidth: '600px',
            }}
          >
            Successfully selected file: {selectedFile.name}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            mt: 2,
            backgroundColor: '#000060',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1765c1',
            },
            px: 4,
            borderRadius: '4px',
          }}
        >
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </Button>

        {submitStatus && (
          <Alert 
            severity={submitStatus.severity} 
            sx={{ 
              width: '100%', 
              maxWidth: '600px',
              mt: 2,
            }}
          >
            {submitStatus.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AddStudents;