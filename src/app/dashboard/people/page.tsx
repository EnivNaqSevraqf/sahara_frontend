'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  TableSortLabel,
  Toolbar,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { currentConfig } from '@/config';
import { tableStyles } from './constants/theme';
import type { Student, Role } from './types';
import { SelectChangeEvent } from '@mui/material/Select';

const PeoplePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Student>('name');

  const getRoleBadgeStyles = (role: Role) => {
    switch (role) {
      case 'Student':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32'
        };
      case 'Professor':
        return {
          backgroundColor: '#fff8e1',
          color: '#f57f17'
        };
      case 'TA':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0'
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#757575'
        };
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const config = {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json',
          }
        };
        const response = await axios.get(`${currentConfig.apiBaseUrl}/people/`, config);
        setStudents(response.data);
        setError(null);
      }
      catch (error) {
        console.error('Error fetching students:', error);
        const status = (error as any).response?.status;
        if(status === 401){
          console.log("Unauthenticated");
          setError('Authentication required. Please login again.');
        }
        else if(status === 403){
          setError('Access denied. You do not have permission to view this page.');
        }
        else {
          setError('Failed to load people data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value as string);
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Student,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof Student) => (
    event: React.MouseEvent<unknown>,
  ) => {
    handleRequestSort(event, property);
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (orderBy === 'id' || orderBy === 'name' || orderBy === 'email' || orderBy === 'role') {
      if (order === 'asc') {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredStudents = filter
    ? sortedStudents.filter((student) => student.role === filter)
    : sortedStudents;

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'People');
    XLSX.writeFile(workbook, 'People.xlsx');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header with title and action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#033076' }}>
          People
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#033076', color: 'white', '&:hover': { backgroundColor: '#02225a' } }}
          onClick={() => router.push('/dashboard/people/add')}
        >
          Add Students
        </Button>
      </Box>
      
      {/* Filter and export controls */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="role-filter-label">Filter by Role</InputLabel>
          <Select
            labelId="role-filter-label"
            value={filter}
            label="Filter by Role"
            onChange={handleFilterChange}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Professor">Professor</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
            <MenuItem value="TA">TA</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          onClick={downloadExcel}
          sx={{ 
            borderColor: '#033076', 
            color: '#033076', 
            '&:hover': { borderColor: '#033076', backgroundColor: '#f0f7ff' }
          }}
        >
          Export to Excel
        </Button>
      </Box>

      {/* Table of people */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Toolbar sx={{ backgroundColor: '#f5f9ff' }}>
          <Typography variant="h6" component="div">
            People List
          </Typography>
        </Toolbar>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={createSortHandler('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={createSortHandler('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={createSortHandler('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={createSortHandler('role')}
                >
                  Role
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow 
                key={student.id} 
                hover
                sx={{ '&:hover': { backgroundColor: '#f0f7ff !important' } }}
              >
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Box 
                    component="span" 
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      ...getRoleBadgeStyles(student.role)
                    }}
                  >
                    {student.role}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  No people found matching the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard/people/teams/create')}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Create Team
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/dashboard/people/teams/details')}
          sx={{
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': { borderColor: '#1565c0', backgroundColor: '#f0f7ff' },
          }}
        >
          View Team Details
        </Button>
      </Stack>
    </Box>
  );
};

export default PeoplePage;