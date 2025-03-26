'use client';
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Stack
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutButton from './logout';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h6" component="h1">
        {title}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton>
          <Badge badgeContent={1} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <LogoutButton />
      </Stack>
    </Box>
  );
};

export default Header;
