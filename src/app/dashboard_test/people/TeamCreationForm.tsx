'use client';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Avatar,
  TextField,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const TeamCreationForm = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          TEAM CREATION FORM
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

      {/* Form Status */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: '#f8f8f8',
          borderRadius: '8px',
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Team Creation Status : Form Not Published
        </Typography>
      </Paper>

      {/* Form Fields */}
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Title Field */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: 'white',
            borderRadius: '8px',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              color: '#1a73e8',
              fontWeight: 500,
            }}
          >
            Enter Title:
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter Title"
            sx={{
              backgroundColor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter Deadline"
            size="small"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Paper>

        {/* Description Field */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: 'white',
            borderRadius: '8px',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              color: '#1a73e8',
              fontWeight: 500,
            }}
          >
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Enter Description"
            sx={{
              backgroundColor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Paper>

        {/* Publish Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
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
            Publish
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TeamCreationForm;