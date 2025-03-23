'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Avatar,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Sample data for formed teams
const formedTeams = [
  { number: 1, name: 'Ravi and Friends', details: '...', techStacks: '...' },
  { number: 2, name: 'Ravioli', details: '...', techStacks: '...' },
];

// Sample data for beta test pairs
const betaTestPairs = [
  { 
    pairNumber: '1-2', 
    teamNames: 'Ravi and Friends - Ravioli', 
    commonTechStacks: '...' 
  },
];

// Sample data for unpaired students
const unpairedStudents = [
  { rollNo: '231031', name: 'Spandan' },
  { rollNo: '231032', name: 'Sparsh' },
];

const TeamsDetails = () => {
  const [isComplete] = useState(true); // Toggle this to show different states
  const [betaPairsCreated] = useState(true); // Toggle this to show different beta pairs states

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          TEAMS&apos; DETAILS
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

      {/* Status Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <Typography variant="subtitle1">
          Team Creation Status : {isComplete ? 'Complete' : 'In Progress'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="primary">
            Due : 05-02-2025
          </Typography>
          <Typography variant="body2">
            Teams Formed : <span style={{ color: isComplete ? 'green' : 'red' }}>
              {isComplete ? '17/17' : '10/17'}
            </span>
          </Typography>
        </Box>
      </Paper>

      {/* Tables Section */}
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Formed Teams Table */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Search Team"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" color="primary">
              Formed Teams
            </Typography>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Team Number</TableCell>
                  <TableCell>Team Name</TableCell>
                  <TableCell>Member, Project Details</TableCell>
                  {isComplete && <TableCell>Tech Stacks</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {formedTeams.map((team) => (
                  <TableRow key={team.number}>
                    <TableCell>{team.number}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.details}</TableCell>
                    {isComplete && <TableCell>{team.techStacks}</TableCell>}
                  </TableRow>
                ))}
                {[...Array(2)].map((_, index) => (
                  <TableRow key={`empty-formed-${index}`}>
                    <TableCell>...</TableCell>
                    <TableCell>...</TableCell>
                    <TableCell>...</TableCell>
                    {isComplete && <TableCell>...</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            startIcon={<FileDownloadIcon />}
            sx={{ mt: 2, color: 'primary.main', textTransform: 'none' }}
          >
            Download as Excel File
          </Button>
        </Box>

        {/* Right Side Content - Changes based on state */}
        <Box sx={{ flex: 1 }}>
          {!isComplete ? (
            // Show unpaired students table when in progress
            <>
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="Search Name, Roll No"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <Typography variant="h6" color="primary">
                  Students not in Teams
                </Typography>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Student Roll No</TableCell>
                      <TableCell>Student Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unpairedStudents.map((student) => (
                      <TableRow key={student.rollNo}>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                      </TableRow>
                    ))}
                    {[...Array(2)].map((_, index) => (
                      <TableRow key={`empty-unpaired-${index}`}>
                        <TableCell>...</TableCell>
                        <TableCell>...</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    textTransform: 'none',
                  }}
                >
                  Allot unpaired students into existing teams
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    textTransform: 'none',
                  }}
                >
                  Finalize teams
                </Button>
              </Box>
            </>
          ) : (
            // Show Beta-Test Pairs section when complete
            <>
              <Box sx={{ mb: 2 }}>
                {!betaPairsCreated ? (
                  <>
                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      Beta-Test Pairs: Not Created
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        textTransform: 'none',
                      }}
                    >
                      Create Beta-Test Pairs
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      placeholder="Search Name, Roll No"
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" color="primary">
                      Beta-Test Pairs
                    </Typography>
                  </>
                )}
              </Box>

              {betaPairsCreated && (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Team Number Pairs</TableCell>
                          <TableCell>Team Names</TableCell>
                          <TableCell>Common Tech Stacks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {betaTestPairs.map((pair) => (
                          <TableRow key={pair.pairNumber}>
                            <TableCell>{pair.pairNumber}</TableCell>
                            <TableCell>{pair.teamNames}</TableCell>
                            <TableCell>{pair.commonTechStacks}</TableCell>
                          </TableRow>
                        ))}
                        {[...Array(2)].map((_, index) => (
                          <TableRow key={`empty-pairs-${index}`}>
                            <TableCell>...</TableCell>
                            <TableCell>...</TableCell>
                            <TableCell>...</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Button
                    startIcon={<FileDownloadIcon />}
                    sx={{ mt: 2, color: 'primary.main', textTransform: 'none' }}
                  >
                    Download as Excel File
                  </Button>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TeamsDetails; 