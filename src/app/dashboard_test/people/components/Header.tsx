'use client';
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h6" component="h1">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton>
          <Badge badgeContent={1} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 