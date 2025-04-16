'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Tooltip,
  Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';

const TATeamPairing = () => {
  const router = useRouter();
  const [isPairing, setIsPairing] = useState(false);
  const [tasPerTeam, setTasPerTeam] = useState(1);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Fetch from the updated /match endpoint which returns extra fields
        const res = await fetch('/match');
        const data = await res.json();
        // Expected structure: { teams: [ { team_id, team_name, skills, tas, combined_ta_skills, skill_match } ] }
        setTeams(data.teams);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
  }, [isPairing]);

  const handlePairing = async () => {
    setIsPairing(true);
    try {
      const response = await fetch(`/api/match/${tasPerTeam}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to allocate TAs');
      }
      alert('TA-team pairing completed successfully!');
      // Refresh to update table data
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      setShowError(true);
    } finally {
      setIsPairing(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setTasPerTeam(value);
      setError('');
    } else {
      setError('Please enter a positive number');
      setShowError(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, color: '#1a73e8', fontWeight: 500 }}>
        TA TEAM PAIRING
      </Typography>

      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, backgroundColor: 'white', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            type="number"
            label="TAs per Team"
            value={tasPerTeam}
            onChange={handleInputChange}
            inputProps={{ min: 1 }}
            sx={{ width: 150 }}
          />
          <Button
            variant="contained"
            onClick={handlePairing}
            disabled={isPairing || !!error}
            sx={{ backgroundColor: '#1a73e8', color: '#fff', '&:hover': { backgroundColor: '#1765c1' }, px: 4, borderRadius: '4px' }}
          >
            {isPairing ? 'Pairing...' : 'Start Pairing'}
          </Button>
        </Box>

        <Box sx={{ width: '100%', mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Name</TableCell>
                <TableCell>Required Skills</TableCell>
                <TableCell>Assigned TAs</TableCell>
                <TableCell>TA Skills</TableCell>
                <TableCell>Skill Match (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map(team => (
                <TableRow key={team.team_id}>
                  <TableCell>{team.team_name}</TableCell>
                  <TableCell>{team.skills.map((s: any) => s.name).join(', ')}</TableCell>
                  <TableCell>
                    {team.tas.map((ta: any) => (
                      <Tooltip key={ta.id} title={ta.skills.join(', ')}>
                        <span style={{ marginRight: '8px' }}>{ta.name}</span>
                      </Tooltip>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {team.combined_ta_skills.map((skill: string, index: number) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{
                            ...chipStyle,
                            backgroundColor: '#3f51b5',
                            color: '#fff',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{team.skill_match}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TATeamPairing;