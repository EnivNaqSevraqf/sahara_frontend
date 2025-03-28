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
import Header from '../people/components/Header';
import { buttonStyles } from '../people/constants/theme';
import axios from 'axios';

const TeamsCreationForm2 = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitStatus({
        severity: 'error',
        message: 'Please select a CSV file first'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/teams/upload-csv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitStatus({
        severity: 'success',
        message: 'File uploaded successfully and data saved to the database!'
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to upload file. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.detail || errorMessage;
      }
      setSubmitStatus({
        severity: 'error',
        message: errorMessage
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header title="TEAMS CREATION CSV UPLOAD" />
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
        TEAMS CREATION CSV UPLOAD
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
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          The CSV file should be in the format: team name - member1 - member2 - ... - member10
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedFile}
          sx={{
            backgroundColor: selectedFile ? '#1a73e8' : '#e0e0e0',
            color: '#fff',
            '&:hover': {
              backgroundColor: selectedFile ? '#1765c1' : '#e0e0e0',
            },
            px: 4,
            borderRadius: '4px',
            mt: 2,
          }}
        >
          Submit
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

export default TeamsCreationForm2;