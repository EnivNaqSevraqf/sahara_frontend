'use client';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Sample pairing data
const teamPairings = [
  {
    id: 1,
    teamName: 'Ravi and Friends',
    teamEmail: 'bangaram@iitk.ac.in',
    taAssigned: 'Venkat Raghav',
    taEmail: 'venkatr@iitk.ac.in',
  },
  {
    id: 2,
    teamName: 'Nechrozma',
    teamEmail: 'anant@iitk.ac.in',
    taAssigned: 'Shubham Gupta',
    taEmail: 'shubhamg@iitk.ac.in',
  },
  // Add more sample data as needed
];

const TATeamPairing = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          TA - TEAM PAIRING
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
        TA - TEAMS PAIRING OVERVIEW
      </Typography>

      {/* Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>S. No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>email ID</TableCell>
              <TableCell>TA assigned</TableCell>
              <TableCell>TA email ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamPairings.map((pairing) => (
              <TableRow 
                key={pairing.id}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
              >
                <TableCell>{pairing.id}</TableCell>
                <TableCell>{pairing.teamName}</TableCell>
                <TableCell>{pairing.teamEmail}</TableCell>
                <TableCell>{pairing.taAssigned}</TableCell>
                <TableCell>{pairing.taEmail}</TableCell>
              </TableRow>
            ))}
            {/* Empty rows with dots */}
            {[...Array(6)].map((_, index) => (
              <TableRow key={`empty-${index}`}>
                <TableCell>...</TableCell>
                <TableCell>...</TableCell>
                <TableCell>...</TableCell>
                <TableCell>...</TableCell>
                <TableCell>...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            width: '250px',
            borderRadius: '20px',
          }}
        >
          Rematch TA&apos;s with teams
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#003366',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002244',
            },
            width: '250px',
            borderRadius: '20px',
          }}
        >
          Finalize TA team pairing
        </Button>
      </Box>
    </Box>
  );
};

export default TATeamPairing; 