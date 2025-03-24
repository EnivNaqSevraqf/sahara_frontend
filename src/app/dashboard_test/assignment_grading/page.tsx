'use client';
import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GradeIcon from '@mui/icons-material/Grade';
import CommentIcon from '@mui/icons-material/Comment';

// Define Assignment interface
interface Assignment {
  name: string;
  username: string;
  maxMarks: number;
  submittedFile: File | null;
  grade?: number;
  comments?: string;
}

const AssignmentGradingPage: React.FC = () => {
  // Initial state for assignments with two users
  const [assignments, setAssignments] = useState<Assignment[]>([
    // Divip23 Assignments
    { 
      name: "C++ Assignment", 
      username: "divip23",
      maxMarks: 50, 
      submittedFile: null 
    },
    { 
      name: "Bash Script Assignment", 
      username: "divip23",
      maxMarks: 30, 
      submittedFile: null 
    },
    // Nikhilp23 Assignments
    { 
      name: "C++ Assignment", 
      username: "nikhilp23",
      maxMarks: 50, 
      submittedFile: null 
    },
    { 
      name: "Bash Script Assignment", 
      username: "nikhilp23",
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
            (assignment.name === selectedAssignment.name && 
             assignment.username === selectedAssignment.username)
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
          (assignment.name === selectedAssignment.name && 
           assignment.username === selectedAssignment.username)
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
      {assignments.map((assignment, index) => (
        <Card key={`${assignment.name}-${assignment.username}-${index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Typography variant="h6">{assignment.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Max Marks: {assignment.maxMarks}
                </Typography>
                <Typography variant="caption" color="textPrimary">
                  Student: {assignment.username}
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

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)}>
        <DialogTitle>Grade Assignment</DialogTitle>
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
        <DialogTitle>Assignment Comments</DialogTitle>
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