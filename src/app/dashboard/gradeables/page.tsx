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
  Button,
  Toolbar,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useRouter } from 'next/navigation';
import { currentConfig } from '@/config';

axios.defaults.baseURL = currentConfig.apiBaseUrl;

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
  const router = useRouter();

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

        const response = await axios.get('/gradeables', config);
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
    <Box p={3} sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Gradeables header with gradient */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <AssignmentIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                Gradeables Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Create and manage assignment gradeables
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => router.push('/dashboard/gradeables/create_gradable')}
            startIcon={<AddIcon />}
            sx={{ 
              height: 48, 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#3f51b5',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
              borderRadius: 1,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            Create New Gradeable
          </Button>
        </Box>
      </Paper>

      {/* Gradeables Table */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <TableContainer sx={{ borderRadius: 2 }}>
          <Toolbar sx={{ backgroundColor: '#f8faff' }}>
            <Typography variant="h6" component="div">
              Gradeable List
            </Typography>
          </Toolbar>
          <Table>
            <TableHead>
              <TableRow sx={{
                backgroundColor: '#f8faff',
                '& th': {
                  fontWeight: 'bold',
                  borderBottom: 'none',
                }
              }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Maximum Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gradeables.length > 0 ? (
                gradeables.map((gradeable) => (
                  <TableRow 
                    key={gradeable.id}
                    hover
                    onClick={() => router.push(`/dashboard/gradeables/${gradeable.id}`)}
                    style={{ cursor: 'pointer' }}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& td': {
                        borderBottom: '1px solid #f0f0f0',
                        padding: '16px',
                        transition: 'background-color 0.2s ease',
                      },
                      '&:hover': {
                        backgroundColor: '#e8f0fe !important',
                      },
                    }}
                  >
                    <TableCell>{gradeable.title}</TableCell>
                    <TableCell>{gradeable.max_points}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, borderBottom: 'none' }}>
                    <Typography variant="body1" color="text.secondary">
                      No gradeables found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}