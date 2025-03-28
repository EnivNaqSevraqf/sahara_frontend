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

const AddTAs = () => {
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
      const response = await axios.post(`${currentConfig.apiBaseUrl}/people/upload-csv/`, formData, {
        headers: {
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
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ffffff', // Bright white background for better contrast
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', // Enhanced shadow for depth
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          color: '#1a73e8', // Bright blue for the heading
          fontWeight: 600, // Slightly bolder font weight
        }}
      >
        Add TAs
      </Typography>

      <Paper
        sx={{
          width: '100%',
          maxWidth: '600px',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          border: '1px solid #d1d1d1',
          borderRadius: '12px',
          backgroundColor: '#f7f9fc', // Light blue-gray background for the form
        }}
      >
        <Input
          placeholder="Attach .csv file"
          fullWidth
          disableUnderline
          sx={{
            px: 2,
            py: 1,
            border: '1px solid #b0bec5',
            borderRadius: '6px',
            backgroundColor: '#e3f2fd', // Light blue background for input
            color: '#0d47a1', // Dark blue text for input
          }}
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
            borderRadius: '6px',
            backgroundColor: '#0d47a1', // Darker blue matching the sidebar color
            color: '#fff',
            '&:hover': {
              backgroundColor: '#002171', // Even darker blue for hover effect
            },
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
            mt: 2,
            backgroundColor: '#e8f5e9', // Light green background for success
            color: '#2e7d32', // Dark green text for success
            border: '1px solid #c8e6c9',
            borderRadius: '6px',
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
          backgroundColor: '#0d47a1', // Darker blue matching the sidebar color
          color: '#fff',
          '&:hover': {
            backgroundColor: '#002171', // Even darker blue for hover effect
          },
          px: 4,
          py: 1.5,
          borderRadius: '6px',
          fontSize: '1rem',
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
            backgroundColor:
              submitStatus.severity === 'success' ? '#e8f5e9' : '#ffebee', // Green for success, red for error
            color:
              submitStatus.severity === 'success' ? '#2e7d32' : '#c62828', // Dark green for success, dark red for error
            border: '1px solid',
            borderColor:
              submitStatus.severity === 'success' ? '#c8e6c9' : '#ef9a9a',
            borderRadius: '6px',
          }}
        >
          {submitStatus.message}
        </Alert>
      )}
    </Box>
  );
};

export default AddTAs;