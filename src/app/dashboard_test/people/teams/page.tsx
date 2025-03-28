'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      const response = await axios.get('/people/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const tas = response.data.filter((user: any) => user.role === 'TA');
      setAvailableTAs(tas.map((ta: any) => ({ id: ta.id, name: ta.name })));
    } catch (error) {
      console.error('Error fetching TAs:', error);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teams
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Number of TAs per team"
          type="number"
          value={taCount}
          onChange={(e) => setTaCount(e.target.value)}
          sx={{ width: 200 }}
          InputProps={{ inputProps: { min: 1 } }}
        />
        <Button
          variant="contained"
          onClick={handleMatch}
          disabled={matchLoading}
          sx={{ height: 56 }}
        >
          {matchLoading ? <CircularProgress size={24} /> : 'Allocate TAs'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team ID</TableCell>
                <TableCell>Team Name</TableCell>
                <TableCell>Skills</TableCell>
                <TableCell>Alloted TA</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.team_id}>
                  <TableCell>{team.team_id}</TableCell>
                  <TableCell>{team.team_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {team.skills?.map((skill) => (
                        <Chip
                          key={skill.id}
                          label={skill.name}
                          sx={{
                            backgroundColor: skill.bgColor,
                            color: skill.color,
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {team.tas?.map((ta) => (
                        <Chip
                          key={ta.id}
                          label={ta.name}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(team)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit TA Assignments</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assigned TAs</InputLabel>
            <Select
              multiple
              value={selectedTAs}
              onChange={handleTAChange}
              input={<OutlinedInput label="Assigned TAs" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={availableTAs.find(ta => ta.id === value)?.name}
                    />
                  ))}
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
          <Button onClick={handleSaveEdit} variant="contained">
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
