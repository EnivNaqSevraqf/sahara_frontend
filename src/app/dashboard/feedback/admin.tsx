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
  Divider,
  Tooltip,
  styled,
  Snackbar
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { currentConfig } from '@/config';

const MatrixCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  border: `1px solid ${theme.palette.divider}`,
  minWidth: '60px',  // Reduced from 80px
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StatCell = styled(MatrixCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  fontWeight: 'bold',
  color: theme.palette.text.primary,
}));

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

interface FeedbackMatrix {
  submitterName: string;
  submissionDate: string;
  feedback: {
    [memberName: string]: {
      contribution: number;
      remarks: string;
    };
  };
}

interface Statistics {
  mean: number;
  variance: number;
}

const calculateStatistics = (submissions: FeedbackSubmission[], memberName: string): Statistics => {
  const contributions = submissions
    .map(sub => sub.feedback.find(f => f.member_name === memberName)?.contribution || 0)
    .filter(contribution => contribution > 0);

  if (contributions.length === 0) {
    return { mean: 0, variance: 0 };
  }

  const mean = contributions.reduce((sum, val) => sum + val, 0) / contributions.length;
  
  // Calculate variance: mean of squared differences from the mean
  const variance = contributions.reduce((sum, val) => {
    const diff = val - mean;
    return sum + (diff * diff);
  }, 0) / contributions.length;

  return { mean, variance };
};

export default function AdminFeedback() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<TeamFeedback[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamFeedbackDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'error'
  });

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
      setSnackbar({
        open: true,
        message: 'Failed to fetch teams feedback. Please try again later.',
        severity: 'error'
      });
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
      setSnackbar({
        open: true,
        message: 'Failed to fetch team details. Please try again later.',
        severity: 'error'
      });
      console.error('Error fetching team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformToMatrix = (submissions: FeedbackSubmission[], members: { [key: string]: string }): FeedbackMatrix[] => {
    return submissions.map(submission => {
      const feedbackMap: { [key: string]: { contribution: number; remarks: string } } = {};
      submission.feedback.forEach(detail => {
        feedbackMap[detail.member_name] = {
          contribution: detail.contribution,
          remarks: detail.remarks
        };
      });
      
      return {
        submitterName: submission.submitter.name,
        submissionDate: submission.submitted_at,
        feedback: feedbackMap
      };
    });
  };

  const exportToCSV = (team: TeamFeedbackDetails) => {
    const matrix = transformToMatrix(team.submissions, team.members);
    const memberNames = Object.values(team.members);
    
    // Format data for CSV
    const csvData = matrix.map(row => {
      const rowData: any = {
        Submitter: row.submitterName,
        'Submission Date': new Date(row.submissionDate).toLocaleDateString()
      };
      
      // Add contributions for each team member
      memberNames.forEach(memberName => {
        rowData[memberName] = row.feedback[memberName]?.contribution || '-';
      });
      
      return rowData;
    });

    // Add statistics rows
    const statsRows = memberNames.reduce((acc: any, memberName) => {
      const stats = calculateStatistics(team.submissions, memberName);
      acc['mean'][memberName] = stats.mean.toFixed(1);
      acc['variance'][memberName] = stats.variance.toFixed(1);
      return acc;
    }, {
      mean: { Submitter: 'Mean', 'Submission Date': '' },
      variance: { Submitter: 'Variance', 'Submission Date': '' }
    });

    csvData.push(statsRows.mean, statsRows.variance);

    // Create and download Excel file
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback Matrix');
    XLSX.writeFile(workbook, `${team.team_name}_feedback_matrix.xlsx`);
  };

  interface ExcelRowData {
    [key: string]: string | number;
    Submitter: string;
    'Submission Date': string;
  }
  
  interface StatsRows {
    mean: ExcelRowData;
    variance: ExcelRowData;
  }
  
  const exportAllMatrices = async () => {
    try {
      setLoading(true);
      const workbook = XLSX.utils.book_new();
      
      // Fetch details for each team and create sheets
      await Promise.all(teams.map(async (team) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${currentConfig.apiBaseUrl}/feedback/admin/view/${team.team_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const matrix = transformToMatrix(response.data.submissions, response.data.members);
        const memberNames = Object.values(response.data.members) as string[];
        
        // Format data for Excel sheet
        const sheetData: ExcelRowData[] = matrix.map(row => {
          const rowData: ExcelRowData = {
            Submitter: row.submitterName,
            'Submission Date': new Date(row.submissionDate).toLocaleDateString()
          };
          
          // Add contributions for each team member
          memberNames.forEach(memberName => {
            rowData[memberName] = row.feedback[memberName]?.contribution || '-';
          });
          
          return rowData;
        });

        // Add statistics rows
        const statsRows = memberNames.reduce<StatsRows>((acc, memberName) => {
          const stats = calculateStatistics(response.data.submissions, memberName);
          if (!acc.mean[memberName]) acc.mean[memberName] = 0;
          if (!acc.variance[memberName]) acc.variance[memberName] = 0;
          acc.mean[memberName] = stats.mean.toFixed(1);
          acc.variance[memberName] = stats.variance.toFixed(1);
          return acc;
        }, {
          mean: { Submitter: 'Mean', 'Submission Date': '' },
          variance: { Submitter: 'Variance', 'Submission Date': '' }
        });

        sheetData.push(statsRows.mean, statsRows.variance);

        // Create and append sheet for this team
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, team.team_name.slice(0, 30)); // Limit sheet name length
      }));

      // Save the workbook
      XLSX.writeFile(workbook, `all_teams_feedback_matrices.xlsx`);
      setSnackbar({
        open: true,
        message: 'All matrices exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export all matrices. Please try again later.',
        severity: 'error'
      });
      console.error('Error exporting all matrices:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFeedbackMatrix = (team: TeamFeedbackDetails) => {
    const matrix = transformToMatrix(team.submissions, team.members);
    const memberNames = Object.values(team.members);

    return (
      <TableContainer component={Paper} sx={{ mt: 2, mb: 3, maxWidth: 'fit-content', mx: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <MatrixCell sx={{ minWidth: '120px' }}>Submitter</MatrixCell>
              {memberNames.map((name) => (
                <MatrixCell key={name}>{name}</MatrixCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {matrix.map((row, index) => (
              <TableRow key={index}>
                <MatrixCell>
                  {row.submitterName}
                  <Typography variant="caption" display="block">
                    {new Date(row.submissionDate).toLocaleDateString()}
                  </Typography>
                </MatrixCell>
                {memberNames.map((memberName) => {
                  const feedback = row.feedback[memberName];
                  return (
                    <MatrixCell key={memberName}>
                      {feedback ? (
                        <Tooltip 
                          title={feedback.remarks || 'No remarks provided'} 
                          arrow
                        >
                          <Box>{feedback.contribution}%</Box>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </MatrixCell>
                  );
                })}
              </TableRow>
            ))}
            <TableRow>
              <StatCell>Mean</StatCell>
              {memberNames.map(memberName => {
                const stats = calculateStatistics(team.submissions, memberName);
                return (
                  <StatCell key={`mean-${memberName}`}>
                    {stats.mean.toFixed(1)}%
                  </StatCell>
                );
              })}
            </TableRow>
            <TableRow>
              <StatCell>Variance</StatCell>
              {memberNames.map(memberName => {
                const stats = calculateStatistics(team.submissions, memberName);
                return (
                  <StatCell key={`var-${memberName}`}>
                    {stats.variance.toFixed(1)}%
                  </StatCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading && teams.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: 'background.default' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 500 }}>
          Team Feedback Overview
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportAllMatrices}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'action.hover',
            }
          }}
        >
          Export All Matrices
        </Button>
      </Box>

      <Paper elevation={2} sx={{ mb: 4, bgcolor: 'background.paper' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Team Name</TableCell>
                <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 600 }}>Submissions</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>Last Submission</TableCell>
                <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow 
                  key={team.team_id} 
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <TableCell sx={{ color: 'text.primary' }}>{team.team_name}</TableCell>
                  <TableCell align="center" sx={{ color: 'text.primary' }}>{team.submission_count}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{new Date(team.last_submission).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewDetails(team.team_id)}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          color: 'text.primary',
          bgcolor: 'background.paper',
          fontWeight: 600
        }}>
          Team Feedback Details - {selectedTeam?.team_name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', pt: 3 }}>
          {selectedTeam && (
            <>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                mt: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Feedback Matrix
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => exportToCSV(selectedTeam)}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  Export Matrix
                </Button>
              </Box>
              {renderFeedbackMatrix(selectedTeam)}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4, color: 'text.primary', fontWeight: 500 }}>
                Detailed Submissions
              </Typography>
              {selectedTeam.submissions.map((submission) => (
                <Paper 
                  key={submission.submission_id} 
                  elevation={1}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Submission by {submission.submitter.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Submitted on: {new Date(submission.submitted_at).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: 1, 
          borderColor: 'divider', 
          p: 2,
          bgcolor: 'background.paper'
        }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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