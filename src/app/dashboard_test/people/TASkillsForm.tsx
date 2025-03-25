'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';

const TASkillsForm = () => {
  const router = useRouter();
  const [skills, setSkills] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Skills:', skills);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          TA SKILLS FORM
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
        TA SKILLS FORM
      </Typography>

      {/* Form */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <TextField
          label="Enter Skills"
          variant="outlined"
          fullWidth
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
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
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default TASkillsForm;