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
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
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
  const [createdUsers, setCreatedUsers] = useState<string>('');
  const [errorList, setErrorList] = useState<string>('');
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
        message: 'Please select a CSV file first',
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${currentConfig.apiBaseUrl}/upload-tas/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const { message, created_tas, errors } = response.data;

      let successMessage = message;
      let createdUsersList = '';
      if (created_tas && created_tas.length > 0) {
        createdUsersList = created_tas
          .map(
            (ta: { name: string; email: string; username: string; temp_password: string }) =>
              `- ${ta.name} (${ta.username})`
          )
          .join('\n');
      }

      let errorList = '';
      if (errors && errors.length > 0) {
        errorList = errors.map((error: string) => `- ${error}`).join('\n');
      }

      setSubmitStatus({
        severity: 'success',
        message: successMessage,
      });

      setCreatedUsers(createdUsersList);
      setErrorList(errorList);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          const errorMessage = error.response.data.detail;
          if (Array.isArray(errorMessage)) {
            setSubmitStatus({
              severity: 'error',
              message: `Errors: ${errorMessage.join(', ')}`,
            });
          } else {
            setSubmitStatus({
              severity: 'error',
              message: errorMessage || 'Bad Request: Please check the file format and try again.',
            });
          }
        } else if (error.response.status === 500) {
          setSubmitStatus({
            severity: 'error',
            message: 'Server Error: Please try again later.',
          });
        } else {
          setSubmitStatus({
            severity: 'error',
            message: `Unexpected Error: ${error.response.statusText || 'Please try again.'}`,
          });
        }
      } else {
        setSubmitStatus({
          severity: 'error',
          message: 'Network Error: Please check your connection and try again.',
        });
      }
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
        maxWidth: '1200px',
        margin: '0 auto',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.5rem',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Add Teaching Assistants
        </Typography>
      </Box>

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

        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 2 }}
        >
          Expected CSV Columns: <strong>Name, Email</strong>
        </Typography>

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
          {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Upload'}
        </Button>

        {submitStatus && (
          <Alert 
            severity={submitStatus.severity} 
            sx={{ 
              width: '100%', 
              maxWidth: '600px',
              mt: 2,
              backgroundColor: submitStatus.severity === 'success' ? '#d4edda' : '#f8d7da',
              color: submitStatus.severity === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${submitStatus.severity === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {submitStatus.message.split('\n').map((line, index) => (
              <Typography key={index} variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {line}
              </Typography>
            ))}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            width: '100%',
            maxWidth: '600px',
            mt: 2,
          }}
        >
          <Paper
            sx={{
              flex: 1,
              maxHeight: '200px',
              overflowY: 'auto',
              p: 2,
              border: '1px solid #c3e6cb',
              backgroundColor: '#d4edda',
              color: '#155724',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                mb: 1.5,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Created TAs
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            >
              {createdUsers || 'No TAs created yet.'}
            </Typography>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              maxHeight: '200px',
              overflowY: 'auto',
              p: 2,
              border: '1px solid #f5c6cb',
              backgroundColor: '#f8d7da',
              color: '#721c24',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                mb: 1.5,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Errors
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            >
              {errorList || 'No errors.'}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AddTAs;