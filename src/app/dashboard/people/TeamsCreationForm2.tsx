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
  CircularProgress,
  Divider,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GroupsIcon from '@mui/icons-material/Groups';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { buttonStyles } from './constants/theme';
import axios from 'axios';

const TeamsCreationForm2 = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<string | null>(null);
  const [errorList, setErrorList] = useState<string | null>(null);

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
        message: 'Please select a CSV file first',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:8000/teams/upload-csv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitStatus({
        severity: 'success',
        message: 'File uploaded successfully and data saved to the database!',
      });
      setCreatedUsers(response.data.createdUsers || null);
      setErrorList(response.data.errors || null);
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
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Card */}
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
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <GroupsIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                Teams Creation
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Upload a CSV file to create multiple teams at once
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#fbfdff',
          border: '1px solid #e3f2fd',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* File Upload Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#033076', fontWeight: 500 }}>
              CSV File Upload
            </Typography>
            <Paper
              sx={{
                width: '100%',
                maxWidth: '600px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: 1.5,
                mb: 2,
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
              <Button
                variant="contained"
                onClick={handleAttachClick}
                startIcon={<AttachFileIcon />}
                sx={{
                  backgroundColor: '#033076',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#02225a',
                  },
                  borderRadius: '4px',
                }}
              >
                Browse
              </Button>
            </Paper>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              The CSV file should be in the format: <strong>team name - member1 - member2 - ... - member10</strong>
            </Typography>

            {selectedFile && (
              <Alert
                severity="success"
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  mb: 3,
                }}
              >
                Successfully selected file: {selectedFile.name}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!selectedFile || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <UploadFileIcon />}
              sx={{
                backgroundColor: '#033076',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#02225a',
                },
                px: 4,
                py: 1,
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {isSubmitting ? 'Uploading...' : 'Upload and Create Teams'}
            </Button>
          </Box>

          {/* Results Section */}
          {submitStatus && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 4 }} />
              <Typography variant="h6" sx={{ mb: 3, color: '#033076', fontWeight: 500 }}>
                Upload Results
              </Typography>

              <Alert
                severity={submitStatus.severity}
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  mb: 3,
                }}
              >
                {submitStatus.message.split('\n').map((line, index) => (
                  <Typography key={index} variant="body2">
                    {line}
                  </Typography>
                ))}
              </Alert>

              {/* Details Cards */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Created Teams Card */}
                <Paper
                  sx={{
                    flex: 1,
                    minWidth: '300px',
                    p: 3,
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #c8e6c9',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, fontWeight: 500 }}>
                    Created Teams
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#1b5e20',
                      fontFamily: 'inherit',
                    }}
                  >
                    {createdUsers || 'No teams created yet.'}
                  </Typography>
                </Paper>

                {/* Errors Card */}
                <Paper
                  sx={{
                    flex: 1,
                    minWidth: '300px',
                    p: 3,
                    backgroundColor: '#ffebee',
                    border: '1px solid #ffcdd2',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#c62828', mb: 2, fontWeight: 500 }}>
                    Errors
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#b71c1c',
                      fontFamily: 'inherit',
                    }}
                  >
                    {errorList || 'No errors.'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TeamsCreationForm2;