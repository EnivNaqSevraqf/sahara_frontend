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
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'next/navigation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import { currentConfig } from '@/config';

axios.defaults.baseURL = currentConfig.apiBaseUrl;

interface StudentScore {
  user_id: number;
  name: string;
  score: number;
}

interface ScoreStatistics {
  mean: number;
  median: number;
  mode: number;
  variance: number;
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

const calculateStatistics = (scores: StudentScore[]): ScoreStatistics => {
  const values = scores.map(s => s.score);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
    : sorted[Math.floor(sorted.length/2)];
  
  const mode = values.reduce((a, b) => (
    values.filter(v => v === a).length >= values.filter(v => v === b).length ? a : b
  ));
  
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

  return { mean, median, mode, variance };
};

const GradeableScoresPage: React.FC = () => {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof StudentScore>('name');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeableName, setGradeableName] = useState<string>('');
  const [graphData, setGraphData] = useState<{ score: number; count: number }[]>([]);
  const [statistics, setStatistics] = useState<ScoreStatistics>({ mean: 0, median: 0, mode: 0, variance: 0 });
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const fetchScores = async () => {
      try {
        const token = localStorage.getItem('token');

        const config = {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        };

        const [gradeableResponse, scoresResponse] = await Promise.all([
          axios.get(`/gradeables/${id}`, config),
          axios.get(`/gradeables/${id}/scores`, config)
        ]);
        
        setGradeableName(gradeableResponse.data.title || 'Untitled Assignment');
        setScores(scoresResponse.data);

        // Calculate graph data and statistics
        const scoreCounts = scoresResponse.data.reduce((acc: any, curr: StudentScore) => {
          acc[curr.score] = (acc[curr.score] || 0) + 1;
          return acc;
        }, {});
        
        const graphDataArray = Object.entries(scoreCounts).map(([score, count]) => ({
          score: Number(score),
          count: count as number
        }));
        
        setGraphData(graphDataArray);
        setStatistics(calculateStatistics(scoresResponse.data));
        setError(null);
      } catch (error: any) {
        console.error('Error fetching scores:', error);
        setError(error.response?.data?.detail || 'Failed to load scores. Please try again later.');
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
      {/* Gradient Header Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <GradeIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {gradeableName}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {scores.length} student submissions
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          p: 2,
          borderRadius: 2
        }}>
          <AssignmentIcon />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {statistics?.mean ? `Mean Score: ${statistics.mean.toFixed(2)}` : 'No scores yet'}
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Table Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                height: '500px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Toolbar sx={{ 
                backgroundColor: '#f5f9ff',
                flex: '0 0 auto'  // Prevents toolbar from scrolling
              }}>
                <Box flexGrow={1}>
                  <Typography variant="h6" component="div">
                    Student Results
                  </Typography>
                </Box>
              </Toolbar>
              <Box sx={{ 
                flex: '1 1 auto',
                overflow: 'auto' // Makes the table body scrollable
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <TableSortLabel
                          active={orderBy === 'user_id'}
                          direction={orderBy === 'user_id' ? order : 'asc'}
                          onClick={createSortHandler('user_id')}
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
                          key={score.user_id}
                          sx={{ '&:hover': { backgroundColor: '#f0f7ff' } }}
                        >
                          <TableCell>{score.user_id}</TableCell>
                          <TableCell>{score.name}</TableCell>
                          <TableCell>{score.score}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Box>
            </TableContainer>
          </Card>
        </Grid>

        {/* Graph Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: '#f8fbff', height: '500px' }}>
            <CardContent sx={{ height: '100%', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Score Distribution
              </Typography>
              <Box sx={{ height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" label={{ value: 'Score', position: 'bottom' }} />
                    <YAxis label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Section */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#f8fbff' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                Score Statistics
              </Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Mean Score', value: statistics.mean.toFixed(2) },
                  { label: 'Median Score', value: statistics.median.toFixed(2) },
                  { label: 'Mode Score', value: statistics.mode.toFixed(2) },
                  { label: 'Variance', value: statistics.variance.toFixed(2) }
                ].map((stat) => (
                  <Grid item xs={12} sm={6} md={3} key={stat.label}>
                    <Card sx={{ backgroundColor: '#ffffff' }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {stat.label}
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#1976d2' }}>
                          {stat.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GradeableScoresPage;

