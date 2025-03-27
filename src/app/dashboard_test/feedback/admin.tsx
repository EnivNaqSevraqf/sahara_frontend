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
  styled
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
}));

const StatCell = styled(MatrixCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 'bold',
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
    } catch (error) {
      setError('Failed to export all matrices. Please try again later.');
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

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Team Feedback Overview
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportAllMatrices}
        >
          Export All Matrices
        </Button>
      </Box>

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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Team Feedback Details - {selectedTeam?.team_name}
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Feedback Correlation Matrix
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => exportToCSV(selectedTeam)}
                  sx={{ ml: 2 }}
                >
                  Export Matrix
                </Button>
              </Box>
              {renderFeedbackMatrix(selectedTeam)}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Detailed Submissions
              </Typography>
              {selectedTeam.submissions.map((submission, index) => (
                <Box key={submission.submission_id} mb={4}>
                  <Typography variant="h6" gutterBottom>
                    Submission by {submission.submitter.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Submitted on: {new Date(submission.submitted_at).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}