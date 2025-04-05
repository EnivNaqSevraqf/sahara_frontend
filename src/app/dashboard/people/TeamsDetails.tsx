'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { currentConfig } from '@/config';

interface Team {
  number: number;
  name: string;
  members: string[];
}

const TeamsDetails = () => {
  const [formedTeams, setFormedTeams] = useState<Team[]>([]);
  const [betaTestPairs, setBetaTestPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTeamsAndPairs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${currentConfig.apiBaseUrl}/teams/FormedTeams/`);
        setFormedTeams(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to fetch teams data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsAndPairs();
  }, []);

  const downloadExcel = (data: any[], fileName: string) => {
    const formattedData = data.map(item => ({
      ...item,
      members: item.members ? item.members.join(', ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const toggleTeamExpansion = (teamNumber: number) => {
    setExpandedTeams(prev => 
      prev.includes(teamNumber) 
        ? prev.filter(num => num !== teamNumber)
        : [...prev, teamNumber]
    );
  };

  const filteredTeams = formedTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.members.some(member => member.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <GroupsIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                Teams Overview
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                View and manage all teams and beta-test pairs
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Status Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          backgroundColor: '#fbfdff',
          border: '1px solid #e3f2fd'
        }}
      >
        <Typography variant="h6" sx={{ color: '#033076', mb: 2, fontWeight: 500 }}>
          Team Formation Status
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#1976d2', mb: 1 }}>
              Teams Formed: {formedTeams.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due Date: 05-02-2025
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard/people/teams/create')}
            sx={{
              backgroundColor: '#033076',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#02225a',
              },
              px: 3,
            }}
          >
            Create New Team
          </Button>
        </Box>
      </Paper>

      {/* Teams Section */}
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Formed Teams Table */}
        <Paper
          elevation={0}
          sx={{
            flex: '1 1 45%',
            minWidth: '300px',
            p: 3,
            borderRadius: 2,
            backgroundColor: '#fbfdff',
            border: '1px solid #e3f2fd'
          }}
        >
          <Typography variant="h6" sx={{ color: '#033076', mb: 3, fontWeight: 500 }}>
            Formed Teams
          </Typography>

          <TextField
            placeholder="Search teams or members..."
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%', backgroundColor: '#f8faff', fontWeight: 'bold' }}>Team Number</TableCell>
                  <TableCell sx={{ width: '25%', backgroundColor: '#f8faff', fontWeight: 'bold' }}>Team Name</TableCell>
                  <TableCell sx={{ backgroundColor: '#f8faff', fontWeight: 'bold' }}>Members</TableCell>
                  <TableCell sx={{ width: '10%', backgroundColor: '#f8faff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeams.map((team) => (
                  <React.Fragment key={team.number}>
                    <TableRow
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f5f9ff !important',
                        },
                      }}
                    >
                      <TableCell>{team.number}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            icon={<PersonIcon />}
                            label={`${team.members.length} Members`}
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '& .MuiChip-icon': {
                                color: '#1976d2'
                              }
                            }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {team.members.slice(0, 2).map((member, index) => (
                              <Tooltip key={index} title={member} arrow>
                                <Avatar
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    fontSize: '0.875rem',
                                    bgcolor: `hsl(${(index * 70) % 360}, 70%, 50%)`
                                  }}
                                >
                                  {member.split(' ').map(part => part[0]).join('')}
                                </Avatar>
                              </Tooltip>
                            ))}
                            {team.members.length > 2 && (
                              <Tooltip title={team.members.slice(2).join(', ')} arrow>
                                <Avatar
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    fontSize: '0.875rem',
                                    bgcolor: '#9e9e9e'
                                  }}
                                >
                                  +{team.members.length - 2}
                                </Avatar>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleTeamExpansion(team.number)}
                          sx={{ color: '#1976d2' }}
                        >
                          {expandedTeams.includes(team.number) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                        <Collapse in={expandedTeams.includes(team.number)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <List dense>
                              {team.members.map((member, index) => (
                                <ListItem 
                                  key={index}
                                  sx={{
                                    py: 0.5,
                                    borderRadius: 1,
                                    '&:hover': { backgroundColor: '#f5f9ff' }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      mr: 2,
                                      fontSize: '0.875rem',
                                      bgcolor: `hsl(${(index * 70) % 360}, 70%, 50%)`
                                    }}
                                  >
                                    {member.split(' ').map(part => part[0]).join('')}
                                  </Avatar>
                                  <ListItemText 
                                    primary={member}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      sx: { fontWeight: 500 }
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                {filteredTeams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No teams found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => downloadExcel(formedTeams, 'FormedTeams')}
            sx={{
              mt: 2,
              color: '#033076',
              borderColor: '#033076',
              '&:hover': {
                backgroundColor: 'rgba(3, 48, 118, 0.08)',
              },
            }}
          >
            Export to Excel
          </Button>
        </Paper>

        {/* Beta Test Pairs Section */}
        <Paper
          elevation={0}
          sx={{
            flex: '1 1 45%',
            minWidth: '300px',
            p: 3,
            borderRadius: 2,
            backgroundColor: '#fbfdff',
            border: '1px solid #e3f2fd'
          }}
        >
          <Typography variant="h6" sx={{ color: '#033076', mb: 3, fontWeight: 500 }}>
            Beta-Test Pairs
          </Typography>

          {betaTestPairs.length > 0 ? (
            <>
              <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#f8faff', fontWeight: 'bold' }}>Pair Number</TableCell>
                      <TableCell sx={{ backgroundColor: '#f8faff', fontWeight: 'bold' }}>Team Names</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {betaTestPairs.map((pair) => (
                      <TableRow
                        key={pair.pairNumber}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f5f9ff !important',
                          },
                        }}
                      >
                        <TableCell>{pair.pairNumber}</TableCell>
                        <TableCell>{pair.teamNames}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => downloadExcel(betaTestPairs, 'BetaTestPairs')}
                sx={{
                  mt: 2,
                  color: '#033076',
                  borderColor: '#033076',
                  '&:hover': {
                    backgroundColor: 'rgba(3, 48, 118, 0.08)',
                  },
                }}
              >
                Export to Excel
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: '#9e9e9e', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No beta-test pairs have been created yet
              </Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#033076',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#02225a',
                  },
                }}
              >
                Create Beta-Test Pairs
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default TeamsDetails;