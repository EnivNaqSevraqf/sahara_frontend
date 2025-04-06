'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  TableSortLabel,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Toolbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import axios from 'axios';
import { currentConfig } from '@/config';

// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl; // Ensure this is set to your API URL

interface Skill {
  id: number;
  name: string;
  bgColor: string;
  color: string;
  icon: string;
}

interface TA {
  id: number;
  name: string;
}

interface Team {
  team_id: number;
  team_name: string;
  skills: Skill[];
  tas: TA[];
}

type Order = 'asc' | 'desc';
type OrderBy = 'team_id' | 'team_name';

const TeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [taCount, setTaCount] = useState('');
  const [matchLoading, setMatchLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [availableTAs, setAvailableTAs] = useState<TA[]>([]);
  const [selectedTAs, setSelectedTAs] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Sorting states
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('team_id');

  useEffect(() => {
    fetchTeamsData();
    fetchAvailableTAs();
  }, []);

  const fetchTeamsData = async () => {
    try {
      const response = await axios.get('/match', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch teams data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTAs = async () => {
    try {
      console.log("Fetching all available TAs...");
      
      // Fetch all people from the endpoint
      const response = await axios.get('/people/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log("All people data:", response.data);
      
      // Filter to get only TAs
      const tas = response.data.filter((user: any) => user.role === 'TA');
      console.log("Filtered TAs:", tas);
      
      // Set the available TAs state
      setAvailableTAs(tas.map((ta: any) => ({ id: ta.id, name: ta.name })));
      
      // Also fetch teams to ensure we have all TAs that might be assigned to teams
      // This ensures we have TAs that might not be correctly marked in the /people endpoint
      const teamsResponse = await axios.get('/match', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Extract all TAs from all teams
      const teamTAs: TA[] = [];
      teamsResponse.data.teams.forEach((team: Team) => {
        team.tas.forEach(ta => {
          if (!teamTAs.some(existingTA => existingTA.id === ta.id)) {
            teamTAs.push(ta);
          }
        });
      });
      
      console.log("TAs from teams:", teamTAs);
      
      // Merge the two TA lists (from /people and from /match)
      const mergedTAs = [...tas.map((ta: any) => ({ id: ta.id, name: ta.name }))];
      
      // Add any TAs from teams that aren't in the /people response
      teamTAs.forEach(ta => {
        if (!mergedTAs.some(existingTA => existingTA.id === ta.id)) {
          mergedTAs.push(ta);
        }
      });
      
      console.log("Final merged TA list:", mergedTAs);
      setAvailableTAs(mergedTAs);
    } catch (error) {
      console.error('Error fetching TAs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch TA data',
        severity: 'error',
      });
    }
  };

  const handleMatch = async () => {
    if (!taCount || isNaN(Number(taCount)) || Number(taCount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid number of TAs',
        severity: 'error',
      });
      return;
    }

    setMatchLoading(true);
    try {
      await axios.get(`/match/${taCount}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await fetchTeamsData();
      setSnackbar({
        open: true,
        message: 'TA allocation completed successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error matching TAs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to allocate TAs',
        severity: 'error',
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const handleEditClick = (team: Team) => {
    console.log("Editing team:", team);
    console.log("Team's TAs:", team.tas);
    console.log("Available TAs in dropdown:", availableTAs);
    
    // Check for TA data mismatches
    const missingTAs = team.tas.filter(teamTA => 
      !availableTAs.some(availableTA => availableTA.id === teamTA.id)
    );
    
    if (missingTAs.length > 0) {
      console.log("TAs in team not found in availableTAs:", missingTAs);
      
      // Add missing TAs to availableTAs
      const updatedAvailableTAs = [...availableTAs];
      missingTAs.forEach(ta => {
        if (!updatedAvailableTAs.some(existingTA => existingTA.id === ta.id)) {
          updatedAvailableTAs.push(ta);
        }
      });
      
      setAvailableTAs(updatedAvailableTAs);
    }
    
    setEditingTeam(team);
    setSelectedTAs(team.tas.map(ta => ta.id));
    setOpenEditDialog(true);
  };

  const handleTAChange = (event: SelectChangeEvent<number[]>) => {
    setSelectedTAs(event.target.value as number[]);
  };

  const handleSaveEdit = async () => {
    if (!editingTeam) return;

    try {
      await axios.post(
        `/teams/${editingTeam.team_id}/update-tas`,
        { ta_ids: selectedTAs },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchTeamsData();
      setSnackbar({
        open: true,
        message: 'TA assignments updated successfully',
        severity: 'success',
      });
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating TA assignments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update TA assignments',
        severity: 'error',
      });
    }
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }, [teams, order, orderBy]);

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: '100%' }}>
      {/* Header section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          Teams Management
        </Typography>
      </Box>

      {/* TA Allocation Card - Updated with gradient style */}
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
                TA Allocation
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Assign teaching assistants to student teams
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="TAs per team"
              type="number"
              value={taCount}
              onChange={(e) => setTaCount(e.target.value)}
              InputProps={{ 
                inputProps: { min: 1 },
                sx: { 
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  }
                }
              }}
              InputLabelProps={{
                sx: { 
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: '#3f51b5'
                  }
                }
              }}
              sx={{ width: 150 }}
              size="medium"
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={handleMatch}
              disabled={matchLoading}
              startIcon={matchLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              sx={{ 
                height: 56, 
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: '#3f51b5',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                },
                borderRadius: 1,
                textTransform: 'none',
                px: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {matchLoading ? 'Allocating...' : 'Allocate TAs'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Teams Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <TableContainer>
            <Toolbar sx={{ backgroundColor: '#f8faff' }}>
              <Typography variant="h6" component="div">
                Team List
              </Typography>
            </Toolbar>
            <Table>
              <TableHead>
                <TableRow sx={{
                  backgroundColor: '#f8faff',
                  '& th': {
                    fontWeight: 'bold',
                    borderBottom: 'none',
                  }
                }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'team_id'}
                      direction={orderBy === 'team_id' ? order : 'asc'}
                      onClick={() => handleRequestSort('team_id')}
                    >
                      Team ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'team_name'}
                      direction={orderBy === 'team_name' ? order : 'asc'}
                      onClick={() => handleRequestSort('team_name')}
                    >
                      Team Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assigned TAs</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTeams.length > 0 ? (
                  sortedTeams.map((team) => (
                    <TableRow
                      key={team.team_id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '& td': {
                          borderBottom: '1px solid #f0f0f0',
                          padding: '16px',
                          transition: 'background-color 0.2s ease',
                        },
                        '&:hover': {
                          backgroundColor: '#e8f0fe !important',
                        },
                      }}
                    >
                      <TableCell>{team.team_id}</TableCell>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {team.skills?.map((skill) => (
                            <Chip
                              key={skill.id}
                              label={skill.name}
                              size="small"
                              sx={{
                                backgroundColor: skill.bgColor,
                                color: skill.color,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {team.tas?.map((ta) => (
                            <Chip
                              key={ta.id}
                              label={ta.name}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: '#3f51b5',
                                color: '#3f51b5',
                                fontSize: '0.75rem',
                              }}
                            />
                          ))}
                          {!team.tas?.length && (
                            <Typography variant="body2" color="text.secondary">
                              No TAs assigned
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit TA Assignments">
                          <IconButton 
                            onClick={() => handleEditClick(team)}
                            sx={{
                              color: '#3f51b5',
                              '&:hover': {
                                backgroundColor: 'rgba(63, 81, 181, 0.08)',
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, borderBottom: 'none' }}>
                      <Typography variant="body1" color="text.secondary">
                        No teams found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit TA Assignments</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assigned TAs</InputLabel>
            <Select
              multiple
              value={selectedTAs}
              onChange={handleTAChange}
              input={<OutlinedInput label="Assigned TAs" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const ta = availableTAs.find(ta => ta.id === value);
                    return (
                      <Chip
                        key={value}
                        label={ta?.name || `TA ID: ${value}`} // Fallback for missing TAs
                        sx={{
                          backgroundColor: ta ? '#e8f0fe' : '#ffebee',
                          color: ta ? '#3f51b5' : '#d32f2f',
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {availableTAs.map((ta) => (
                <MenuItem key={ta.id} value={ta.id}>
                  {ta.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            sx={{ 
              backgroundColor: '#3f51b5',
              '&:hover': {
                backgroundColor: '#303f9f',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamsPage;

