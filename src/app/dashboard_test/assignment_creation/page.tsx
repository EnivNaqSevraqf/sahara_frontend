'use client';
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  List, 
  ListItem, 
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Edit, Delete, Visibility, FileDownload } from '@mui/icons-material';

// Define Event interface with optional opensAt field
interface Event {
  id: number;
  name: string;
  opensAt: Dayjs | null;  // New optional field
  dueDate: Dayjs;
  maxPoints: number;
  description: string;
  files: File[];
}

const EventCreationApp: React.FC = () => {
  // State for form inputs
  const [name, setName] = useState<string>('');
  const [opensAt, setOpensAt] = useState<Dayjs | null>(null);  // New state for opensAt
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [maxPoints, setMaxPoints] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);

  // State for previous events
  const [events, setEvents] = useState<Event[]>([]);

  // State for details dialog
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  // Handle file input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  // Publish event handler
  const handlePublishEvent = () => {
    // Validate inputs
    if (!name || !dueDate || !maxPoints) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate that opensAt (if provided) is before due date
    if (opensAt && opensAt.isAfter(dueDate)) {
      setIsValidationDialogOpen(true);
      return;
    }

    if (isEditMode && selectedEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { 
              ...event, 
              name, 
              opensAt,  // Add opensAt to update
              dueDate, 
              maxPoints: parseFloat(maxPoints), 
              description,
              files 
            } 
          : event
      ));
      setIsEditMode(false);
      setSelectedEvent(null);
    } else {
      // Create new event
      const newEvent: Event = {
        id: Date.now(), // use timestamp as unique id
        name,
        opensAt,  // Add opensAt to new event
        dueDate,
        maxPoints: parseFloat(maxPoints),
        description,
        files
      };

      // Add to previous events
      setEvents([...events, newEvent]);
    }

    // Reset form
    setName('');
    setOpensAt(null);  // Reset opensAt
    setDueDate(null);
    setMaxPoints('');
    setDescription('');
    setFiles([]);
  };

  // View event details
  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  // Edit event
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setName(event.name);
    setOpensAt(event.opensAt);  // Set opensAt when editing
    setDueDate(event.dueDate);
    setMaxPoints(event.maxPoints.toString());
    setDescription(event.description);
    setFiles(event.files);
    setIsEditMode(true);
  };

  // Delete event
  const handleDeleteEvent = (eventId: number) => {
    setEventToDelete(eventId);
    setIsDeleteConfirmationOpen(true);
  };

  // Confirm delete event
  const confirmDeleteEvent = () => {
    if (eventToDelete !== null) {
      setEvents(events.filter(event => event.id !== eventToDelete));
      setIsDeleteConfirmationOpen(false);
      setEventToDelete(null);
    }
  };

  // Cancel delete
  const cancelDeleteEvent = () => {
    setIsDeleteConfirmationOpen(false);
    setEventToDelete(null);
  };

  // Download file
  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Assignment
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <DatePicker
                  label="Opens At (Optional)"
                  value={opensAt}
                  onChange={(newValue) => setOpensAt(newValue)}
                  slots={{
                    textField: (params) => <TextField fullWidth {...params} />
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <DatePicker
                  label="Enter Due Date"
                  value={dueDate}
                  onChange={(newValue) => setDueDate(newValue)}
                  slots={{
                    textField: (params) => <TextField fullWidth {...params} />
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Enter Maximum Points"
                  type="number"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                >
                  Upload Files
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileChange}
                  />
                </Button>
                {files.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected files: {files.map(file => file.name).join(', ')}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handlePublishEvent}
                >
                  Publish Assignment
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h5" component="h2" gutterBottom>
            Previous Assignments
          </Typography>

          <Paper elevation={3} sx={{ p: 2 }}>
            {events.length === 0 ? (
              <Typography variant="body1">No events created yet</Typography>
            ) : (
              <List>
                {events.map((event, index) => (
                  <ListItem 
                    key={event.id || index} 
                    divider
                    secondaryAction={
                      <>
                        <IconButton 
                          edge="end" 
                          aria-label="view" 
                          sx={{ mr: 1 }}
                          onClick={() => handleViewDetails(event)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          sx={{ mr: 1 }}
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={event.name}
                      secondary={`Opens: ${event.opensAt ? event.opensAt.format('DD/MM/YYYY') : 'N/A'} | Due: ${event.dueDate.format('DD/MM/YYYY')} | Max Points: ${event.maxPoints}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Event Details Dialog */}
          <Dialog 
            open={isDetailsOpen} 
            onClose={() => setIsDetailsOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Event Details</DialogTitle>
            <DialogContent>
              {selectedEvent && (
                <>
                  <Typography variant="h6">Name: {selectedEvent.name}</Typography>
                  {selectedEvent.opensAt && (
                    <Typography variant="body1">Opens At: {selectedEvent.opensAt.format('DD/MM/YYYY')}</Typography>
                  )}
                  <Typography variant="body1">Due Date: {selectedEvent.dueDate.format('DD/MM/YYYY')}</Typography>
                  <Typography variant="body1">Max Points: {selectedEvent.maxPoints}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>Description:</Typography>
                  <Typography variant="body2" paragraph>{selectedEvent.description}</Typography>
                  
                  {selectedEvent.files.length > 0 && (
                    <>
                      <Typography variant="body1" sx={{ mt: 2 }}>Attached Files:</Typography>
                      {selectedEvent.files.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" sx={{ mr: 2 }}>{file.name}</Typography>
                          <Button 
                            startIcon={<FileDownload />}
                            variant="outlined" 
                            size="small"
                            onClick={() => handleDownloadFile(file)}
                          >
                            Download
                          </Button>
                        </Box>
                      ))}
                    </>
                  )}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

           {/* Validation Dialog */}
        <Dialog
          open={isValidationDialogOpen}
          onClose={() => setIsValidationDialogOpen(false)}
        >
          <DialogTitle>Invalid Date</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The opening date must be before or equal to the due date. 
              Please adjust the dates and try again.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsValidationDialogOpen(false)} 
              color="primary"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

         {/* Delete Confirmation Dialog */}
         <Dialog
          open={isDeleteConfirmationOpen}
          onClose={cancelDeleteEvent}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this event? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteEvent} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteEvent} 
              color="secondary" 
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default EventCreationApp;