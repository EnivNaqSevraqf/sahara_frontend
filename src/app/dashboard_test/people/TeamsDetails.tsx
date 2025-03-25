'use client';
import React, { useEffect, useState } from 'react';
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
import axios from 'axios';
import * as XLSX from 'xlsx';

// Update the Team type to include members
interface Team {
  number: number;
  name: string;
  members: string[]; // Add members property
}

const TeamsDetails = () => {
  const [formedTeams, setFormedTeams] = useState<Team[]>([]);
  const [betaTestPairs, setBetaTestPairs] = useState<any[]>([]); // Adjust type as needed

  useEffect(() => {
    const fetchTeamsAndPairs = async () => {
      const response = await axios.get("http://localhost:8000/teams/FormedTeams/");
      setFormedTeams(response.data);
    };

    fetchTeamsAndPairs();
  }, []);

  const [isComplete] = useState(true);
  const [betaPairsCreated] = useState(true);

  const downloadExcel = (data: any[], fileName: string) => {
    // Format the data to ensure members are visible in the Excel file
    const formattedData = data.map(item => ({
      ...item,
      members: item.members ? item.members.join(', ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

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
                  <TableCell>Members</TableCell> {/* Update column header */}
                </TableRow>
              </TableHead>
              <TableBody>
                {formedTeams.map((team) => (
                  <TableRow key={team.number}>
                    <TableCell>{team.number}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>
                      {team.members.join(', ')} {/* Display members */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            startIcon={<FileDownloadIcon />}
            sx={{ mt: 2, color: 'primary.main', textTransform: 'none' }}
            onClick={() => downloadExcel(formedTeams, 'FormedTeams')}
          >
            Download as Excel File
          </Button>
        </Box>

        {/* Right Side Content - Changes based on state */}
        <Box sx={{ flex: 1 }}>
          {betaPairsCreated ? (
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
                  Beta-Test Pairs
                </Typography>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Team Number Pairs</TableCell>
                      <TableCell>Team Names</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {betaTestPairs.map((pair) => (
                      <TableRow key={pair.pairNumber}>
                        <TableCell>{pair.pairNumber}</TableCell>
                        <TableCell>{pair.teamNames}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                startIcon={<FileDownloadIcon />}
                sx={{ mt: 2, color: 'primary.main', textTransform: 'none' }}
                onClick={() => downloadExcel(betaTestPairs, 'BetaTestPairs')}
              >
                Download as Excel File
              </Button>
            </>
          ) : (
            <Box sx={{ mb: 2 }}>
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
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TeamsDetails;