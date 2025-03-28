'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TiptapEditor from '@/components/TiptapEditor';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

// Constants for file validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

// TinyMCE API key - Get your own key at https://www.tiny.cloud
const TINYMCE_API_KEY = 'no-api-key';

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
  created_by?: {
    name?: string;
  };
}

interface AnnouncementForm {
  id?: number;
  title: string;
  content: string;
  attachment?: FormAttachment;
}

const AnnouncementPage = () => {
  const searchParams = useSearchParams();
  const expandedId = searchParams.get('expanded');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    title?: boolean;
    content?: boolean;
  }>({});
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    // Check if user is professor from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  useEffect(() => {
    // Set expanded announcement from URL parameter
    if (expandedId) {
      setExpandedAnnouncementId(parseInt(expandedId));
    }
  }, [expandedId]);

  const isProfessor = userRole === 'prof';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/announcements');
      console.log('Announcement data:', response.data);
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
    setFormErrors({});
    setOpenCreateDialog(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementForm({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
    });
    setFormErrors({});
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

  const handleDownload = async (announcement: Announcement) => {
    try {
      const response = await axios.get(`/announcements/${announcement.id}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      });
      
      // Get the filename from the Content-Disposition header or use a default name
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob URL with the correct content type
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
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

  const validateForm = (): boolean => {
    const errors: {
      title?: boolean;
      content?: boolean;
    } = {};
    
    if (!announcementForm.title.trim()) {
      errors.title = true;
    }
    
    if (!announcementForm.content.trim()) {
      errors.content = true;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAnnouncement = async () => {
    if (!validateForm()) {
      return;
    }

    try {
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
    if (!validateForm()) {
      return;
    }

    try {
      if (!announcementForm.id) {
        throw new Error('Announcement ID is missing');
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

  const AnnouncementCard = ({ announcement, onDelete, showDeleteButton }: { announcement: Announcement; onDelete: (id: number) => void; showDeleteButton: boolean }) => {
    console.log('Announcement data:', announcement);
    return (
      <Accordion 
        sx={{ 
          mb: 1, 
          borderRadius: '12px', 
          '&:before': { display: 'none' }, 
          overflow: 'hidden',
          '&.Mui-expanded': {
            borderRadius: '12px',
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          aria-controls={`announcement-${announcement.id}-content`}
          id={`announcement-${announcement.id}-header`}
          sx={{
            backgroundColor: '#033076',
            '&:hover': {
              backgroundColor: '#022555',
            },
            '.MuiAccordionSummary-content': {
              margin: '12px 0',
            },
            borderRadius: '12px',
            '&.Mui-expanded': {
              borderRadius: '12px 12px 0 0',
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            pr: 2 
          }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {announcement.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Posted by {announcement.created_by?.name || `User ${announcement.creator_id}`} on {formatDate(announcement.created_at)}
            </Typography>
            {showDeleteButton && (
              <Box sx={{ position: 'absolute', right: '48px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 1 }}>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(announcement.id);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </Box>
              </Box>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ 
          borderBottomLeftRadius: '12px', 
          borderBottomRightRadius: '12px',
          '&.Mui-expanded': {
            borderRadius: '0 0 12px 12px',
          }
        }}>
          <div 
            className="rich-text-content"
            dangerouslySetInnerHTML={{ 
              __html: announcement.content.replace(
                /href="([^"]*)"/g, 
                (match, url) => {
                  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
                    return `href="${url}" target="_blank" rel="noopener noreferrer"`;
                  }
                  return `href="https://${url}" target="_blank" rel="noopener noreferrer"`;
                }
              )
            }} 
          />

          {announcement.url_name && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AttachFileIcon />}
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/uploads/${announcement.url_name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Attachment
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(announcement)}
              >
                Download
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#033076' }}>
          Announcements
        </Typography>
        {isProfessor && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateAnnouncement}
            sx={{ px: 3, py: 1, borderRadius: '24px', backgroundColor: '#033076', '&:hover': { backgroundColor: '#022555' } }}
          >
            Create Announcement
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'background.default',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No announcements yet
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement.id}>
              <AnnouncementCard
                announcement={announcement}
                onDelete={handleDeleteClick}
                showDeleteButton={isProfessor}
              />
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
            error={formErrors.title}
            helperText={formErrors.title ? "Title is required" : ""}
            sx={{ mb: 2 }}
          />
          
          <TiptapEditor
            content={announcementForm.content}
            onChange={(html) => setAnnouncementForm(prev => ({ ...prev, content: html }))}
            error={formErrors.content}
            label="Announcement Content"
            placeholder="Write your announcement here..."
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
            disabled={isSubmitting}
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
            error={formErrors.title}
            helperText={formErrors.title ? "Title is required" : ""}
            sx={{ mb: 2 }}
          />
          
          <TiptapEditor
            content={announcementForm.content}
            onChange={(html) => setAnnouncementForm(prev => ({ ...prev, content: html }))}
            error={formErrors.content}
            label="Announcement Content"
            placeholder="Write your announcement here..."
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
            disabled={isSubmitting}
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