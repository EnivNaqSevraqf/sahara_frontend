'use client';
import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Paper, CircularProgress } from "@mui/material";
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
import axios from 'axios';

interface FormAttachment {
  file: File;
  name: string;
}

interface ApiAttachment {
  url: string;
  type: string;
}

interface ContentDetails {
  date?: string;
  time?: string;
  venue?: string;
}

interface AnnouncementContent {
  tags: string[];
  details?: ContentDetails;
  attachments: ApiAttachment[];
  description: string;
}

interface Announcement {
  id: number;
  creator_id: number;
  created_at: string;
  title: string;
  content: AnnouncementContent;
  url_name?: string;
}

// Mock data for testing
const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    creator_id: 1,
    created_at: "2024-03-21 10:00:00",
    title: "Test Announcement 1",
    content: {
      tags: ["general", "important"],
      details: {
        date: "2024-03-25",
        time: "14:00",
        venue: "Main Hall"
      },
      attachments: [
        {
          url: "http://example.com/document.pdf",
          type: "document"
        },
        {
          url: "http://example.com/image.jpg",
          type: "image"
        }
      ],
      description: "This is a test announcement with some content that will be truncated in the list view."
    }
  },
  {
    id: 2,
    creator_id: 2,
    created_at: "2024-03-21 11:00:00",
    title: "Test Announcement 2",
    content: {
      tags: ["event", "workshop"],
      details: {
        date: "2024-03-26",
        time: "15:00",
        venue: "Workshop Room"
      },
      attachments: [
        {
          url: "http://example.com/presentation.pptx",
          type: "presentation"
        }
      ],
      description: "Another test announcement with different content and priority level."
    }
  },
  {
    id: 3,
    creator_id: 3,
    created_at: "2024-03-21 12:00:00",
    title: "Test Announcement 3",
    content: {
      tags: ["notice"],
      attachments: [],
      description: "A third test announcement with more content to test the truncation."
    }
  }
];

// Mock function to get user role
const getUserRole = () => {
  // Replace this with your actual role checking logic
  return 'admin';
};

export default function AnnouncementPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    content: {
      tags: string[];
      details?: ContentDetails;
      attachments: FormAttachment[];
      description: string;
    };
  }>({
    title: '',
    content: {
      tags: [],
      details: {
        date: '',
        time: '',
        venue: ''
      },
      attachments: [],
      description: ''
    }
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });
  const isAdmin = getUserRole() === 'admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnnouncementClick = (announcementId: number) => {
    router.push(`/announcement/${announcementId}`);
  };

  const handleOpenCreateDialog = () => {
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
        content: {
          ...prev.content,
          attachments: [...prev.content.attachments, ...newAttachments]
        }
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setNewAnnouncement(prev => ({
      ...prev,
      content: {
        ...prev.content,
        attachments: prev.content.attachments.filter((_, i) => i !== index)
      }
    }));
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewAnnouncement({
      title: '',
      content: {
        tags: [],
        details: {
          date: '',
          time: '',
          venue: ''
        },
        attachments: [],
        description: ''
      }
    });
  };

  const handleSaveAnnouncement = async () => {
    try {
      // Convert attachments to match API format
      const attachmentPromises = newAnnouncement.content.attachments.map(async (attachment) => {
        return new Promise<ApiAttachment>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              url: reader.result as string,
              type: attachment.file.type
            });
          };
          reader.readAsDataURL(attachment.file);
        });
      });

      const attachments = await Promise.all(attachmentPromises);

      // Create the announcement object with only title and content
      const announcementData = {
        title: newAnnouncement.title,
        content: {
          tags: newAnnouncement.content.tags,
          details: newAnnouncement.content.details,
          attachments: attachments,
          description: newAnnouncement.content.description
        }
      };
      

      const response = await axios.post('http://localhost:8000/announcements', announcementData, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        setOpenCreateDialog(false);
        setSnackbar({ open: true, message: 'Announcement created successfully', severity: 'success' });
        fetchAnnouncements();
      } else {
        throw new Error(response.data?.message || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      setSnackbar({ open: true, message: 'Failed to create announcement', severity: 'error' });
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:8000/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // If server is not available, use mock data
      setAnnouncements(mockAnnouncements);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      const response = await axios.delete(`http://localhost:8000/announcements/${announcementId}`);
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Announcement deleted successfully', severity: 'success' });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setSnackbar({ open: true, message: 'Failed to delete announcement', severity: 'error' });
    }
  };

  const getTagColor = (tag: string | undefined) => {
    if (!tag) return 'primary';
    
    switch (tag.toLowerCase()) {
      case 'important':
        return 'error';
      case 'event':
        return 'warning';
      case 'notice':
        return 'info';
      case 'workshop':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Admin Controls */}
      {isAdmin && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Announcement
          </Button>
        </Box>
      )}

      {/* Announcements Grid */}
      <Grid container spacing={3}>
        {announcements.map((announcement) => (
          <Grid item xs={12} md={6} key={announcement.id}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{announcement.title}</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography 
                    variant="body2" 
                    color={getTagColor(announcement.content?.tags?.[0])}
                    sx={{ 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1, 
                      bgcolor: `${getTagColor(announcement.content?.tags?.[0])}.light`,
                      color: `${getTagColor(announcement.content?.tags?.[0])}.dark`
                    }}
                  >
                    {(announcement.content?.tags?.[0] || 'general').toUpperCase()}
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
                By {announcement.creator_id}
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Posted On"
                  value={dayjs(announcement.created_at)}
                  readOnly
                />
              </LocalizationProvider>
              <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                {(announcement.content?.description || '').substring(0, 150)}
                {announcement.content?.description && announcement.content.description.length > 150 ? '...' : ''}
              </Typography>
              {announcement.content?.attachments?.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }}
                  >
                    {announcement.content.attachments[0].url}
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
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Create Announcement Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={newAnnouncement.content.tags.join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
              setNewAnnouncement({
                ...newAnnouncement,
                content: {
                  ...newAnnouncement.content,
                  tags
                }
              });
            }}
            helperText="Enter tags separated by commas (e.g., important, general, event)"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={newAnnouncement.content.description}
            onChange={(e) => setNewAnnouncement({
              ...newAnnouncement,
              content: {
                ...newAnnouncement.content,
                description: e.target.value
              }
            })}
            sx={{ mb: 2 }}
          />
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
            {newAnnouncement.content.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attached Files:
                </Typography>
                {newAnnouncement.content.attachments.map((attachment, index) => (
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
            disabled={!newAnnouncement.title.trim() || !newAnnouncement.content.description.trim()}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
  );
}
