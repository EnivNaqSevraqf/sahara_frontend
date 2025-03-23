'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Inter } from 'next/font/google'

// Sample student data
const students = [
  { id: 1, name: 'Aarav Oswal', email: 'aarav@iitk.ac.in' },
  { id: 2, name: 'Achyuth Warrier', email: 'achyuth@iitk.ac.in' },
  // Add more sample data as needed
];

const StudentTable = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        STUDENTS
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S. No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#f0f0f0',
            color: '#1976d2',
            '&:hover': {
              bgcolor: '#e0e0e0',
            },
          }}
        >
          ADD STUDENTS
        </Button>
      </Box>
    </Box>
  );
};

export default StudentTable; 