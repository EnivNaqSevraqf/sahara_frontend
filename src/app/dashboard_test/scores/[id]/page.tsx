'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TableSortLabel,
  Box,
  Toolbar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useParams } from 'next/navigation';

interface StudentScore {
  student_id: string;
  name: string;
  score: number;
  max_score: number;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const GradeableScoresPage: React.FC = () => {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof StudentScore>('name');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeableName, setGradeableName] = useState<string>('');
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchScores = async () => {
      try {
        setLoading(true);
        const [gradeableResponse, scoresResponse] = await Promise.all([
          axios.get(`http://localhost:8000/gradeables/${id}`),
          axios.get(`http://localhost:8000/gradeables/${id}/scores`)
        ]);
        
        setGradeableName(gradeableResponse.data.title || 'Untitled Assignment');
        setScores(scoresResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setError('Failed to load scores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [id]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof StudentScore,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof StudentScore) => (
    event: React.MouseEvent<unknown>,
  ) => {
    handleRequestSort(event, property);
  };

  if (loading) {
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
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
        {gradeableName} - Assignment Scores
      </Typography>
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'student_id'}
                  direction={orderBy === 'student_id' ? order : 'asc'}
                  onClick={createSortHandler('student_id')}
                >
                  Student ID
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
                  active={orderBy === 'score'}
                  direction={orderBy === 'score' ? order : 'asc'}
                  onClick={createSortHandler('score')}
                >
                  Score
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(scores, getComparator(order, orderBy))
              .map((score) => (
                <TableRow 
                  key={score.student_id}
                  sx={{ '&:hover': { backgroundColor: '#f0f7ff' } }}
                >
                  <TableCell>{score.student_id}</TableCell>
                  <TableCell>{score.name}</TableCell>
                  <TableCell>{score.score} / {score.max_score}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GradeableScoresPage;
