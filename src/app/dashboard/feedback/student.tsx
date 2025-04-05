'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { currentConfig } from '@/config';
// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;
interface TeamMember {
  id: number;
  name: string;
  contribution: number;
  remarks: string;
  is_current_user: boolean;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: currentConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function FeedbackForm() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [success, setSuccess] = useState(false);
  const [totalContribution, setTotalContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const { data } = await api.get('/feedback/students');
      
      setTeamId(data.team_id);
      setTeamName(data.team_name);

      // If there's submitted feedback, populate the form with it
      if (data.submitted_feedback) {
        setIsSubmitted(true);
        setSubmittedAt(data.submitted_feedback.submitted_at);
        
        // Map the feedback data to team members
        const submittedDetails = data.submitted_feedback.details;
        const membersWithFeedback = data.members.map((member: any) => ({
          id: member.id,
          name: member.name,
          is_current_user: member.is_current_user,
          contribution: submittedDetails.find((d: any) => d.member_id === member.id)?.contribution || 0,
          remarks: submittedDetails.find((d: any) => d.member_id === member.id)?.remarks || ''
        }));
        
        setTeamMembers(membersWithFeedback);
        setTotalContribution(100); // Since it was already validated when submitted
      } else {
        // Initialize new feedback form
        setTeamMembers(data.members.map((member: any) => ({
          id: member.id,
          name: member.name,
          is_current_user: member.is_current_user,
          contribution: 0,
          remarks: ''
        })));
      }
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSnackbar({
          open: true,
          message: err.response?.data?.detail || 'Failed to load team data',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'An unexpected error occurred',
          severity: 'error'
        });
      }
      setLoading(false);
    }
  };

  const handleContributionChange = (memberId: number, value: string) => {
    // Check if the input has more than 2 decimal places
    if (value.includes('.') && value.split('.')[1].length > 2) {
      return;
    }
    
    const numValue = value === '' ? 0 : Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

    const updatedMembers = teamMembers.map(member => 
      member.id === memberId ? { ...member, contribution: numValue } : member
    );
    setTeamMembers(updatedMembers);

    // Update total contribution
    const newTotal = updatedMembers.reduce((sum, member) => sum + member.contribution, 0);
    setTotalContribution(newTotal);
  };

  const handleRemarksChange = (memberId: number, remarks: string) => {
    setTeamMembers(prevMembers => 
      prevMembers.map(member =>
        member.id === memberId ? { ...member, remarks } : member
      )
    );
  };

  const handleSubmit = async () => {
    if (!teamId) {
      setSnackbar({
        open: true,
        message: 'No team ID found',
        severity: 'error'
      });
      return;
    }

    // Compare with 2 decimal places precision
    if (Math.abs(totalContribution - 100) > 0.01) {
      setSnackbar({
        open: true,
        message: 'Total contribution must equal 100%',
        severity: 'error'
      });
      return;
    }

    try {
      await api.post('/feedback/student/submit', {
        team_id: teamId,
        details: teamMembers.map(member => ({
          member_id: member.id,
          contribution: member.contribution,
          remarks: member.remarks
        }))
      });

      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'Feedback submitted successfully!',
        severity: 'success'
      });
      setIsSubmitted(true);
      setSubmittedAt(new Date().toISOString());
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSnackbar({
          open: true,
          message: err.response?.data?.detail || 'Failed to submit feedback',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'An unexpected error occurred while submitting feedback',
          severity: 'error'
        });
      }
      setSuccess(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default' }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'text.primary', fontWeight: 500 }}>
          Team Contribution Feedback - {teamName}
        </Typography>

        {isSubmitted && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This feedback was submitted on {new Date(submittedAt!).toLocaleString()}
          </Alert>
        )}

        <TableContainer sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Team Member</TableCell>
                <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>Contribution Percentage (%)</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow 
                  key={member.id}
                  sx={{
                    bgcolor: member.is_current_user ? 
                      (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.04)' 
                      : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <TableCell sx={{ color: 'text.primary' }}>
                    {member.name} {member.is_current_user ? '(You)' : ''}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={member.contribution}
                      onChange={(e) => handleContributionChange(member.id, e.target.value)}
                      InputProps={{
                        inputProps: { 
                          min: 0, 
                          max: 100,
                          step: 0.01
                        },
                        sx: {
                          color: 'text.primary',
                          bgcolor: 'background.paper',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                      size="small"
                      sx={{ 
                        width: 100,
                        '& input': {
                          color: 'text.primary'
                        }
                      }}
                      disabled={isSubmitted}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={member.remarks}
                      onChange={(e) => handleRemarksChange(member.id, e.target.value)}
                      placeholder="Add remarks"
                      size="small"
                      fullWidth
                      multiline
                      maxRows={2}
                      disabled={isSubmitted}
                      InputProps={{
                        sx: {
                          color: 'text.primary',
                          bgcolor: 'background.paper',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Total</TableCell>
                <TableCell align="right" sx={{ pr: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {totalContribution.toFixed(2)}%
                  </Typography>
                  {!isSubmitted && Math.abs(totalContribution - 100) > 0.01 && (
                    <Typography color="error" variant="caption" display="block">
                      Total must equal 100%
                    </Typography>
                  )}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {!isSubmitted && (
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={Math.abs(totalContribution - 100) > 0.01}
              sx={{ 
                minWidth: 200,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.disabled'
                }
              }}
            >
              Submit Feedback
            </Button>
          </Box>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}