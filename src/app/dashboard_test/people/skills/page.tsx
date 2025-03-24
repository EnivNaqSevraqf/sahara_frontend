'use client';
import React, { useState } from 'react';
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
import ColorInput from 'mui-color-input';

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
    bgColor: '#000000',
    color: '#ffffff',
    icon: 'WebIcon',
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    // Reset form when closing
    setNewSkill({
      id: 0,
      name: '',
      bgColor: '#000000',
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" component="h1">
          Skills Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton>
            <Badge badgeContent={1} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src="/path-to-profile-image.jpg" />
            <Typography>Indranil Saha</Typography>
          </Box>
        </Box>
      </Box>

      {/* Main heading */}
      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: '50px',
        }}
      >
        Available Skills
      </Typography>

      {/* Add Skill Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            borderRadius: '20px',
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0',
            },
          }}
        >
          Add New Skill
        </Button>
      </Box>

      {/* Skills Grid */}
      <Grid container spacing={3}>
        {skills.map((skill) => (
          <Grid item xs={12} sm={6} md={4} key={skill.id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: '10px',
                backgroundColor: skill.bgColor,
                color: skill.color,
              }}
            >
              {iconComponents[skill.icon]}
              <Typography>{skill.name}</Typography>
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
            borderRadius: '15px',
            p: 2,
            minWidth: '400px',
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
        }}
      >
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Skill Name */}
            <TextField
              label="Skill Name"
              fullWidth
              required
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g., React"
            />

            {/* Background Color (via ColorInput) */}
            <Typography variant="body2">Background Color</Typography>
            <ColorInput
              value={newSkill.bgColor}
              onChange={(newValue: string) =>
                setNewSkill((prev) => ({ ...prev, bgColor: newValue }))
              }
            />

            {/* Text Color (via ColorInput) */}
            <Typography variant="body2">Text Color</Typography>
            <ColorInput
              value={newSkill.color}
              onChange={(newValue: string) =>
                setNewSkill((prev) => ({ ...prev, color: newValue }))
              }
            />

            {/* Icon Selection */}
            <FormControl fullWidth required>
              <InputLabel>Icon</InputLabel>
              <Select
                value={newSkill.icon}
                label="Icon *"
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    icon: e.target.value as IconType,
                  })
                }
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

        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSkill}
            variant="contained"
            sx={{
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0',
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
