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

interface TeamMember {
  id: number;
  name: string;
  contribution: number;
  remarks: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000',  // Add the backend server URL
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
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.data?.detail) {
      return Promise.reject(new Error(error.response.data.detail));
    }
    return Promise.reject(error);
  }
);

export default function FeedbackForm() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalContribution, setTotalContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      // Get user's team info
      const { data: teamData } = await api.get('/feedback/user/team');

      // Get team members
      const { data: membersData } = await api.get(`/feedback/team/${teamData.team_id}/members`);

      setTeamName(teamData.team_name);
      setTeamMembers(membersData.members.map((member: any) => ({
        id: member.id,
        name: member.name,
        contribution: 0,
        remarks: ''
      })));
      setLoading(false);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.detail || err.message : 'Failed to load team data');
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
    // Validate total contribution equals 100%
    if (totalContribution !== 100) {
      setError('Total contribution must equal 100%');
      return;
    }

    try {
      const { data: teamData } = await api.get('/feedback/user/team');

      await api.post('/feedback/submit', {
        team_id: teamData.team_id,
        details: teamMembers.map(member => ({
          member_id: member.id,
          contribution: member.contribution,
          remarks: member.remarks
        }))
      });

      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.detail || err.message : 'Failed to submit feedback');
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

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Member</TableCell>
                <TableCell align="right">Contribution Percentage (%)</TableCell>
                <TableCell>Remarks (Optional)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
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
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={member.remarks}
                      onChange={(e) => handleRemarksChange(member.id, e.target.value)}
                      placeholder="Add optional remarks"
                      size="small"
                      fullWidth
                      multiline
                      maxRows={2}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {totalContribution}%
                  {totalContribution !== 100 && (
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
    </Box>
  );
}