'use client';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Avatar,
  Input,
  InputAdornment,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const AddTAs = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          ADD TAs
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
        ADD TAs
      </Typography>

      {/* File upload section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
        }}
      >
        <Paper
          sx={{
            width: '100%',
            maxWidth: '600px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
          }}
        >
          <Input
            placeholder="Attach .csv file"
            fullWidth
            disableUnderline
            sx={{ px: 2 }}
            readOnly
          />
          <IconButton
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddTAs; 