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
import { currentConfig } from '@/config'; // Import your config

// Set the base URL for all axios requests
axios.defaults.baseURL = currentConfig.apiBaseUrl;

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
      const response = await axios.post('/teams/upload-csv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("API Response:", response.data); // Debug the response
      
      // Get data from the appropriate location
      const responseData = response.data.detail || response.data;
      
      // Format success message with fallbacks for missing data
      const totalTeams = responseData.total_teams || 0;
      const totalStudents = responseData.total_students_assigned || 0;

      // Change the message based on whether teams were uploaded
      const successMessage = totalTeams === 0
        ? "No teams uploaded"
        : `Teams uploaded successfully!\n\nTotal Teams: ${totalTeams}\nTotal Students Assigned: ${totalStudents}`;

      // Format detailed team assignments with user info
      let teamDetails = '';
      
      // Add detailed user assignments by team
      const teamAssignments = responseData.team_assignments || {};
      if (Object.keys(teamAssignments).length > 0) {
        teamDetails += "User Assignments By Team:\n";
        Object.entries(teamAssignments).forEach(([teamId, users]) => {
          teamDetails += `\nTeam ${teamId}:\n`;
          // Cast users to array of objects with id, name, username
          const userArray = users as { id: number, name: string, username: string }[];
          userArray.forEach(user => {
            teamDetails += `  • ${user.name || user.username} (Roll No: ${user.id})\n`;
          });
        });
      }
      
      // Process errors information
      let errorDetails = '';
      const userErrors = responseData.user_errors || [];

      // Define interface for user error objects with more detailed error information
      interface UserError {
        roll_no: string | number;
        error: string;
      }

      if (userErrors.length > 0) {
        errorDetails = "The following users could not be assigned:\n\n";
        userErrors.forEach((error: UserError) => {
          // Format error message based on whether roll_no is "Unknown" or a row indicator
          if (error.roll_no === "Unknown" || error.roll_no.toString().startsWith("Row")) {
            // For missing roll numbers or row-based errors
            errorDetails += `• ${error.error}\n`;
          } else {
            // For errors with identified roll numbers
            errorDetails += `• Roll No ${error.roll_no}: ${error.error}\n`;
          }
        });
      }
      
      setSubmitStatus({
        severity: 'success',
        message: successMessage,
      });
      
      // Explicitly force a non-empty value for display
      setCreatedUsers(teamDetails || (totalTeams === 0 ? "No teams uploaded" : "Teams processed successfully"));
      setErrorList(errorDetails || "No errors found.");
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      let errorMessage = '';
      let errorDetails = '';
      
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        
        if (error.response.status === 400) {
          // Enhanced error handling for 400 errors
          const errorType = responseData?.error_type;
          const customMessage = responseData?.message;
          
          switch (errorType) {
            case 'file_format':
              errorMessage = 'Invalid File Format';
              errorDetails = customMessage || 'Please upload a CSV file with .csv extension.';
              break;
              
            case 'empty_file':
              errorMessage = 'Empty CSV File';
              errorDetails = customMessage || 'The uploaded CSV file is empty. Please ensure your file contains valid data.';
              break;
              
            case 'csv_parse_error':
              errorMessage = 'CSV Parsing Failed';
              errorDetails = customMessage || 'The CSV file could not be parsed. Please check its format.';
              break;
              
            case 'missing_columns':
              errorMessage = 'Missing Required Columns';
              const missingColumns = responseData?.missing_columns?.join(', ') || 'unknown columns';
              errorDetails = `The CSV file must include the columns: ${missingColumns}`;
              break;
              
            default:
              // Handle legacy or other error formats
              const responseDetail = responseData?.detail;
              
              if (typeof responseDetail === 'string') {
                errorMessage = responseDetail;
                
                if (responseDetail.includes('Missing required column')) {
                  errorDetails = 'The CSV file must include the columns: RollNo, TeamID';
                } else if (responseDetail.includes('User with Roll No')) {
                  const match = responseDetail.match(/Roll No (\d+)/);
                  const rollNo = match ? match[1] : '';
                  errorDetails = `Student with Roll No ${rollNo} does not exist in the system`;
                } else if (responseDetail.includes('Invalid file format')) {
                  errorDetails = 'Please upload a CSV file with .csv extension.';
                } else {
                  // Generic error message
                  errorDetails = customMessage || responseDetail;
                }
              } else if (Array.isArray(responseDetail)) {
                errorMessage = 'CSV format errors:';
                errorDetails = responseDetail.join('\n');
              }
          }
        } else if (error.response.status === 500) {
          errorMessage = 'Server Error: Please try again later.';
          errorDetails = responseData?.message || 'An internal server error occurred.';
        } else {
          errorMessage = `Unexpected Error: ${error.response.statusText || 'Please try again.'}`;
          errorDetails = responseData?.message || 'An unknown error occurred.';
        }
      } else {
        errorMessage = 'Network Error: Please check your connection and try again.';
      }
      
      setSubmitStatus({
        severity: 'error',
        message: errorMessage,
      });
      setErrorList(errorDetails || 'Unknown error occurred.');
      setCreatedUsers('');
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
              The CSV file should be in the format: <strong>RollNo, TeamID</strong>
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
                  mt: 3,
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
                    }}
                  >
                    Team Assignments
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                  >
                    {createdUsers || 'No teams created yet.'}
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

export default TeamsCreationForm2;