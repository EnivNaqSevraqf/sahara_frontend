'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';

const TATeamPairing = () => {
  const router = useRouter();
  const [isPairing, setIsPairing] = useState(false);

  const handlePairing = () => {
    setIsPairing(true);
    // Simulate pairing process
    setTimeout(() => {
      setIsPairing(false);
      alert('TA-team pairing completed successfully!');
    }, 2000);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          TA TEAM PAIRING
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton>
            <Badge badgeContent={1} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src="/path-to-profile-image.jpg" />
            <Typography>Indranil Saha</Typography>
          </Box>
        </Box>
      </Box>

      {/* Main heading */}
      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: '50px',
        }}
      >
        TA TEAM PAIRING
      </Typography>

      {/* Pairing Button */}
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
        <Button
          variant="contained"
          onClick={handlePairing}
          disabled={isPairing}
          sx={{
            backgroundColor: '#1a73e8',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1765c1',
            },
            px: 4,
            borderRadius: '4px',
          }}
        >
          {isPairing ? 'Pairing...' : 'Start Pairing'}
        </Button>
      </Paper>
    </Box>
  );
};

export default TATeamPairing;