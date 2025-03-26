'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import axios from 'axios';
import { currentConfig } from '@/config';

interface TeamFeedback {
  team_id: number;
  team_name: string;
  submission_count: number;
  last_submission: string;
}

interface FeedbackDetail {
  member_name: string;
  contribution: number;
  remarks: string;
}

interface FeedbackSubmission {
  submission_id: number;
  submitter: {
    id: number;
    name: string;
  };
  submitted_at: string;
  feedback: Array<{
    member_name: string;
    contribution: number;
    remarks: string;
  }>;
}

interface TeamFeedbackDetails {
  team_id: number;
  team_name: string;
  members: { [key: string]: string };
  submissions: FeedbackSubmission[];
}

export default function AdminFeedback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamFeedback[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamFeedbackDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${currentConfig.apiBaseUrl}/feedback/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data);
    } catch (error) {
      setError('Failed to fetch teams feedback. Please try again later.');
      console.error('Error fetching teams feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (teamId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${currentConfig.apiBaseUrl}/feedback/admin/view/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTeam(response.data);
      setDialogOpen(true);
    } catch (error) {
      setError('Failed to fetch team details. Please try again later.');
      console.error('Error fetching team details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && teams.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Team Feedback Overview
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Name</TableCell>
              <TableCell align="center">Submissions</TableCell>
              <TableCell>Last Submission</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.team_id}>
                <TableCell>{team.team_name}</TableCell>
                <TableCell align="center">{team.submission_count}</TableCell>
                <TableCell>{new Date(team.last_submission).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewDetails(team.team_id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Team Feedback Details - {selectedTeam?.team_name}
        </DialogTitle>
        <DialogContent>
          {selectedTeam?.submissions.map((submission, index) => (
            <Box key={submission.submission_id} mb={4}>
              <Typography variant="h6" gutterBottom>
                Submission by {submission.submitter.name} - {new Date(submission.submitted_at).toLocaleString()}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Member Name</TableCell>
                      <TableCell align="center">Contribution</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submission.feedback.map((detail, detailIndex) => (
                      <TableRow key={detailIndex}>
                        <TableCell>{detail.member_name}</TableCell>
                        <TableCell align="center">{detail.contribution}%</TableCell>
                        <TableCell>{detail.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {index < selectedTeam.submissions.length - 1 && (
                <Box my={2}>
                  <Divider />
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}