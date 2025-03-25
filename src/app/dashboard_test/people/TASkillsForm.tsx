'use client';
import React, { useState } from 'react';
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
} from '@mui/material';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedSkills(event.target.value as string[]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Selected Skills:', selectedSkills);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        TA Skills Form
      </Typography>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="skills-label">Select Skills</InputLabel>
          <Select
            labelId="skills-label"
            multiple
            value={selectedSkills}
            onChange={handleSkillChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    sx={{ backgroundColor: predefinedSkills.find(skill => skill.label === value)?.color, color: '#fff' }}
                  />
                ))}
              </Box>
            )}
          >
            {predefinedSkills.map((skill) => (
              <MenuItem key={skill.label} value={skill.label}>
                {skill.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#1765c1',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#154a8a',
            },
            px: 2,
            borderRadius: '4px',
            alignSelf: 'center',
          }}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default TASkillsForm;