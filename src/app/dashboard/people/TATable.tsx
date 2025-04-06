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
  CircularProgress
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
  id: number;
  name: string;
  bgColor: string;
  color: string;
  icon?: string;
}

interface TA {
  id: number;
  name: string;
  email: string;
  skills: Skill[];
}

// Skill to icon mapping
const getSkillIcon = (iconName: string): JSX.Element => {
  const iconMap: { [key: string]: JSX.Element } = {
    'javascript': <JavascriptIcon fontSize="small" />,
    'code': <CodeIcon fontSize="small" />,
    'storage': <StorageIcon fontSize="small" />,
    'web': <WebIcon fontSize="small" />,
    'dataObject': <DataObjectIcon fontSize="small" />,
    'integrationInstructions': <IntegrationInstructionsIcon fontSize="small" />
  };
  
  return iconMap[iconName.toLowerCase()] || <CodeIcon fontSize="small" />;
};

const TATable = () => {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filteredTAs, setFilteredTAs] = useState<TA[]>([]);
  const [filterMode, setFilterMode] = useState<'union' | 'intersection'>('union');
  const [loading, setLoading] = useState<boolean>(true);
  const [tas, setTAs] = useState<TA[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch TAs and skills from the backend
  useEffect(() => {
    const fetchTAs = async () => {
      try {
        console.log('Starting TA data fetch...');
        setLoading(true);
        
        // Log the token (only display that it exists for security)
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        console.log('Making fetch request to /tas');
        const response = await fetch('http://localhost:8000/tas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
        
        if (!response.ok) {
          // Try to get the error text
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          throw new Error(`Failed to fetch TAs: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        setTAs(data);
        
        // Extract unique skills from all TAs
        const uniqueSkills = new Map<number, Skill>();
        data.forEach((ta: TA) => {
          console.log('Processing TA:', ta.name);
          ta.skills.forEach(skill => {
            console.log('Processing skill:', skill.name);
            if (!uniqueSkills.has(skill.id)) {
              uniqueSkills.set(skill.id, skill);
            }
          });
        });
        
        setAllSkills(Array.from(uniqueSkills.values()));
        setError(null);
      } catch (err) {
        console.error('Error fetching TAs:', err);
        setError('Failed to load TA data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTAs();
  }, []);
  
  // Filter TAs based on selected skills and filter mode
  useEffect(() => {
    if (selectedSkills.length === 0) {
      setFilteredTAs(tas);
    } else {
      setFilteredTAs(
        tas.filter(ta => {
          const taSkillNames = ta.skills.map(skill => skill.name);
          if (filterMode === 'union') {
            // Union (OR) - TA has at least one of the selected skills
            return selectedSkills.some(skill => taSkillNames.includes(skill));
          } else {
            // Intersection (AND) - TA has all of the selected skills
            return selectedSkills.every(skill => taSkillNames.includes(skill));
          }
        })
      );
    }
  }, [selectedSkills, filterMode, tas]);
  
  // Toggle skill selection
  const toggleSkillFilter = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName)
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
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
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }
  
  // Get all unique skill names for filter options
  const allSkillNames = allSkills.map(skill => skill.name).sort();
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title and action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1F2E6A' }}>
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
          {allSkillNames.map((skillName) => {
            const skill = allSkills.find(s => s.name === skillName);
            return (
              <Chip
                key={skillName}
                label={skillName}
                icon={skill?.icon ? getSkillIcon(skill.icon) : <CodeIcon fontSize="small" />}
                onClick={() => toggleSkillFilter(skillName)}
                sx={{
                  backgroundColor: selectedSkills.includes(skillName) 
                    ? skill?.color || '#1976d2' 
                    : skill?.bgColor || '#e3f2fd',
                  color: selectedSkills.includes(skillName) ? 'white' : skill?.color || '#1976d2',
                  borderRadius: '16px',
                  '&:hover': {
                    backgroundColor: selectedSkills.includes(skillName) 
                      ? skill?.color || '#1976d2' 
                      : skill?.bgColor || '#e3f2fd',
                    opacity: 0.9,
                  },
                  fontWeight: 'bold',
                }}
              />
            );
          })}
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
                  filteredTAs.map((ta, index) => (
                    <TableRow 
                      key={ta.id}
                      hover
                      sx={{ '&:hover': { backgroundColor: '#f0f7ff !important' } }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{ta.name}</TableCell>
                      <TableCell>{ta.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {ta.skills.map((skill) => {
                            return (
                              <Box
                                key={skill.id}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: selectedSkills.includes(skill.name) 
                                    ? `${skill.color}22` // Lighter version with opacity
                                    : skill.bgColor || '#f5f5f5',
                                  color: skill.color || '#757575',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  border: selectedSkills.includes(skill.name) 
                                    ? `1px solid ${skill.color}` 
                                    : 'none',
                                }}
                              >
                                {skill.icon ? getSkillIcon(skill.icon) : <CodeIcon fontSize="small" sx={{ color: skill.color }} />}
                                {skill.name}
                              </Box>
                            );
                          })}
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
            onClick={() => router.push('/dashboard/people/tas/add')}
            sx={{
              backgroundColor: '#1F2E6A',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            ADD TAs
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard/people/tas/skills')}
            sx={{
              backgroundColor: '#1F2E6A',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Add Skills
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default TATable;
