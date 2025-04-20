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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
      const response = await axios.post(`${currentConfig.apiBaseUrl}/upload-students/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const { message, created_students, errors } = response.data;

      // Format created users list with additional details
      let createdUsersList = '';
      if (created_students && created_students.length > 0) {
        createdUsersList = "Successfully created students:\n\n";
        created_students.forEach(
          (student: { name: string; email: string; username: string; temp_password: string }) => {
            createdUsersList += `• ${student.name}\n`;
          }
        );
      }

      // Format error list with more detail
      let errorListText = '';
      if (errors && errors.length > 0) {
        errorListText = "The following errors occurred:\n\n";
        errors.forEach((error: any) => {
          if (typeof error === 'string') {
            errorListText += `• ${error}\n`;
          } else if (error.row) {
            // If error has row information
            errorListText += `• Row ${error.row}: ${error.error}\n`;
            // if (error.rollno) errorListText += `  Roll No: ${error.rollno}\n`;
          } else if (error.rollno) {
            errorListText += `• Row ${error.rollno}: ${error.error}\n`;
          }else {
            errorListText += `• ${error.error || JSON.stringify(error)}\n`;
          }
        });
      }

      setSubmitStatus({
        severity: 'success',
        message: message,
      });

      setCreatedUsers(createdUsersList);
      setErrorList(errorListText);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        
        if (error.response.status === 400) {
          // Enhanced error handling for 400 errors
          const errorType = responseData?.error_type;
          const customMessage = responseData?.message || responseData?.detail;
          
          let errorMessage;
          
          switch (errorType) {
            case 'file_format':
              errorMessage = 'Invalid File Format: Please upload a CSV file with .csv extension.';
              break;
              
            case 'empty_file':
              errorMessage = 'Empty CSV File: The uploaded file is empty. Please upload a file with valid data.';
              break;
              
            case 'csv_parse_error':
              errorMessage = `CSV Parsing Failed: ${customMessage || 'The CSV file could not be parsed correctly.'}`;
              break;
              
            case 'missing_columns':
              const missingColumns = responseData?.missing_columns?.join(', ') || 'required columns';
              errorMessage = `Missing Required Columns: The CSV file must include the columns: ${missingColumns}`;
              break;
              
            default:
              errorMessage = customMessage || 'Bad Request: Please check the file format and try again.';
          }
          
          setSubmitStatus({
            severity: 'error',
            message: errorMessage,
          });
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
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(45deg, #000060 30%, #1765c1 90%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 96, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <PersonAddIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                Add Students
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Upload a CSV file to create multiple student accounts at once
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
            <Typography variant="h6" sx={{ mb: 2, color: '#000060', fontWeight: 500 }}>
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
                  backgroundColor: '#000060',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#1765c1',
                  },
                  borderRadius: '4px',
                }}
              >
                Browse
              </Button>
            </Paper>

            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Expected CSV Columns: <strong>RollNo, Name, Email</strong>
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
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <UploadFileIcon />}
              sx={{
                backgroundColor: '#000060',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1765c1',
                },
                px: 4,
                py: 1,
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {isSubmitting ? 'Uploading...' : 'Upload and Create Students'}
            </Button>
          </Box>

          {/* Results Section */}
          {submitStatus && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 4 }} />
              <Typography variant="h6" sx={{ mb: 3, color: '#000060', fontWeight: 500 }}>
                Upload Results
              </Typography>

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

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  width: '100%',
                  mt: 3,
                }}
              >
                <Paper
                  sx={{
                    flex: 1,
                    maxHeight: '400px',
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
                    Created Users
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                  >
                    {createdUsers || 'No users created yet.'}
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    flex: 1,
                    maxHeight: '400px',
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
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AddStudents;