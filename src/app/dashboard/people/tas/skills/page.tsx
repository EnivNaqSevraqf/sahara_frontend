'use client';
import React, { useState, useEffect, JSX } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { currentConfig } from '@/config';

// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;

// Import icons from Material UI
import {
  Web as WebIcon,
  Javascript as JavascriptIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  IntegrationInstructions as IntegrationInstructionsIcon,
} from '@mui/icons-material';

// Import ColorInput from mui-color-input
import {MuiColorInput} from 'mui-color-input';

// Define the icon type
type IconType =
  | 'WebIcon'
  | 'JavascriptIcon'
  | 'CodeIcon'
  | 'StorageIcon'
  | 'DataObjectIcon'
  | 'IntegrationInstructionsIcon';

// Define the Skill type
type Skill = {
  id: number;
  name: string;
  bgColor: string;
  color: string;
  icon: IconType;
};

// Map icon types to actual icon components
const iconComponents: Record<IconType, JSX.Element> = {
  WebIcon: <WebIcon />,
  JavascriptIcon: <JavascriptIcon />,
  CodeIcon: <CodeIcon />,
  StorageIcon: <StorageIcon />,
  DataObjectIcon: <DataObjectIcon />,
  IntegrationInstructionsIcon: <IntegrationInstructionsIcon />,
};

// List available icons for the dropdown
const availableIcons = [
  { value: 'WebIcon', label: 'Web Icon' },
  { value: 'JavascriptIcon', label: 'JavaScript Icon' },
  { value: 'CodeIcon', label: 'Code Icon' },
  { value: 'StorageIcon', label: 'Storage Icon' },
  { value: 'DataObjectIcon', label: 'Data Object Icon' },
  { value: 'IntegrationInstructionsIcon', label: 'Integration Icon' },
];

const SkillsPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default new skill state
  const [newSkill, setNewSkill] = useState<Skill>({
    id: 0,
    name: '',
    bgColor: '#1F2E6A',
    color: '#ffffff',
    icon: 'WebIcon',
  });

  // Fetch skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        // No authentication required for GET /api/skills/
        const response = await axios.get('/api/skills/');
        
        console.log('Skills response:', response.data);
        if (response.status === 200) {
          setSkills(response.data);
          setError(null);
        } else {
          setError('Failed to fetch skills');
        }
      } catch (err) {
        console.error('Error details:', err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error('Error response:', err.response.data);
            console.error('Error status:', err.response.status);
            console.error('Error headers:', err.response.headers);
            
            if (err.response.status === 500) {
              setError(err.response.data.detail || 'Server error while fetching skills');
            } else {
              setError(err.response.data.detail || 'Failed to fetch skills');
            }
          } else if (err.request) {
            console.error('Error request:', err.request);
            setError('No response from server. Please check your connection.');
          } else {
            console.error('Error message:', err.message);
            setError('Failed to fetch skills: ' + err.message);
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setNewSkill({
      id: 0,
      name: '',
      bgColor: '#1F2E6A',
      color: '#ffffff',
      icon: 'WebIcon',
    });
    setOpen(false);
  };

  const handleAddSkill = async () => {
    try {
      // Validate input fields
      if (!newSkill.name.trim()) {
        setError('Please enter a skill name');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to create skills');
        return;
      }

      // Create skill data object
      const skillData = {
        name: newSkill.name,
        bgColor: newSkill.bgColor,
        color: newSkill.color,
        icon: newSkill.icon
      };

      console.log('Creating skill with data:', skillData);

      // Make API call to create skill
      const response = await axios.post('/api/skills/create', skillData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Create skill response:', response.data);
      // Add the new skill to the list
      setSkills([...skills, response.data]);
      setError(null);
      handleClose();
    } catch (err) {
      console.error('Error creating skill:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Error response:', err.response.data);
          if (err.response.status === 401) {
            setError('Please login to create skills');
          } else if (err.response.status === 403) {
            setError('Only professors and TAs can create skills');
          } else if (err.response.status === 400) {
            setError(err.response.data.detail || 'Invalid skill data');
          } else {
            setError(err.response.data.detail || 'Failed to create skill');
          }
        } else if (err.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError('Failed to create skill: ' + err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3, 
        backgroundColor: 'white', 
        minHeight: '100vh',
        color: '#1F2E6A' 
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mb: 4,
          borderBottom: `2px solid #1F2E6A`,
          pb: 2,
          width: '100%'
        }}
      >
        <Typography 
          variant="h4"
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1F2E6A', 
            textAlign: 'center'
          }}
        >
          Available Skills
        </Typography>
      </Box>

      {/* Add Skill Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4 
        }}
      >
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            borderRadius: '50px',
            bgcolor: '#1F2E6A',
            color: 'white',
            px: 4,
            py: 2,
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(31, 46, 106, 0.3)',
            '&:hover': {
              bgcolor: '#374A8C',
            },
          }}
        >
          + Add New Skill
        </Button>
      </Box>

      {/* Skills Grid */}
      <Grid 
        container 
        spacing={2} 
        justifyContent="center"
      >
        {skills.map((skill) => (
          <Grid item xs={6} sm={4} md={3} key={skill.id}>
            <Paper
              elevation={3}
              sx={{
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '15px',
                backgroundColor: skill.bgColor,
                color: skill.color,
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box sx={{ mb: 1, color: skill.color }}>
                {iconComponents[skill.icon]}
              </Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: 1 
                }}
              >
                {skill.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add Skill Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            backgroundColor: 'white',
            color: '#1F2E6A',
            maxWidth: '500px',
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(31, 46, 106, 0.5)',
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            color: '#1F2E6A' 
          }}
        >
          Add New Skill
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Skill Name */}
            <TextField
              label="Skill Name"
              fullWidth
              required
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g., React"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#1F2E6A',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1F2E6A',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1F2E6A',
                  },
                },
              }}
            />

            {/* Background Color */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: '#1F2E6A' }}>
                Background Color
              </Typography>
              <MuiColorInput
                value={newSkill.bgColor}
                onChange={(newValue: string) =>
                  setNewSkill((prev) => ({ ...prev, bgColor: newValue }))
                }
                sx={{ width: '100%' }}
              />
            </Box>

            {/* Text Color */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: '#1F2E6A' }}>
                Text Color
              </Typography>
              <MuiColorInput
                value={newSkill.color}
                onChange={(newValue: string) =>
                  setNewSkill((prev) => ({ ...prev, color: newValue }))
                }
                sx={{ width: '100%' }}
              />
            </Box>

            {/* Icon Selection */}
            <FormControl fullWidth required>
              <InputLabel sx={{ color: '#1F2E6A' }}>Icon</InputLabel>
              <Select
                value={newSkill.icon}
                label="Icon *"
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    icon: e.target.value as IconType,
                  })
                }
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F2E6A',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F2E6A',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F2E6A',
                  },
                }}
              >
                {availableIcons.map((icon) => (
                  <MenuItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleClose} 
            sx={{ 
              color: '#1F2E6A', 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(31, 46, 106, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSkill}
            variant="contained"
            sx={{
              bgcolor: '#1F2E6A',
              color: 'white',
              '&:hover': {
                bgcolor: '#374A8C',
              },
            }}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsPage;