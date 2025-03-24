'use client';
import React, { useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// Mock data for testing
const mockAnnouncements = [
  {
    id: 1,
    title: "Test Announcement 1",
    description: {
      content: "This is a test announcement with some content that will be truncated in the list view.",
      author: "Test User 1",
      priority: "high",
      created_at: "2024-03-21T10:00:00Z",
      attachments: [
        {
          name: "document.pdf",
          url: "http://example.com/document.pdf",
          type: "application/pdf"
        },
        {
          name: "image.jpg",
          url: "http://example.com/image.jpg",
          type: "image/jpeg"
        },
        {
          name: "spreadsheet.xlsx",
          url: "http://example.com/spreadsheet.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      ]
    }
  },
  {
    id: 2,
    title: "Test Announcement 2",
    description: {
      content: "Another test announcement with different content and priority level.",
      author: "Test User 2",
      priority: "medium",
      created_at: "2024-03-21T11:00:00Z",
      attachments: [
        {
          name: "presentation.pptx",
          url: "http://example.com/presentation.pptx",
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        }
      ]
    }
  },
  {
    id: 3,
    title: "Test Announcement 3",
    description: {
      content: "A third test announcement with low priority and more content to test the truncation.",
      author: "Test User 3",
      priority: "low",
      created_at: "2024-03-21T12:00:00Z"
    }
  }
];

// Mock function to get user role
const getUserRole = () => {
  // Replace this with your actual role checking logic
  return 'student';
};

interface Attachment {
  file: File;
  name: string;
}

export default function AnnouncementPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium',
    attachments: [] as Attachment[]
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });
  const isAdmin = getUserRole() === 'admin';

  const handleAnnouncementClick = (announcementId: number) => {
    router.push(`/announcement/${announcementId}`);
  };

  const handleCreateAnnouncement = () => {
    setOpenCreateDialog(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        file,
        name: file.name
      }));
      setNewAnnouncement(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setNewAnnouncement(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
      attachments: []
    });
  };

  const handleSaveAnnouncement = async () => {
    // Validate inputs
    if (!newAnnouncement.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title cannot be empty',
        severity: 'error'
      });
      return;
    }

    if (!newAnnouncement.content.trim()) {
      setSnackbar({
        open: true,
        message: 'Content cannot be empty',
        severity: 'error'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('content', newAnnouncement.content);
      formData.append('priority', newAnnouncement.priority);
      
      // Append each attachment
      newAnnouncement.attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });

      const response = await fetch('http://localhost:8000/api/create_announcement', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newAnnouncementData = await response.json();
        setAnnouncements([newAnnouncementData, ...announcements]);
        handleCloseCreateDialog();
        setSnackbar({
          open: true,
          message: 'Announcement created successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create announcement. Please check if the backend server is running.',
        severity: 'error'
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      // First check if the backend server is running
      const serverCheck = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);

      if (!serverCheck) {
        // If server is not running, delete locally
        setAnnouncements(announcements.filter(announcement => announcement.id !== announcementId));
        setSnackbar({
          open: true,
          message: 'Backend server not available. Deleted announcement in offline mode.',
          severity: 'warning'
        });
        return;
      }

      // If server is running, proceed with the actual API call
      const response = await fetch(`http://localhost:8000/api/delete_announcement/${announcementId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnouncements(announcements.filter(announcement => announcement.id !== announcementId));
        setSnackbar({
          open: true,
          message: 'Announcement deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete announcement. Please check if the backend server is running.',
        severity: 'error'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          mb={4}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          <Box display="flex" alignItems="center">
            <AnnouncementIcon sx={{ fontSize: 40, mr: 2, color: 'white' }} />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Announcements
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAnnouncement}
              sx={{
                backgroundColor: 'white',
                color: '#2196F3',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Create Announcement
            </Button>
          )}
        </Box>
        
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={`announcement-${announcement.id}`}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{announcement.title}</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="body2" 
                        color={getPriorityColor(announcement.description.priority)}
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          bgcolor: `${getPriorityColor(announcement.description.priority)}.light`,
                          color: `${getPriorityColor(announcement.description.priority)}.dark`
                        }}
                      >
                        {announcement.description.priority.toUpperCase()}
                      </Typography>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {announcement.description.author}
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Posted On"
                      value={dayjs(announcement.description.created_at)}
                      readOnly
                    />
                  </LocalizationProvider>
                  <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                    {announcement.description.content.substring(0, 150)}...
                  </Typography>
                  {announcement.description.attachments && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFileIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="primary">
                        {announcement.description.attachments.map(attachment => attachment.name).join(', ')}
                      </Typography>
                    </Box>
                  )}
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAnnouncementClick(announcement.id)}
                    >
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create Announcement Dialog */}
        <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              required
              error={!newAnnouncement.title.trim()}
              helperText={!newAnnouncement.title.trim() ? "Title is required" : ""}
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={4}
              required
              error={!newAnnouncement.content.trim()}
              helperText={!newAnnouncement.content.trim() ? "Content is required" : ""}
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            />
            <TextField
              select
              margin="dense"
              label="Priority"
              fullWidth
              value={newAnnouncement.priority}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </TextField>
            {/* File Attachment Section */}
            <Box sx={{ mt: 2 }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="attachment-input"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="attachment-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                >
                  Attach Files
                </Button>
              </label>
              {newAnnouncement.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attached Files:
                  </Typography>
                  {newAnnouncement.attachments.map((attachment, index) => (
                    <Box 
                      key={index}
                      display="flex" 
                      alignItems="center" 
                      gap={1}
                      sx={{ 
                        mb: 1,
                        p: 1,
                        bgcolor: 'grey.100',
                        borderRadius: 1
                      }}
                    >
                      <AttachFileIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {attachment.name}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveAnnouncement} 
              variant="contained" 
              color="primary"
              disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
