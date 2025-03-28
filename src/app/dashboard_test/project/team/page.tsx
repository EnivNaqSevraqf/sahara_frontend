'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  TableSortLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import axios from 'axios';
import { currentConfig } from '@/config';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import DataObjectIcon from '@mui/icons-material/DataObject';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import WebIcon from '@mui/icons-material/Web';
import JavascriptIcon from '@mui/icons-material/Javascript';

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface Skill {
  id: number;
  name: string;
  bgColor: string;
  color: string;
  icon: string;
}

type Order = 'asc' | 'desc';
type OrderBy = 'name' | 'email';

// Map of icon strings to icon components
const iconComponents: Record<string, React.ReactNode> = {
  'WebIcon': <WebIcon />,
  'JavascriptIcon': <JavascriptIcon />,
  'CodeIcon': <CodeIcon />,
  'StorageIcon': <StorageIcon />,
  'DataObjectIcon': <DataObjectIcon />,
  'IntegrationInstructionsIcon': <IntegrationInstructionsIcon />
};

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [hasTeam, setHasTeam] = useState(true);
  const [teamSkills, setTeamSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  
  // Sorting states
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('name');

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Try to get the team info from the teams endpoint
        const response = await axios.get(`${currentConfig.apiBaseUrl}/teams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.team_id) {
          setHasTeam(true);
          setTeamId(response.data.team_id);
          setTeamName(response.data.team_name);
          
          // Set team members
          if (response.data.members && response.data.members.length > 0) {
            setTeamMembers(response.data.members);
          } else {
            setTeamMembers([]);
          }

          // Set team skills
          if (response.data.skills && response.data.skills.length > 0) {
            setTeamSkills(response.data.skills);
            setSelectedSkillIds(response.data.skills.map((skill: Skill) => skill.id));
          }

          // Set all available skills
          if (response.data.all_skills && response.data.all_skills.length > 0) {
            setAllSkills(response.data.all_skills);
          }
        } else {
          setHasTeam(false);
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to fetch team information. Please try again later.');
        
        // Fallback to feedback endpoint if the teams endpoint fails
        try {
          const token = localStorage.getItem('token');
          const feedbackResponse = await axios.get(`${currentConfig.apiBaseUrl}/feedback/students`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (feedbackResponse.data.team_id) {
            setHasTeam(true);
            setTeamId(feedbackResponse.data.team_id);
            setTeamName(feedbackResponse.data.team_name);
            
            // Format the team members data
            const members = feedbackResponse.data.members.map((member: any) => ({
              id: member.id,
              name: member.name,
              email: member.email || 'N/A'
            }));
            
            setTeamMembers(members);
            setError(null); // Clear error since we got data from fallback

            // Try to get skills separately
            const skillsResponse = await axios.get(`${currentConfig.apiBaseUrl}/api/teams/${feedbackResponse.data.team_id}/skills`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (skillsResponse.data) {
              setTeamSkills(skillsResponse.data);
              setSelectedSkillIds(skillsResponse.data.map((skill: Skill) => skill.id));
            }

            // Try to get all skills
            const allSkillsResponse = await axios.get(`${currentConfig.apiBaseUrl}/api/skills/`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (allSkillsResponse.data) {
              setAllSkills(allSkillsResponse.data);
            }
          } else {
            setHasTeam(false);
          }
        } catch (err2) {
          console.error('Error fetching fallback data:', err2);
          setHasTeam(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTeamMembers = useMemo(() => {
    return [...teamMembers].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }, [teamMembers, order, orderBy]);

  const handleOpenSkillsDialog = () => {
    setSelectedSkillIds(teamSkills.map(skill => skill.id));
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
    if (!teamId) return;
    
    try {
      setSavingSkills(true);
      const token = localStorage.getItem('token');
      
      // Update team skills
      await axios.put(`${currentConfig.apiBaseUrl}/teams/skills`, 
        selectedSkillIds,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // After successful update, fetch the updated team skills
      const updatedSkillsResponse = await axios.get(`${currentConfig.apiBaseUrl}/api/teams/${teamId}/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (updatedSkillsResponse.data) {
        setTeamSkills(updatedSkillsResponse.data);
      }
      
      handleCloseSkillsDialog();
    } catch (err) {
      console.error('Error updating team skills:', err);
      setError('Failed to update team skills. Please try again later.');
    } finally {
      setSavingSkills(false);
    }
  };

  const renderSkillChip = (skill: Skill) => (
    <Chip
      key={skill.id}
      label={skill.name}
      style={{
        backgroundColor: skill.bgColor || '#f0f0f0',
        color: skill.color || '#000000',
        margin: '4px',
        border: `1px solid ${skill.color || '#000000'}`,
      }}
      icon={iconComponents[skill.icon] ? 
        React.cloneElement(iconComponents[skill.icon] as React.ReactElement, { style: { color: skill.color } }) : 
        undefined
      }
    />
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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

  if (!hasTeam) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="div" sx={{ mb: 2 }}>
              Not Assigned to a Team
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You are not currently assigned to any team. Please contact your instructor or TA if you believe this is an error.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          Team Members
        </Typography>
      </Box>
      
      {/* Team info card */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
            <GroupIcon sx={{ fontSize: 50 }} />
          </Box>
          
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {teamName}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Skills section - separate from header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ color: '#3f51b5' }} />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#3f51b5' }}>
              Team Skills
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenSkillsDialog}
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
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {teamSkills.length > 0 ? (
            teamSkills.map(skill => renderSkillChip(skill))
          ) : (
            <Typography color="text.secondary">
              No skills added yet. Click "Manage Skills" to add skills to your team.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Team Members Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleRequestSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeamMembers.length > 0 ? (
              sortedTeamMembers.map((member) => (
                <TableRow 
                  key={member.id}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#f0f7ff !important' }
                  }}
                >
                  <TableCell component="th" scope="row">
                    {member.name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No team members found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Skill Selection Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseSkillsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Team Skills</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel id="skills-select-label">Team Skills</InputLabel>
            <Select
              labelId="skills-select-label"
              id="skills-select"
              multiple
              value={selectedSkillIds}
              onChange={handleSkillSelectionChange}
              input={<OutlinedInput label="Team Skills" />}
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
                    {iconComponents[skill.icon]}
                    {skill.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Select the skills that best represent your team's expertise. These skills will help TAs better understand your team's capabilities.
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
            {savingSkills ? 'Updating...' : 'Update Skills'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}