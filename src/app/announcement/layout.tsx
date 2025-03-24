'use client';
import { Box, Typography } from '@mui/material';
import Sidebar from '@/components/Sidebar';

export default function AnnouncementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontWeight: 500,
            color: 'primary.main'
          }}
        >
          Announcements
        </Typography>
        {children}
      </Box>
    </Box>
  );
} 