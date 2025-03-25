'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';

interface IGradeable {
  id: string;
  title: string;
  due_date: string;
  max_points: number;
}

export default function GradeablesListPage() {
  const [gradeables, setGradeables] = useState<IGradeable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGradeables = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/gradeables');
        setGradeables(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching gradeables:', error);
        setError('Failed to load gradeables. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGradeables();
  }, []);

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
        Gradeables
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gradeables.map((gradeable) => (
              <TableRow 
                key={gradeable.id}
                hover
                onClick={() => window.location.href = `/dashboard_test/scores/${gradeable.id}`}
                style={{ cursor: 'pointer' }}
                sx={{ '&:hover': { backgroundColor: '#f0f7ff !important' } }}
              >
                <TableCell>{gradeable.title}</TableCell>
                <TableCell>{new Date(gradeable.due_date).toLocaleDateString()}</TableCell>
                <TableCell>{gradeable.max_points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}