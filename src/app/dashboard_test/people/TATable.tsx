'use client';
import React, { JSX, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Toolbar,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import JavascriptIcon from '@mui/icons-material/Javascript';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import WebIcon from '@mui/icons-material/Web';
import DataObjectIcon from '@mui/icons-material/DataObject';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import UnionIcon from '@mui/icons-material/CallSplit';
import IntersectionIcon from '@mui/icons-material/CallMerge';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useRouter } from 'next/navigation';  

// Define the type for skillsMap
interface Skill {
  bgColor: string;
  color: string;
  icon: JSX.Element;
}

// Skill to color and icon mapping
const skillsMap: { [key: string]: Skill } = {
  'React': {
    bgColor: '#e3f2fd',  // Light blue - React's brand color
    color: '#1565c0',
    icon: <WebIcon fontSize="small" sx={{ color: '#1565c0' }} />
  },
  'Node.js': {
    bgColor: '#e8f5e9',  // Light green - Node.js brand color
    color: '#2e7d32',
    icon: <JavascriptIcon fontSize="small" sx={{ color: '#2e7d32' }} />
  },
  'Python': {
    bgColor: '#e1f5fe',  // Light blue - Python's brand color
    color: '#0277bd',
    icon: <CodeIcon fontSize="small" sx={{ color: '#0277bd' }} />
  },
  'Java': {
    bgColor: '#fff3e0',  // Light orange - Java's brand color
    color: '#ef6c00',
    icon: <IntegrationInstructionsIcon fontSize="small" sx={{ color: '#ef6c00' }} />
  },
  'Spring Boot': {
    bgColor: '#f1f8e9',  // Light green - Spring's brand color
    color: '#558b2f',
    icon: <DataObjectIcon fontSize="small" sx={{ color: '#558b2f' }} />
  },
  'MongoDB': {
    bgColor: '#e8f5e9',  // Light green - MongoDB's brand color
    color: '#2e7d32',
    icon: <StorageIcon fontSize="small" sx={{ color: '#2e7d32' }} />
  }
};

// Sample TA data with skills
const tas = [
  { 
    id: 1, 
    name: 'Hemang Mohanlal Khatri', 
    email: 'hemangmkhatri@cse.iitk.ac.in',
    skills: ['React', 'Node.js', 'Python']
  },
  { 
    id: 2, 
    name: 'Jeswaanth Gogula', 
    email: 'jeswaanth@cse.iitk.ac.in',
    skills: ['Java', 'Spring Boot', 'MongoDB']
  },
  // Add more sample data as needed
];

interface TA {
  id: number;
  name: string;
  email: string;
  skills: string[];
}

const TATable = () => {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filteredTAs, setFilteredTAs] = useState<TA[]>(tas);
  const [filterMode, setFilterMode] = useState<'union' | 'intersection'>('union');
  
  // Get all unique skills for filter options
  const allSkills = Array.from(new Set(tas.flatMap(ta => ta.skills))).sort();
  
  // Filter TAs based on selected skills and filter mode
  useEffect(() => {
    if (selectedSkills.length === 0) {
      setFilteredTAs(tas);
    } else {
      setFilteredTAs(
        tas.filter(ta => {
          if (filterMode === 'union') {
            // Union (OR) - TA has at least one of the selected skills
            return selectedSkills.some(skill => ta.skills.includes(skill));
          } else {
            // Intersection (AND) - TA has all of the selected skills
            return selectedSkills.every(skill => ta.skills.includes(skill));
          }
        })
      );
    }
  }, [selectedSkills, filterMode]);
  
  // Toggle skill selection
  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Handle filter mode change
  const handleFilterModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'union' | 'intersection' | null,
  ) => {
    if (newMode !== null) {
      setFilterMode(newMode);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title and action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          Teaching Assistants
        </Typography>
      </Box>
      
      {/* Skills filter section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filter by Skills:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Filter Mode:
            </Typography>
            <ToggleButtonGroup
              value={filterMode}
              exclusive
              onChange={handleFilterModeChange}
              aria-label="filter mode"
              size="small"
            >
              <Tooltip title="Union (OR) - TAs with any of the selected skills">
                <ToggleButton value="union" aria-label="union filter">
                  <UnionIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>OR</Typography>
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Intersection (AND) - TAs with all of the selected skills">
                <ToggleButton value="intersection" aria-label="intersection filter">
                  <IntersectionIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>AND</Typography>
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
            <Tooltip title={filterMode === 'union' ? 
              "Union (OR): Shows TAs with ANY of the selected skills" : 
              "Intersection (AND): Shows TAs with ALL of the selected skills"}>
              <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {allSkills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              icon={React.cloneElement(skillsMap[skill]?.icon, {
                sx: { 
                  color: selectedSkills.includes(skill) 
                    ? 'white' 
                    : skillsMap[skill]?.color || '#757575' 
                }
              })}
              onClick={() => toggleSkillFilter(skill)}
              sx={{
                backgroundColor: selectedSkills.includes(skill) 
                  ? skillsMap[skill]?.color 
                  : skillsMap[skill]?.bgColor,
                color: selectedSkills.includes(skill) ? 'white' : skillsMap[skill]?.color,
                borderRadius: '16px',
                '&:hover': {
                  backgroundColor: selectedSkills.includes(skill) 
                    ? skillsMap[skill]?.color 
                    : skillsMap[skill]?.bgColor,
                  opacity: 0.9,
                },
                fontWeight: 'bold',
              }}
            />
          ))}
          {selectedSkills.length > 0 && (
            <Chip
              label="Clear All"
              variant="outlined"
              onClick={() => setSelectedSkills([])}
              sx={{ borderColor: '#1976d2', color: '#1976d2' }}
            />
          )}
        </Box>
      </Paper>

      {/* Table */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Toolbar sx={{ backgroundColor: '#f5f9ff' }}>
              <Typography variant="h6" component="div">
                TA List {selectedSkills.length > 0 && `(Filtered: ${filteredTAs.length} results)`}
              </Typography>
              {selectedSkills.length > 0 && (
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  using {filterMode === 'union' ? 'OR' : 'AND'} filter
                </Typography>
              )}
            </Toolbar>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>S. No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTAs.length > 0 ? (
                  filteredTAs.map((ta) => (
                    <TableRow 
                      key={ta.id}
                      hover
                      sx={{ '&:hover': { backgroundColor: '#f0f7ff !important' } }}
                    >
                      <TableCell>{ta.id}</TableCell>
                      <TableCell>{ta.name}</TableCell>
                      <TableCell>{ta.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {ta.skills.map((skill, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: selectedSkills.includes(skill) 
                                  ? `${skillsMap[skill]?.color}22` // Lighter version with opacity
                                  : skillsMap[skill]?.bgColor || '#f5f5f5',
                                color: skillsMap[skill]?.color || '#757575',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                border: selectedSkills.includes(skill) 
                                  ? `1px solid ${skillsMap[skill]?.color}` 
                                  : 'none',
                              }}
                            >
                              {skillsMap[skill]?.icon}
                              {skill}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No TAs found with the selected skills.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={2} sx={{ minWidth: '200px' }}>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard_test/people/tas/add')}
            sx={{
              backgroundColor: '#1976d2',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            ADD TAs
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard_test/people/tas/skills')}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': { 
                borderColor: '#1565c0', 
                backgroundColor: '#f0f7ff' 
              },
            }}
          >
            TA Skills Form
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard_test/people/tas/pairing')}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': { 
                borderColor: '#1565c0', 
                backgroundColor: '#f0f7ff' 
              },
            }}
          >
            TA-Team Pairing
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default TATable;