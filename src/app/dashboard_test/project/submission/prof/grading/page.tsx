'use client';
import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GradeIcon from '@mui/icons-material/Grade';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

// Define Assignment interface with new id attribute
interface Assignment {
  id: number;  
  name: string;
  teamname: string;
  maxMarks: number;
  submittedFile: File | null;
  grade?: number;
  comments?: string;
}

const AssignmentGradingPage: React.FC = () => {
  // Initial state for assignments with unique ids
  const [assignments, setAssignments] = useState<Assignment[]>([
    // C++ Assignment with different users
    { 
      id: 1,
      name: "Design Document", 
      teamname: "Ravi and friends",
      maxMarks: 50, 
      submittedFile: null 
    },
    { 
      id: 2,
      name: "Implementation Document", 
      teamname: "Happy Coders",
      maxMarks: 50, 
      submittedFile: null 
    },
    // Bash Script Assignment with different users
    { 
      id: 1,
      name: "Design Document", 
      teamname: "Happy Coders",
      maxMarks: 30, 
      submittedFile: null 
    },
    { 
      id: 2,
      name: "Implementation Document", 
      teamname: "Ravi and friends",
      maxMarks: 30, 
      submittedFile: null 
    }
  ]);

  // State for dialogs
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [commentsInput, setCommentsInput] = useState<string>('');
  
  // New state for username search
  const [usernameSearch, setUsernameSearch] = useState<string>('');

  // Group assignments by their ID, filtered by username search
  const groupedAssignments = useMemo(() => {
    const filteredAssignments = assignments.filter(a => 
      a.teamname.toLowerCase().includes(usernameSearch.toLowerCase())
    );

    return filteredAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.id]) {
        acc[assignment.id] = [];
      }
      acc[assignment.id].push(assignment);
      return acc;
    }, {} as Record<number, Assignment[]>);
  }, [assignments, usernameSearch]);

  // Handler for opening grade dialog
  const handleOpenGradeDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setGradeInput(assignment.grade?.toString() || '');
    setGradeDialogOpen(true);
  };

  // Handler for saving grade
  const handleSaveGrade = () => {
    if (selectedAssignment) {
      const gradeValue = parseFloat(gradeInput);
      
      // Validate grade input
      if (!isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= selectedAssignment.maxMarks) {
        setAssignments(prev => 
          prev.map(assignment => 
            (assignment.id === selectedAssignment.id && 
             assignment.teamname === selectedAssignment.teamname)
              ? { ...assignment, grade: gradeValue } 
              : assignment
          )
        );
        setGradeDialogOpen(false);
      } else {
        alert(`Please enter a valid grade between 0 and ${selectedAssignment.maxMarks}`);
      }
    }
  };

  // Handler for opening comments dialog
  const handleOpenCommentsDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCommentsInput(assignment.comments || '');
    setCommentsDialogOpen(true);
  };

  // Handler for saving comments
  const handleSaveComments = () => {
    if (selectedAssignment) {
      setAssignments(prev => 
        prev.map(assignment => 
          (assignment.id === selectedAssignment.id && 
           assignment.teamname === selectedAssignment.teamname)
            ? { ...assignment, comments: commentsInput } 
            : assignment
        )
      );
      setCommentsDialogOpen(false);
    }
  };

  // Simulated file download handler
  const handleDownload = () => {
    // In a real application, this would download the actual file
    alert('File download simulated');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Username Search TextField */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search by Team Name"
          value={usernameSearch}
          onChange={(e) => setUsernameSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Enter Team Name to filter assignments"
        />
      </Box>

      {/* If no assignments match the search */}
      {Object.keys(groupedAssignments).length === 0 && (
        <Typography variant="body1" color="textSecondary" align="center">
          No assignments found for the searched username.
        </Typography>
      )}

      {Object.entries(groupedAssignments).map(([assignmentId, assignmentGroup]) => (
        <Accordion key={assignmentId}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${assignmentId}-content`}
            id={`panel-${assignmentId}-header`}
          >
            <Typography variant="h6">
              {assignmentGroup[0].name} 
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {assignmentGroup.map((assignment, index) => (
                <Card key={`${assignment.name}-${assignment.teamname}-${index}`} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6">{assignment.teamname}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Max Marks: {assignment.maxMarks}
                        </Typography>
                    
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Box display="flex" gap={2}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                          >
                            Download Submission
                          </Button>

                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<GradeIcon />}
                            onClick={() => handleOpenGradeDialog(assignment)}
                          >
                            Grade (Current: {assignment.grade ?? 'Not Graded'})
                          </Button>

                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<CommentIcon />}
                            onClick={() => handleOpenCommentsDialog(assignment)}
                          >
                            Comments
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)}>
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Grade"
            fullWidth
            type="number"
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
            inputProps={{
              min: 0,
              max: selectedAssignment?.maxMarks
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveGrade}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={commentsDialogOpen} onClose={() => setCommentsDialogOpen(false)}>
        <DialogTitle>Submission Comments</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comments"
            fullWidth
            multiline
            rows={4}
            value={commentsInput}
            onChange={(e) => setCommentsInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveComments}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentGradingPage;