'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const TATeamPairing = () => {
  const router = useRouter();
  const [isPairing, setIsPairing] = useState(false);
  const [tasPerTeam, setTasPerTeam] = useState(1);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handlePairing = async () => {
    setIsPairing(true);
    try {
      const response = await fetch(`/api/match/${tasPerTeam}`);
      const data = await response.json();

      if (!response.ok) {
        // Use the detailed error message provided by the backend
        throw new Error(data.detail || 'Failed to allocate TAs');
      }

      alert('TA-team pairing completed successfully!');
      router.refresh();
    } catch (error: any) {
      // Display the error message from the backend
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
      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          color: '#1a73e8',
          fontWeight: 500,
        }}
      >
        TA TEAM PAIRING
      </Typography>

      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
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
            sx={{
              backgroundColor: '#1a73e8',
              color: '#fff',
              '&:hover': { backgroundColor: '#1765c1' },
              px: 4,
              borderRadius: '4px',
            }}
          >
            {isPairing ? 'Pairing...' : 'Start Pairing'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TATeamPairing;