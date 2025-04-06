'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { currentConfig } from '@/config';

interface ConfigState {
  teamPhase: boolean;
  discussions: boolean;
  feedback: boolean;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function CourseConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<ConfigState>({
    teamPhase: true,
    discussions: true,
    feedback: true
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch initial configuration states
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        };

        const [teamPhaseRes, discussionsRes, feedbackRes] = await Promise.all([
          axios.get(`${currentConfig.apiBaseUrl}/config/team-phase`, { headers }),
          axios.get(`${currentConfig.apiBaseUrl}/config/discussions`, { headers }),
          axios.get(`${currentConfig.apiBaseUrl}/config/feedback`, { headers })
        ]);

        setConfigs({
          teamPhase: teamPhaseRes.data.enabled,
          discussions: discussionsRes.data.enabled,
          feedback: feedbackRes.data.enabled
        });
      } catch (error: any) {
        if (error.response?.status === 403) {
          router.push('/dashboard');
        }
        setSnackbar({
          open: true,
          message: 'Failed to fetch configurations',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [router]);

  const handleConfigChange = async (configType: keyof ConfigState) => {
    try {
      const token = localStorage.getItem('token');
      const newValue = !configs[configType];
      
      const endpoint = `${currentConfig.apiBaseUrl}/config/${
        configType === 'teamPhase' ? 'team-phase' :
        configType === 'discussions' ? 'discussions' : 'feedback'
      }`;

      await axios.put(
        endpoint,
        { enabled: newValue },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        }
      );

      setConfigs(prev => ({
        ...prev,
        [configType]: newValue
      }));

      setSnackbar({
        open: true,
        message: `Successfully ${newValue ? 'enabled' : 'disabled'} ${configType}`,
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || `Failed to update ${configType} configuration`,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Title Section - Updated to exactly match dashboard style */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 2,
          background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <SettingsIcon sx={{ fontSize: 48 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {getGreeting()}, Professor
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage course activities and configure system settings
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Configuration Cards */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={500}>
              Team Phase
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Allow students to form and manage teams
            </Typography>
          </Box>
          <Switch
            checked={configs.teamPhase}
            onChange={() => handleConfigChange('teamPhase')}
            color="primary"
          />
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={500}>
              Discussions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enable discussion forums and team channels
            </Typography>
          </Box>
          <Switch
            checked={configs.discussions}
            onChange={() => handleConfigChange('discussions')}
            color="primary"
          />
        </Box>
      </Paper>

      <Paper elevation={1}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={500}>
              Feedback System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Allow students to submit peer feedback
            </Typography>
          </Box>
          <Switch
            checked={configs.feedback}
            onChange={() => handleConfigChange('feedback')}
            color="primary"
          />
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 