'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import axios from 'axios';
import { currentConfig } from '@/config';
import PersonIcon from '@mui/icons-material/Person';

// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;

interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  team_name: string | null;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUserData(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.detail || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto' }}>
      {/* Gradient Header Card */}
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
              <PersonIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {userData?.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                @{userData?.username}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Details Card */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fbfdff', border: '1px solid #e3f2fd' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#033076' }}>
                Profile Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {userData?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role
                  </Typography>
                  <Chip 
                    label={userData?.role} 
                    sx={{ 
                      backgroundColor: '#e3f2fd',
                      color: '#033076',
                      fontWeight: 500,
                      mt: 0.5
                    }} 
                  />
                </Grid>
                {userData?.team_name && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Team
                    </Typography>
                    <Typography variant="body1">
                      {userData.team_name}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#033076' }}>
                Account Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">
                    {userData?.id}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}