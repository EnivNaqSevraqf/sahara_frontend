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
  Alert,
  Button
} from '@mui/material';

interface IGradeable {
  id: string;
  title: string;
  // due_date: string;
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
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get('http://localhost:8000/gradeables', config);
        setGradeables(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching gradeables:', error);
        setError(error.response?.data?.detail || 'Failed to load gradeables. Please try again later.');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          Gradeables
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/dashboard_test/gradeables/create_gradable'}
          sx={{ mb: 2 }}
        >
          Create New Gradeable
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              {/* <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell> */}
              <TableCell sx={{ fontWeight: 'bold' }}>Maximum Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gradeables.map((gradeable) => (
              <TableRow 
                key={gradeable.id}
                hover
                onClick={() => window.location.href = `/dashboard_test/gradeables/${gradeable.id}`}
                style={{ cursor: 'pointer' }}
                sx={{ '&:hover': { backgroundColor: '#f0f7ff !important' } }}
              >
                <TableCell>{gradeable.title}</TableCell>
                {/* <TableCell>{new Date(gradeable.due_date).toLocaleDateString()}</TableCell> */}
                <TableCell>{gradeable.max_points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}