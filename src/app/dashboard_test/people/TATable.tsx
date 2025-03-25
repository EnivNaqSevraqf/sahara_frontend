'use client';
import React, { JSX } from 'react';
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
  Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import JavascriptIcon from '@mui/icons-material/Javascript';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import WebIcon from '@mui/icons-material/Web';
import DataObjectIcon from '@mui/icons-material/DataObject';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import { useRouter } from 'next/navigation';  

// Define the type for skillsMap
interface Skill {
  bgColor: string;
  color: string;
  icon: JSX.Element;
}

// Skill to color and icon mapping
const skillsMap: { [key: string]: Skill } = {
  'React': {
    bgColor: '#61dafb',  // Light blue - React's brand color
    color: '#000000',
    icon: <WebIcon fontSize="small" />
  },
  'Node.js': {
    bgColor: '#43853d',  // Dark green - Node.js brand color
    color: '#ffffff',
    icon: <JavascriptIcon fontSize="small" />
  },
  'Python': {
    bgColor: '#3776ab',  // Blue - Python's brand color
    color: '#ffffff',
    icon: <CodeIcon fontSize="small" />
  },
  'Java': {
    bgColor: '#f89820',  // Orange - Java's brand color
    color: '#ffffff',
    icon: <IntegrationInstructionsIcon fontSize="small" />
  },
  'Spring Boot': {
    bgColor: '#6AAD3D',  // Lime green - Spring's brand color
    color: '#ffffff',
    icon: <DataObjectIcon fontSize="small" />
  },
  'MongoDB': {
    bgColor: '#13aa52',  // Emerald green - MongoDB's brand color
    color: '#ffffff',
    icon: <StorageIcon fontSize="small" />
  }
};

// Sample TA data with skills
const tas = [
  { 
    id: 1, 
    name: 'Hemang Mohanlal Khatri', 
    email: 'hemangmkhatri@cse.iitk.ac.in',
    skills: ['React', 'Node.js', 'Python']
  },
  { 
    id: 2, 
    name: 'Jeswaanth Gogula', 
    email: 'jeswaanth@cse.iitk.ac.in',
    skills: ['Java', 'Spring Boot', 'MongoDB']
  },
  // Add more sample data as needed
];

const TATable = () => {
  const router = useRouter();
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with notifications and profile */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          TAs
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
        TAs
      </Typography>

      {/* Table */}
      <Box sx={{ display: 'flex' }}>
        <TableContainer component={Paper} sx={{ mb: 3, flex: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>S. No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Skills</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tas.map((ta) => (
                <TableRow 
                  key={ta.id}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell>{ta.id}</TableCell>
                  <TableCell>{ta.name}</TableCell>
                  <TableCell>{ta.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {ta.skills.map((skill, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            margin: '2px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: skillsMap[skill]?.bgColor || '#gray',
                            color: skillsMap[skill]?.color || '#000000',
                            fontSize: '0.85rem',
                          }}
                        >
                          {skillsMap[skill]?.icon}
                          {skill}
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
        <Stack spacing={2} sx={{ ml: 2, minWidth: '200px' }}>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard_test/people/tas/add')}
            sx={{
              backgroundColor: '#f0f0f0',
              color: '#000',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            ADD TAs
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard_test/people/tas/skills')}
            sx={{
              backgroundColor: '#f0f0f0',
              color: '#000',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            TA-skills form
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#f0f0f0',
              color: '#000',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            Automate TA-team pairing
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default TATable;