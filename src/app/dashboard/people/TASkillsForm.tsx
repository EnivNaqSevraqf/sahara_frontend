'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

const predefinedSkills = [
  { label: 'React', color: '#61dafb' },
  { label: 'Node.js', color: '#43853d' },
  { label: 'Python', color: '#3776ab' },
  { label: 'Java', color: '#f89820' },
  { label: 'Spring Boot', color: '#6AAD3D' },
  { label: 'MongoDB', color: '#13aa52' },
  { label: 'Angular', color: '#dd1b16' },
  { label: 'Vue.js', color: '#42b883' },
  { label: 'Django', color: '#092e20' },
  { label: 'Flask', color: '#000000' },
  { label: 'Ruby on Rails', color: '#cc0000' },
  { label: 'ASP.NET', color: '#512bd4' },
  { label: 'Laravel', color: '#ff2d20' },
  { label: 'GraphQL', color: '#e10098' },
  { label: 'TypeScript', color: '#007acc' },
  { label: 'Kotlin', color: '#0095d5' },
  { label: 'Swift', color: '#f05138' },
  { label: 'Go', color: '#00add8' },
  { label: 'Rust', color: '#dea584' },
  { label: 'C++', color: '#00599c' },
  { label: 'C#', color: '#68217a' },
  { label: 'PHP', color: '#777bb4' },
  { label: 'SQL', color: '#e38c00' },
  { label: 'NoSQL', color: '#a6e22e' },
  { label: 'Docker', color: '#2496ed' },
  { label: 'Kubernetes', color: '#326ce5' },
  { label: 'AWS', color: '#ff9900' },
  { label: 'Azure', color: '#0078d4' },
  { label: 'GCP', color: '#4285f4' },
];

const TASkillsForm = () => {
  const { user } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedSkills(event.target.value as string[]);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveSkills = () => {
    setSavingSkills(true);
    setTimeout(() => {
      console.log('Selected Skills:', selectedSkills);
      setSavingSkills(false);
      handleCloseDialog();
    }, 1000);
  };

  return (
    <Box p={3} sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header section */}
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
              <GroupIcon sx={{ fontSize: 50 }} />
            </Box>

            <Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user?.name || 'Skill Management'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Add or update your TA skills
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Skills section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#3f51b5' }}>
            TA Skills
          </Typography>

          <Button
            variant="outlined"
            onClick={handleOpenDialog}
            sx={{
              borderColor: '#3f51b5',
              color: '#3f51b5',
              '&:hover': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
              }
            }}
          >
            Manage Skills
          </Button>
        </Box>
      </Paper>

      {/* Skill Selection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage TA Skills</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel id="skills-select-label">TA Skills</InputLabel>
            <Select
              labelId="skills-select-label"
              id="skills-select"
              multiple
              value={selectedSkills}
              onChange={handleSkillChange}
              input={<OutlinedInput label="TA Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      sx={{
                        backgroundColor: predefinedSkills.find(skill => skill.label === value)?.color,
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {predefinedSkills.map((skill) => (
                <MenuItem key={skill.label} value={skill.label}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      backgroundColor: skill.color,
                      color: '#fff',
                      width: '100%'
                    }}
                  >
                    {skill.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={savingSkills}>Cancel</Button>
          <Button
            onClick={handleSaveSkills}
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
};

export default TASkillsForm;