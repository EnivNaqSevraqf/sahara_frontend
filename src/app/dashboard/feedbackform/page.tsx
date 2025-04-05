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
  Alert,
  CircularProgress,
} from '@mui/material';
import { currentConfig } from '@/config';

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalContribution, setTotalContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setError(null);
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
        setError(err.response?.data?.detail || 'Failed to load team data');
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  const handleContributionChange = (memberId: number, value: string) => {
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
      setError('No team ID found');
      return;
    }

    if (totalContribution !== 100) {
      setError('Total contribution must equal 100%');
      return;
    }

    try {
      setError(null);
      await api.post('/feedback/student/submit', {
        team_id: teamId,
        details: teamMembers.map(member => ({
          member_id: member.id,
          contribution: member.contribution,
          remarks: member.remarks
        }))
      });

      setSuccess(true);
      setError(null);
      setIsSubmitted(true);
      setSubmittedAt(new Date().toISOString());
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to submit feedback');
      } else {
        setError('An unexpected error occurred while submitting feedback');
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Team Contribution Feedback - {teamName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Feedback submitted successfully!
        </Alert>
      )}

      {isSubmitted && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This feedback was submitted on {new Date(submittedAt!).toLocaleString()}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Member</TableCell>
                <TableCell align="right">Contribution Percentage (%)</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow 
                  key={member.id}
                  sx={member.is_current_user ? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {}}
                >
                  <TableCell>
                    {member.name} {member.is_current_user ? '(You)' : ''}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={member.contribution}
                      onChange={(e) => handleContributionChange(member.id, e.target.value)}
                      InputProps={{
                        inputProps: { min: 0, max: 100 }
                      }}
                      size="small"
                      sx={{ width: 100 }}
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
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {totalContribution}%
                  {!isSubmitted && totalContribution !== 100 && (
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
      </Paper>

      {!isSubmitted && (
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={totalContribution !== 100}
            sx={{ minWidth: 200 }}
          >
            Submit Feedback
          </Button>
        </Box>
      )}
    </Box>
  );
}