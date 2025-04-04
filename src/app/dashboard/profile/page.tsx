'use client';

import * as React from 'react';
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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import axios from 'axios';
import { currentConfig } from '@/config';
import PersonIcon from '@mui/icons-material/Person';
import TimelineIcon from '@mui/icons-material/Timeline';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import DataObjectIcon from '@mui/icons-material/DataObject';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import WebIcon from '@mui/icons-material/Web';
import JavascriptIcon from '@mui/icons-material/Javascript';

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

interface Skill {
  id: number;
  name: string;
  bgColor: string;
  color: string;
  icon: string;
}

// Update icon components type definition to use SvgIconProps
const iconComponents: Record<string, React.ComponentType<{ sx?: any }>> = {
  'WebIcon': WebIcon,
  'JavascriptIcon': JavascriptIcon,
  'CodeIcon': CodeIcon,
  'StorageIcon': StorageIcon,
  'DataObjectIcon': DataObjectIcon,
  'IntegrationInstructionsIcon': IntegrationInstructionsIcon
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user profile data
        const userResponse = await axios.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserData(userResponse.data);

        // Fetch all available skills from backend
        const skillsResponse = await axios.get(`${currentConfig.apiBaseUrl}/api/skills`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAllSkills(skillsResponse.data);

        // Fetch user's current skills
        const userSkillsResponse = await axios.get(`${currentConfig.apiBaseUrl}/api/users/skills`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUserSkills(userSkillsResponse.data);
        setSelectedSkillIds(userSkillsResponse.data.map((skill: Skill) => skill.id));

        setError(null);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.detail || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleOpenSkillsDialog = () => {
    setSelectedSkillIds(userSkills.map(skill => skill.id));
    setDialogOpen(true);
  };

  const handleCloseSkillsDialog = () => {
    setDialogOpen(false);
  };

  const handleSkillSelectionChange = (event: SelectChangeEvent<number[]>) => {
    const { value } = event.target;
    setSelectedSkillIds(typeof value === 'string' ? [] : value as number[]);
  };

  const handleUpdateSkills = async () => {
    try {
      setSavingSkills(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update user skills in backend
      await axios.put(
        `${currentConfig.apiBaseUrl}/api/users/skills`,
        { skill_ids: selectedSkillIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Fetch updated user skills
      const updatedSkillsResponse = await axios.get(
        `${currentConfig.apiBaseUrl}/api/users/skills`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUserSkills(updatedSkillsResponse.data);
      handleCloseSkillsDialog();
    } catch (err: any) {
      console.error('Error updating skills:', err);
      setError(err.response?.data?.detail || 'Failed to update skills. Please try again later.');
    } finally {
      setSavingSkills(false);
    }
  };

  const renderSkillChip = (skill: Skill) => {
    const IconComponent = iconComponents[skill.icon];
    return (
      <Chip
        key={skill.id}
        label={skill.name}
        style={{
          backgroundColor: skill.bgColor || '#f0f0f0',
          color: skill.color || '#000000',
          margin: '4px',
          border: `1px solid ${skill.color || '#000000'}`,
        }}
        icon={IconComponent && <IconComponent sx={{ color: skill.color }} />}
      />
    );
  };

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

          {/* Skills Section - Now shown for all users */}
          <Grid item xs={12}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon sx={{ color: '#033076' }} />
                  <Typography variant="h6" sx={{ color: '#033076' }}>
                    Skills & Expertise
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={handleOpenSkillsDialog}
                  sx={{
                    borderColor: '#033076',
                    color: '#033076',
                    '&:hover': {
                      backgroundColor: 'rgba(3, 48, 118, 0.08)',
                    }
                  }}
                >
                  Manage Skills
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {userSkills.length > 0 ? (
                  userSkills.map(skill => renderSkillChip(skill))
                ) : (
                  <Typography color="text.secondary">
                    No skills added yet. Click "Manage Skills" to add your expertise.
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Skills Selection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseSkillsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Your Skills</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel id="skills-select-label">Your Skills</InputLabel>
            <Select
              labelId="skills-select-label"
              id="skills-select"
              multiple
              value={selectedSkillIds}
              onChange={handleSkillSelectionChange}
              input={<OutlinedInput label="Your Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const skill = allSkills.find(s => s.id === value);
                    return skill ? renderSkillChip(skill) : null;
                  })}
                </Box>
              )}
            >
              {allSkills.map((skill) => (
                <MenuItem key={skill.id} value={skill.id}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      backgroundColor: skill.bgColor,
                      color: skill.color,
                      border: `1px solid ${skill.color}`,
                      width: '100%'
                    }}
                  >
                    {iconComponents[skill.icon] && 
                      React.createElement(iconComponents[skill.icon], { 
                        sx: { color: skill.color } 
                      })
                    }
                    {skill.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Select the skills that best represent your expertise. These skills will help match you with teams that need your knowledge.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSkillsDialog} disabled={savingSkills}>Cancel</Button>
          <Button
            onClick={handleUpdateSkills}
            variant="contained"
            disabled={savingSkills}
            startIcon={savingSkills ? <CircularProgress size={20} /> : null}
          >
            {savingSkills ? 'Saving...' : 'Save Skills'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}