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
  TableSortLabel,
  Toolbar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import Header from './components/Header';
import { tableStyles } from './constants/theme';
import type { Student } from './types';
import { SelectChangeEvent } from '@mui/material/Select';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { currentConfig } from '@/config';
import Auth from '../../login/auth';

const PeoplePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Student>('name');

  useEffect(() => {
    const fetchStudents = async () => {
      console.log("Fetching students");
      setIsLoading(true);
      setError(null);
      try{
        const response = await axios.get(`${currentConfig.apiBaseUrl}/people/`);
        setStudents(response.data);
      }
      catch (error) {

        console.error('Error fetching students:', error);
        const status = (error as any).response?.status;
        console.log('Status:', status);
        if(status === 401){
          Auth.logOut();
          const router = useRouter();
          router.push('/login');
          setIsLoading(false);
        }
        else if(status === 403){
          setIsLoading(false);
          setError('Access denied. You do not have permission to view this page.');
        }
        // setError('Failed to fetch students data: ' + error.message);
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
      <Box sx={{ mb: 3, maxHeight: '40vh', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        {!isLoading && (
          <TableContainer component={Paper}>
            <Toolbar sx={{ backgroundColor: '#f5f9ff' }}>
              <Box flexGrow={1}>
                <Typography variant="h6" component="div">
                  Student Results
                </Typography>
              </Box>
              <Tooltip title="Filter list">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={tableStyles.headerCell}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={orderBy === 'id'}
                      direction={orderBy === 'id' ? order : 'asc'}
                      onClick={createSortHandler('id')}
                    >
                      S. No.
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
                      email
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
      </Box>
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