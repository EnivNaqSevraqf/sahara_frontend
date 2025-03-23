'use client';
import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import Header from './components/Header';
import { buttonStyles, tableStyles } from './constants/theme';
import type { Student } from './types';

// Sample student data
const students: Student[] = [
  { id: 1, name: 'Aarav Oswal', email: 'aarav@iitk.ac.in', role: 'Student' },
  { id: 2, name: 'Achyuth Warrier', email: 'achyuth@iitk.ac.in', role: 'TA' },
];

const PeopleTable = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Header title="PEOPLE" />
      
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
        PEOPLE
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={tableStyles.headerCell}>
              <TableCell>S. No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} sx={tableStyles.alternatingRow}>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell sx={{ 
                  color: student.role === 'Student' ? '#4caf50' : '#f44336'
                }}>
                  {student.role}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={buttonStyles.secondary}
          href="/people/add"
        >
          ADD STUDENTS
        </Button>
      </Box>
    </Box>
  );
};

export default PeopleTable; 