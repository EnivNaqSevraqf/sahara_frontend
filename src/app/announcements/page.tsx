'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

// Constants for file validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

interface FormAttachment {
  file: File;
  name: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  url_name: string;
  creator_id: number;
}

interface NewAnnouncementForm {
  title: string;
  content: string;
  attachments: FormAttachment[];
}

// Mock function to get user role
const getUserRole = () => {
  // Replace this with your actual role checking logic
  return 'admin';
};

const AnnouncementPage: React.FC = () => {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncementForm>({
    title: '',
    content: '',
    attachments: []
  });
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const isAdmin = getUserRole() === 'admin';
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/announcements');
      setAnnouncements(response.data);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch announcements',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewAnnouncement({
      title: '',
      content: '',
      attachments: []
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setSnackbar({
          open: true,
          message: 'File size must be less than 50MB',
          severity: 'error'
        });
        return;
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Invalid file type. Please upload a PDF, Word document, or image (JPEG/PNG)',
          severity: 'error'
        });
        return;
      }

      setNewAnnouncement(prev => ({
        ...prev,
        attachments: [{ file, name: file.name }]
      }));
    }
  };

  const handleDownload = async (announcementId: number) => {
    try {
      const response = await axios.get(`/announcements/${announcementId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error downloading file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.attachments?.length) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields and upload a file',
          severity: 'error'
        });
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('description', newAnnouncement.content);
      formData.append('file', newAnnouncement.attachments[0].file);

      const response = await axios.post('/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Announcement created successfully',
          severity: 'success'
        });
        setOpenCreateDialog(false);
        setNewAnnouncement({
          title: '',
          content: '',
          attachments: []
        });
        fetchAnnouncements();
      }
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      let errorMessage = 'Error creating announcement';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedAnnouncementId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncementId) return;

    try {
      setIsSubmitting(true);
      await axios.delete(`/announcements/${selectedAnnouncementId}`);
      setSnackbar({
        open: true,
        message: 'Announcement deleted successfully',
        severity: 'success'
      });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete announcement',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setOpenDeleteDialog(false);
      setSelectedAnnouncementId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Announcements
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateAnnouncement}
          sx={{ px: 3, py: 1 }}
        >
          Create Announcement
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          {announcements.map((announcement, index) => (
            <React.Fragment key={announcement.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  py: 3,
                  flexDirection: 'column',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 500,
                      color: 'primary.main',
                      mb: 1
                    }}
                  >
                    {announcement.title}
                  </Typography>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleDeleteClick(announcement.id)}
                    sx={{ ml: 2, mt: -1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap',
                    mb: 2,
                    width: '100%'
                  }}
                >
                  {announcement.content}
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    Posted on: {formatDate(announcement.created_at)}
                  </Typography>

                  {announcement.url_name && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => handleDownload(announcement.id)}
                      sx={{
                        ml: 2,
                        textTransform: 'none'
                      }}
                    >
                      {announcement.url_name}
                    </Button>
                  )}
                </Box>
              </ListItem>
              {index < announcements.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Create New Announcement</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Title"
            fullWidth
            required
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={6}
            required
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement(prev => ({
              ...prev,
              content: e.target.value
            }))}
            sx={{ mb: 3 }}
          />
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept={ALLOWED_FILE_TYPES.join(',')}
              required
            />
            <Box sx={{ 
              p: 3, 
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              textAlign: 'center',
              bgcolor: 'background.paper'
            }}>
              <label htmlFor="file-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  color={newAnnouncement.attachments && newAnnouncement.attachments.length > 0 ? "success" : "primary"}
                  sx={{ mb: 1 }}
                >
                  {newAnnouncement.attachments && newAnnouncement.attachments.length > 0 
                    ? 'Change File' 
                    : 'Upload File *'}
                </Button>
              </label>
              {newAnnouncement.attachments && newAnnouncement.attachments.length > 0 ? (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AttachFileIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main">
                    {newAnnouncement.attachments[0].name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setNewAnnouncement(prev => ({ ...prev, attachments: [] }))}
                    sx={{ ml: 1 }}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Accepted files: PDF, Word, or Image (Max size: 50MB)
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCreateDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAnnouncement} 
            variant="contained" 
            color="primary"
            disabled={!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.attachments?.length || isSubmitting}
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnnouncementPage; 