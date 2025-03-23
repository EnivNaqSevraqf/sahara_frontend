'use client';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Avatar,
  Button,
  Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';

const TASkillsForm = () => {
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
        TEACHING ASSISTANTS SKILLS FORM
      </Typography>

      {/* Action Buttons at the top */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<CalendarMonthIcon />}
          sx={{
            backgroundColor: '#003366',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002244',
            },
            width: '200px',
          }}
        >
          Add deadline
        </Button>
        <Button
          variant="contained"
          startIcon={<TextFieldsIcon />}
          sx={{
            backgroundColor: '#003366',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002244',
            },
            width: '200px',
          }}
        >
          Add text
        </Button>
      </Box>

      {/* Form Content Area */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        {/* Gray drag and drop area */}
        <Box
          sx={{
            width: '100%',
            height: '150px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc',
            borderRadius: '4px',
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
          <Typography color="textSecondary">
            Drag and drop images required (currently empty)
          </Typography>
        </Box>
      </Paper>

      {/* Bottom Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#003366',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002244',
            },
            width: '200px',
          }}
        >
          Publish form
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#003366',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002244',
            },
            width: '300px',
          }}
        >
          Finalize data and match teams with TA
        </Button>
      </Box>
    </Box>
  );
};

export default TASkillsForm; 