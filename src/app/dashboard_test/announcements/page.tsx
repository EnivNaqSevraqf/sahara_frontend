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
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

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
  url_name: string | null;
  creator_id: number;
}

interface AnnouncementForm {
  id?: number;
  title: string;
  content: string;
  attachment?: FormAttachment;
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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: '',
    content: '',
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
    setAnnouncementForm({
      title: '',
      content: '',
    });
    setOpenCreateDialog(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementForm({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
    });
    setOpenEditDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
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

      setAnnouncementForm(prev => ({
        ...prev,
        attachment: { file, name: file.name }
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
      if (!announcementForm.title || !announcementForm.content) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', announcementForm.title);
      formData.append('description', announcementForm.content);
      if (announcementForm.attachment) {
        formData.append('file', announcementForm.attachment.file);
      }

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
        setAnnouncementForm({
          title: '',
          content: '',
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

  const handleUpdateAnnouncement = async () => {
    try {
      if (!announcementForm.id || !announcementForm.title || !announcementForm.content) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', announcementForm.title);
      formData.append('description', announcementForm.content);
      if (announcementForm.attachment) {
        formData.append('file', announcementForm.attachment.file);
      }

      const response = await axios.put(`/announcements/${announcementForm.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 202) {
        setSnackbar({
          open: true,
          message: 'Announcement updated successfully',
          severity: 'success'
        });
        setOpenEditDialog(false);
        setAnnouncementForm({
          title: '',
          content: '',
        });
        fetchAnnouncements();
      }
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      let errorMessage = 'Error updating announcement';
      
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
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement.id}>
              <Card sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 1, 
                boxShadow: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-3px)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                    <Box>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleEditAnnouncement(announcement)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteClick(announcement.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
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
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(announcement.id)}
                        sx={{
                          ml: 2,
                          textTransform: 'none'
                        }}
                      >
                        Download Attachment
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Announcement Dialog */}
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
            value={announcementForm.title}
            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={6}
            required
            value={announcementForm.content}
            onChange={(e) => setAnnouncementForm(prev => ({
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
                  color={announcementForm.attachment ? "success" : "primary"}
                  sx={{ mb: 1 }}
                >
                  {announcementForm.attachment ? 'Change File' : 'Upload File (Optional)'}
                </Button>
              </label>
              {announcementForm.attachment ? (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AttachFileIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main">
                    {announcementForm.attachment.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setAnnouncementForm(prev => ({ ...prev, attachment: undefined }))}
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
            disabled={!announcementForm.title || !announcementForm.content || isSubmitting}
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Edit Announcement</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Title"
            fullWidth
            required
            value={announcementForm.title}
            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={6}
            required
            value={announcementForm.content}
            onChange={(e) => setAnnouncementForm(prev => ({
              ...prev,
              content: e.target.value
            }))}
            sx={{ mb: 3 }}
          />
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              id="file-upload-edit"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept={ALLOWED_FILE_TYPES.join(',')}
            />
            <Box sx={{ 
              p: 3, 
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              textAlign: 'center',
              bgcolor: 'background.paper'
            }}>
              <label htmlFor="file-upload-edit">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  color={announcementForm.attachment ? "success" : "primary"}
                  sx={{ mb: 1 }}
                >
                  {announcementForm.attachment ? 'Change File' : 'Upload New File (Optional)'}
                </Button>
              </label>
              {announcementForm.attachment ? (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AttachFileIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main">
                    {announcementForm.attachment.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setAnnouncementForm(prev => ({ ...prev, attachment: undefined }))}
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
          <Button onClick={handleCloseEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateAnnouncement} 
            variant="contained" 
            color="primary"
            disabled={!announcementForm.title || !announcementForm.content || isSubmitting}
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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