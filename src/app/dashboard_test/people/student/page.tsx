'use client';

import React, { useEffect, useState } from 'react';
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
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import axios from 'axios';

interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
}

const StudentPage = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);

  // Add fetch students logic here if needed
  useEffect(() => {
    const fetchStudents = async () => {
      const response = await axios.get("http://localhost:8000/student/");
      // console.log(response.data);
      setStudents(response.data);
    };
    fetchStudents();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Header title="STUDENTS" />
      
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
        STUDENTS
      </Typography>

      <Box sx={{ display: 'flex' }}>
        <TableContainer component={Paper} sx={{ mb: 3, flex: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>S. No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow 
                  key={student.id}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.role}</TableCell>
                </TableRow>
              ))}
              {/* Empty rows with dots */}
              {[...Array(6)].map((_, index) => (
                <TableRow key={`empty-${index}`}>
                  <TableCell>...</TableCell>
                  <TableCell>...</TableCell>
                  <TableCell>...</TableCell>
                  <TableCell>...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Button */}
        <Stack spacing={2} sx={{ ml: 2, minWidth: '200px' }}>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard_test/people/student/add')}
            sx={{
              backgroundColor: '#f0f0f0',
              color: '#000',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            ADD STUDENTS
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default StudentPage;