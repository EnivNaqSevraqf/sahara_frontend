'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from './components/Header';
import { tableStyles } from './constants/theme';
import type { Student } from './types';
import { SelectChangeEvent } from '@mui/material/Select';
import * as XLSX from 'xlsx';

const PeoplePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8000/people/');
      if (response.status !== 200) {
        setError('Failed to fetch students data.');
      } else {
        setError(null);
        setIsLoading(false);
      }
      setStudents(response.data);
    };
    fetchStudents();
  }, []);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value as string);
  };

  const filteredStudents = filter
    ? students.filter((student) => student.role === filter)
    : students;

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'People');
    XLSX.writeFile(workbook, 'People.xlsx');
  };

  return (
    <Box sx={{ p: 3, position: 'relative', minHeight: '100vh' }}>
      {error && <Typography color="error">{error}</Typography>}
      <Header title="PEOPLE" />
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="role-filter-label">Filter by Role</InputLabel>
        <Select
          labelId="role-filter-label"
          value={filter}
          label="Filter by Role"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Professor">Professor</MenuItem>
          <MenuItem value="Student">Student</MenuItem>
          <MenuItem value="TA">TA</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={downloadExcel}
        sx={{ mb: 3, backgroundColor: '#1a73e8', color: '#fff', '&:hover': { backgroundColor: '#1765c1' } }}
      >
        Export to Excel
      </Button>
      {!isLoading && (
        <TableContainer component={Paper} sx={{ mb: 3, maxHeight: '60vh', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={tableStyles.headerCell}>
                <TableCell>S. No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} sx={tableStyles.alternatingRow}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell
                    sx={{
                      color: student.role === 'Student' ? '#4caf50' : '#f44336',
                    }}
                  >
                    {student.role}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Stack spacing={2} sx={{ position: 'fixed', bottom: 16, left: 16, right: 16 }}>
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard_test/people/add')}
          sx={{
            backgroundColor: '#f0f0f0',
            color: '#000',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          ADD PEOPLE
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard_test/people/teams/create')}
          sx={{
            backgroundColor: '#f0f0f0',
            color: '#000',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          CREATE TEAM
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard_test/people/teams/details')}
          sx={{
            backgroundColor: '#f0f0f0',
            color: '#000',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          VIEW TEAM DETAILS
        </Button>
      </Stack>
    </Box>
  );
};

export default PeoplePage;