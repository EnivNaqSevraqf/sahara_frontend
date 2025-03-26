'use client';
import React, { useState, useEffect } from 'react';
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
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Edit, Delete, Visibility, FileDownload } from '@mui/icons-material';
import axios from 'axios';

// Configure axios base URL to handle different ports
axios.defaults.baseURL = 'http://localhost:8000';

// Define Submittable interface with fields matching the backend model
interface Submittable {
  id: number;
  title: string;
  opens_at: string | null;
  deadline: string;
  description: string;
  file_url?: string;
  original_filename?: string;
  created_at?: string;
}

const SubmittableCreationApp: React.FC = () => {
  // State for form inputs
  const [title, setTitle] = useState<string>('');
  const [opensAt, setOpensAt] = useState<Dayjs | null>(null);
  const [deadline, setDeadline] = useState<Dayjs | null>(null);
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // State for existing submittables
  const [submittables, setSubmittables] = useState<Submittable[]>([]);

  // State for UI controls
  const [selectedSubmittable, setSelectedSubmittable] = useState<Submittable | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [submittableToDelete, setSubmittableToDelete] = useState<number | null>(null);
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  // Add state for page mode 
  const [pageMode, setPageMode] = useState<'create' | 'update'>('create');

  // Get token from localStorage for authentication
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  // Fetch existing submittables on component mount
  useEffect(() => {
    fetchSubmittables();
  }, []);

  const fetchSubmittables = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if token exists before making the API call
      if (!token) {
        showSnackbar('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      console.log('Fetching submittables...');
      console.log('Token:', token); // Log token for debugging
      
      const response = await axios.get("http://localhost:8000/submittables/", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });
      
      console.log('Response:', response.data);
      
      if (response.data) {
        // Combine all categories of submittables
        const allSubmittables = [
          ...(response.data.upcoming || []),
          ...(response.data.open || []),
          ...(response.data.closed || [])
        ];
        
        setSubmittables(allSubmittables);
      } else {
        setSubmittables([]);
      }
    } catch (error: any) {
      console.error('Error fetching submittables:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error.response?.data?.detail || 'Failed to load submittables';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file input with preview support
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Create object URL for preview if file type supports it
      const fileType = selectedFile.type;
      if (fileType.startsWith('image/') || 
          fileType === 'application/pdf' || 
          fileType.includes('text/')) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setFilePreviewUrl(objectUrl);
      } else {
        setFilePreviewUrl(null);
      }

      // If in update mode, show a notification about file replacement
      if (isEditMode && selectedSubmittable) {
        showSnackbar(`File "${selectedFile.name}" will replace the current reference file upon update.`, 'info');
      }
    }
  };

  // Function to clear selected file
  const handleClearFile = () => {
    if (file) {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      setFile(null);
      setFilePreviewUrl(null);
      
      if (isEditMode && selectedSubmittable?.original_filename) {
        showSnackbar(`Keeping the original file: ${selectedSubmittable.original_filename}`, 'info');
      }
    }
  };

  // Preview uploaded file
  const previewFile = () => {
    if (!file) return;
    
    if (filePreviewUrl) {
      window.open(filePreviewUrl, '_blank');
    } else {
      showSnackbar('This file type cannot be previewed before upload', 'info');
    }
  };
  
  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Publish submittable handler
  const handlePublishSubmittable = async () => {
    // Validate inputs
    if (!title || !deadline || !description) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    // Validate file is selected
    if (!file && !isEditMode) {
      showSnackbar('Please select a reference file', 'error');
      return;
    }

    // Validate that opensAt (if provided) is before deadline
    if (opensAt && deadline && opensAt.isAfter(deadline)) {
      setIsValidationDialogOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }
      
      // Create FormData object to send file and data
      const formData = new FormData();
      
      // Append each field directly to FormData - now matches the updated backend API
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline!.toISOString());
      
      if (opensAt) {
        formData.append('opens_at', opensAt.toISOString());
      }
      
      // Add the file
      if (file) {
        formData.append('file', file);
      }

      // Log what's being sent for debugging
      console.log("Form data being sent:");
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]}`);
      }

      try {
        let response;
        
        if (isEditMode && selectedSubmittable) {
          // Update existing submittable
          response = await axios.put(
            `http://localhost:8000/submittables/${selectedSubmittable.id}`, 
            formData, 
            {
              headers: {
                'Authorization': `Bearer ${token}`
                // Let browser set correct Content-Type with boundary
              }
            }
          );
          showSnackbar('Submittable updated successfully', 'success');
        } else {
          // Create new submittable
          response = await axios.post(
            "http://localhost:8000/submittables/create", 
            formData, 
            {
              headers: {
                'Authorization': `Bearer ${token}`
                // Let browser set correct Content-Type with boundary
              }
            }
          );
          showSnackbar('Submittable created successfully', 'success');
        }

        console.log("API response:", response.data);
        
        // Reset form and refresh submittables list
        resetForm();
        fetchSubmittables();
      } catch (requestError: any) {
        // Enhanced error logging for better debugging
        console.error('API request error:', {
          message: requestError.message,
          status: requestError.response?.status,
          statusText: requestError.response?.statusText,
          responseData: requestError.response?.data,
          validationErrors: requestError.response?.data?.detail
        });
        
        let errorMessage = 'Failed to save submittable';
        
        // Handle validation errors from FastAPI
        if (requestError.response?.status === 422 && requestError.response.data?.detail) {
          // For FastAPI validation errors which come as an array
          if (Array.isArray(requestError.response.data.detail)) {
            const errors = requestError.response.data.detail.map(err => 
              `${err.loc.join('.')} - ${err.msg}`
            ).join('; ');
            errorMessage = `Validation error: ${errors}`;
          } else {
            errorMessage = `Validation error: ${requestError.response.data.detail}`;
          }
        } else if (requestError.response?.data?.detail) {
          errorMessage = requestError.response.data.detail;
        }
        
        showSnackbar(errorMessage, 'error');
      }
      
    } catch (error) {
      // This is a fallback for any other errors that might occur
      console.error('Error in submit handler:', error);
      showSnackbar('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setOpensAt(null);
    setDeadline(null);
    setDescription('');
    setFile(null);
    setFilePreviewUrl(null); // Clear file preview URL
    setIsEditMode(false);
    setSelectedSubmittable(null);
    setPageMode('create'); // Reset to create mode
  };

  // Edit submittable - update to set page mode and fetch complete details
  const handleEditSubmittable = async (submittable: Submittable) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }
      
      // Fetch complete submittable details to ensure we have all file information
      const response = await axios.get(
        `http://localhost:8000/submittables/${submittable.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        }
      );
      
      const completeSubmittable = response.data;
      
      // Set submittable with complete data
      setSelectedSubmittable({
        ...submittable,
        file_url: completeSubmittable.reference_file?.file_url || null,
        original_filename: completeSubmittable.reference_file?.original_filename || null
      });
      
      setTitle(submittable.title);
      setOpensAt(submittable.opens_at ? dayjs(submittable.opens_at) : null);
      setDeadline(dayjs(submittable.deadline));
      setDescription(submittable.description);
      setIsEditMode(true);
      setPageMode('update');
      
      // Scroll to top to show update interface
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error fetching submittable details:', error);
      showSnackbar('Error loading submittable details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete submittable
  const handleDeleteSubmittable = (submittableId: number) => {
    setSubmittableToDelete(submittableId);
    setIsDeleteConfirmationOpen(true);
  };

  // Confirm delete submittable
  const confirmDeleteSubmittable = async () => {
    if (submittableToDelete !== null) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          showSnackbar('Authentication token not found. Please log in again.', 'error');
          setIsLoading(false);
          return;
        }

        await axios.delete(
          `http://localhost:8000/submittables/${submittableToDelete}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'accept': 'application/json'
            }
          }
        );
        
        showSnackbar('Submittable deleted successfully', 'success');
        fetchSubmittables();
      } catch (error: any) {
        console.error('Error deleting submittable:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        const errorMessage = error.response?.data?.detail || 'Failed to delete submittable';
        showSnackbar(errorMessage, 'error');
      } finally {
        setIsLoading(false);
        setIsDeleteConfirmationOpen(false);
        setSubmittableToDelete(null);
      }
    }
  };

  // Cancel delete
  const cancelDeleteSubmittable = () => {
    setIsDeleteConfirmationOpen(false);
    setSubmittableToDelete(null);
  };

  // Download reference file with improved error handling
  const handleDownloadFile = async (submittable: Submittable) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please log in again.', 'error');
        return;
      }

      showSnackbar('Downloading file...', 'info');
      
      const response = await axios.get(
        `/submittables/${submittable.id}/reference-files/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      // Create a blob with the correct type
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', submittable.original_filename || 'reference_file');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      showSnackbar('File downloaded successfully!', 'success');
      
    } catch (error: any) {
      console.error('Error downloading file:', error);
      let errorMessage = 'Failed to download file';
      
      if (error.response?.status === 404) {
        errorMessage = 'File not found on the server.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to download this file.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  // Show snackbar notification
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {pageMode === 'update' ? 'Update Submittable' : 'Create New Submittable'}
          </Typography>

          {pageMode === 'update' && selectedSubmittable && (
            <Card 
              variant="outlined" 
              sx={{ 
                mb: 3, 
                bgcolor: 'background.paper', 
                borderLeft: 4, 
                borderColor: 'primary.main',
                boxShadow: 1
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Editing: {selectedSubmittable.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due on: {new Date(selectedSubmittable.deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip 
                    label="Update Mode" 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '& .MuiChip-label': {
                        fontWeight: 'bold',
                      }
                    }}
                  />
                </Box>

                {selectedSubmittable.original_filename || selectedSubmittable.file_url ? (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 1.5, 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2">
                      Current reference file: <strong>{selectedSubmittable.original_filename}</strong>
                    </Typography>
                    <Button 
                      startIcon={<FileDownload />}
                      variant="outlined" 
                      size="small"
                      onClick={() => handleDownloadFile(selectedSubmittable)}
                      sx={{ ml: 2 }}
                    >
                      Download
                    </Button>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 1.5, 
                      bgcolor: 'action.disabledBackground',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'action.disabled'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" align="center">
                      No reference file currently attached to this submittable.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  required
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={6}>
                <DatePicker
                  label="Opens At (Optional)"
                  value={opensAt}
                  onChange={(newValue) => setOpensAt(newValue)}
                  slots={{
                    textField: (params) => <TextField fullWidth {...params} disabled={isLoading} />
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <DatePicker
                  label="Deadline"
                  value={deadline}
                  onChange={(newValue) => setDeadline(newValue)}
                  slots={{
                    textField: (params) => <TextField fullWidth {...params} required disabled={isLoading} />
                  }}
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
                  required
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    border: '1px dashed', 
                    borderColor: 'divider', 
                    p: 2, 
                    borderRadius: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {isEditMode ? "Reference File" : "Upload Reference File"}
                  </Typography>
                  
                  {isEditMode && (selectedSubmittable?.original_filename || selectedSubmittable?.file_url) && !file && (
                    <Box sx={{ 
                      my: 1, 
                      p: 1, 
                      bgcolor: 'action.hover', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FileDownload fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Using current file: <strong>{selectedSubmittable.original_filename}</strong>
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDownloadFile(selectedSubmittable)}
                      >
                        Download
                      </Button>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      component="label"
                      fullWidth
                      disabled={isLoading}
                      sx={{ mt: 1 }}
                    >
                      {isEditMode ? 
                        (file ? "Change Selected File" : "Replace Reference File") : 
                        "Upload Reference File"}
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      />
                    </Button>
                    
                    {file && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ mt: 1 }}
                        onClick={handleClearFile}
                        disabled={isLoading}
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                  
                  {file && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 1, 
                      bgcolor: 'success.light', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="body2" sx={{ color: 'success.contrastText' }}>
                        {isEditMode ? 'Replacement file: ' : 'Selected file: '} 
                        <strong>{file.name}</strong>
                      </Typography>
                      {filePreviewUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ 
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.default' }
                          }}
                          onClick={previewFile}
                        >
                          Preview
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    {pageMode === 'update' ? 'Cancel Update' : 'Cancel'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handlePublishSubmittable}
                    disabled={isLoading}
                  >
                    {pageMode === 'update' ? "Update Submittable" : "Publish Submittable"}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h5" component="h2" gutterBottom>
            Existing Submittables
          </Typography>

          <Paper elevation={3} sx={{ p: 2 }}>
            {submittables.length === 0 ? (
              <Typography variant="body1">No submittables created yet</Typography>
            ) : (
              <List>
                {submittables.map((submittable) => (
                  <ListItem 
                    key={submittable.id} 
                    divider
                    secondaryAction={
                      <>
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          sx={{ mr: 1 }}
                          onClick={() => handleEditSubmittable(submittable)}
                          disabled={isLoading}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteSubmittable(submittable.id)}
                          disabled={isLoading}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={submittable.title}
                      secondary={`Opens: ${submittable.opens_at ? new Date(submittable.opens_at).toLocaleDateString() : 'N/A'} | Due: ${new Date(submittable.deadline).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Submittable Details Dialog with improved file display */}
          <Dialog 
            open={isDetailsOpen} 
            onClose={() => setIsDetailsOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Submittable Details</DialogTitle>
            <DialogContent>
              {selectedSubmittable && (
                <>
                  <Typography variant="h6">Title: {selectedSubmittable.title}</Typography>
                  {selectedSubmittable.opens_at && (
                    <Typography variant="body1">
                      Opens At: {new Date(selectedSubmittable.opens_at).toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    Deadline: {new Date(selectedSubmittable.deadline).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>Description:</Typography>
                  <Typography variant="body2" paragraph>{selectedSubmittable.description}</Typography>
                  
                  {selectedSubmittable.original_filename ? (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        p: 1.5, 
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FileDownload fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Reference File: <strong>{selectedSubmittable.original_filename}</strong>
                        </Typography>
                      </Box>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleDownloadFile(selectedSubmittable)}
                      >
                        Download
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No reference file attached to this submittable.
                    </Typography>
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
                The opening date must be before or equal to the deadline. 
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
            onClose={cancelDeleteSubmittable}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this submittable? 
                This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={cancelDeleteSubmittable} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteSubmittable} 
                color="secondary" 
                variant="contained"
                disabled={isLoading}
              >
                Delete
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
      </Container>
    </LocalizationProvider>
  );
};

export default SubmittableCreationApp;