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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Header from './components/Header';
import { buttonStyles, tableStyles } from './constants/theme';
import type { Student } from './types';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material';

const PeopleTable = () => {
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

  return (
    <Box sx={{ p: 3 }}>
      {isLoading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
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
      {!isLoading && (
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}></Box>
    </Box>
  );
};

export default PeopleTable;