'use client';
import React, { useState, JSX } from 'react';
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
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

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

// Pre-defined skills data
const initialSkills: Skill[] = [
  {
    id: 1,
    name: 'React',
    bgColor: '#61dafb',
    color: '#000000',
    icon: 'WebIcon',
  },
  {
    id: 2,
    name: 'Node.js',
    bgColor: '#43853d',
    color: '#ffffff',
    icon: 'JavascriptIcon',
  },
  {
    id: 3,
    name: 'Python',
    bgColor: '#3776ab',
    color: '#ffffff',
    icon: 'CodeIcon',
  },
  {
    id: 4,
    name: 'Java',
    bgColor: '#f89820',
    color: '#ffffff',
    icon: 'IntegrationInstructionsIcon',
  },
  {
    id: 5,
    name: 'Spring Boot',
    bgColor: '#6AAD3D',
    color: '#ffffff',
    icon: 'DataObjectIcon',
  },
  {
    id: 6,
    name: 'MongoDB',
    bgColor: '#13aa52',
    color: '#ffffff',
    icon: 'StorageIcon',
  },
];

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
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [open, setOpen] = useState(false);

  // Default new skill state
  const [newSkill, setNewSkill] = useState<Skill>({
    id: 0,
    name: '',
    bgColor: '#1F2E6A',
    color: '#ffffff',
    icon: 'WebIcon',
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    // Reset form when closing
    setNewSkill({
      id: 0,
      name: '',
      bgColor: '#1F2E6A',
      color: '#ffffff',
      icon: 'WebIcon',
    });
    setOpen(false);
  };

  const handleAddSkill = () => {
    // Validate input fields
    if (!newSkill.name.trim()) {
      alert('Please enter a skill name');
      return;
    }

    // Add the new skill
    const skillToAdd: Skill = {
      ...newSkill,
      id: skills.length + 1,
    };
    setSkills([...skills, skillToAdd]);

    // Reset form and close dialog
    handleClose();
  };

  return (
    <Box 
      sx={{ 
        p: 3, 
        backgroundColor: 'white', 
        minHeight: '100vh',
        color: '#1F2E6A' 
      }}
    >
      {/* Header */}
          <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: `2px solid #1F2E6A`,
        pb: 2,
        width: '100%'  // Ensures the border extends across the screen
      }}
    >
      <Typography 
        variant="h4"  // Increased size for a more prominent title
        component="h1" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#1F2E6A', 
          textAlign: 'center'  // Ensures the text itself is centered
        }}
      >
        Available Skills
      </Typography>
    </Box>

      {/* Add Skill Button - More Prominent */}
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

      {/* Skills Grid - More Compact */}
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