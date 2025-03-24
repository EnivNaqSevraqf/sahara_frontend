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
import {
  Javascript as JavascriptIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Web as WebIcon,
  DataObject as DataObjectIcon,
  IntegrationInstructions as IntegrationInstructionsIcon,
} from '@mui/icons-material';

// Define the Skill type first
type Skill = {
  id: number;
  name: string;
  bgColor: string;
  color: string;
  icon: "WebIcon" | "JavascriptIcon" | "CodeIcon" | "StorageIcon" | "DataObjectIcon" | "IntegrationInstructionsIcon";
};

// Pre-defined skills data
const initialSkills: Skill[] = [
  {
    id: 1,
    name: 'React',
    bgColor: '#61dafb',
    color: '#000000',
    icon: 'WebIcon'
  },
  {
    id: 2,
    name: 'Node.js',
    bgColor: '#43853d',
    color: '#ffffff',
    icon: 'JavascriptIcon'
  },
  {
    id: 3,
    name: 'Python',
    bgColor: '#3776ab',
    color: '#ffffff',
    icon: 'CodeIcon'
  },
  {
    id: 4,
    name: 'Java',
    bgColor: '#f89820',
    color: '#ffffff',
    icon: 'IntegrationInstructionsIcon'
  },
  {
    id: 5,
    name: 'Spring Boot',
    bgColor: '#6AAD3D',
    color: '#ffffff',
    icon: 'DataObjectIcon'
  },
  {
    id: 6,
    name: 'MongoDB',
    bgColor: '#13aa52',
    color: '#ffffff',
    icon: 'StorageIcon'
  }
];

const iconComponents = {
  WebIcon: <WebIcon />,
  JavascriptIcon: <JavascriptIcon />,
  CodeIcon: <CodeIcon />,
  StorageIcon: <StorageIcon />,
  DataObjectIcon: <DataObjectIcon />,
  IntegrationInstructionsIcon: <IntegrationInstructionsIcon />
};

const SkillsPage = () => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [open, setOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Skill>({
    id: 0,
    name: '',
    bgColor: '',
    color: '',
    icon: 'WebIcon'
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddSkill = () => {
    if (newSkill.name && newSkill.bgColor && newSkill.color && newSkill.icon) {
      const skillToAdd: Skill = {
        ...newSkill,
        id: skills.length + 1
      };
      setSkills([...skills, skillToAdd]);
      setNewSkill({
        id: 0,
        name: '',
        bgColor: '',
        color: '',
        icon: 'WebIcon'
      });
      handleClose();
    }
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
          sx={{ borderRadius: '20px' }}
        >
          Add New Skill
        </Button>
      </Box>

      {/* Skills Grid */}
      <Grid container spacing={3}>
        {skills.map((skill, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }
        }}
      >
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Skill Name"
              fullWidth
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            />
            <TextField
              label="Background Color (hex)"
              fullWidth
              value={newSkill.bgColor}
              onChange={(e) => setNewSkill({ ...newSkill, bgColor: e.target.value })}
            />
            <TextField
              label="Text Color (hex)"
              fullWidth
              value={newSkill.color}
              onChange={(e) => setNewSkill({ ...newSkill, color: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Icon</InputLabel>
              <Select
                value={newSkill.icon}
                label="Icon"
                onChange={(e) => setNewSkill({ ...newSkill, icon: e.target.value as keyof typeof iconComponents })}
              >
                <MenuItem value="WebIcon">Web Icon</MenuItem>
                <MenuItem value="JavascriptIcon">JavaScript Icon</MenuItem>
                <MenuItem value="CodeIcon">Code Icon</MenuItem>
                <MenuItem value="StorageIcon">Storage Icon</MenuItem>
                <MenuItem value="DataObjectIcon">Data Object Icon</MenuItem>
                <MenuItem value="IntegrationInstructionsIcon">Integration Icon</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddSkill} variant="contained">
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsPage; 