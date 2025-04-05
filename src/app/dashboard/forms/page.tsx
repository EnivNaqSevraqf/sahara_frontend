'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Collapse,
  Card,
  CardContent,
  CardActions,
  IconButton
} from "@mui/material";
import { useRouter } from "next/navigation";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { currentConfig } from '@/config';
import TimelineIcon from '@mui/icons-material/Timeline';

interface Form {
  id: string;
  form_name: string;
  deadline: string;
  score: string;
  deadline_passed: boolean;
  attempt: boolean;
  description?: string; // Optional field for form description
}

export default function FormPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [role, setRole] = useState<string>('student');
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const payload = {
    user_id: "123",
  }

  useEffect(() => {
    fetchForms();
    // Get user role from localStorage
    const userRole = localStorage.getItem('role');
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    // Calculate completion percentage based on attempted forms
    const totalForms = forms.length;
    const completedForms = forms.filter(form => !form.attempt).length;
    const percentage = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
    setCompletionPercentage(percentage);
  }, [forms]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json',
        }
      };
      const response = await axios.post(`${currentConfig.apiBaseUrl}/api/get_forms`, payload, config);
      setForms(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching Forms:', error);
      setError('Failed to fetch forms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClick = (formId: string) => {
    router.push(`/dashboard/forms/${formId}`);
  };

  const handleExpandClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ", " + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Split forms into categories
  const ongoingForms = forms.filter(form => !form.deadline_passed);
  const pastForms = forms.filter(form => form.deadline_passed);

  // Render a single form item
  const renderFormItem = (form: Form) => {
    const isExpanded = expandedId === form.id;
    const isDeadlinePassed = form.deadline_passed;
    const isAttempted = !form.attempt;
    
    return (
      <Card 
        key={form.id} 
        sx={{ 
          mb: 2,
          borderLeft: 4,
          borderColor: isAttempted ? 'success.main' : isDeadlinePassed ? 'error.main' : 'primary.main'
        }}
      >
        <CardContent 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          onClick={() => handleExpandClick(form.id)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label="Form" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 2 }} 
              />
              <Typography variant="h6" component="div">
                {form.form_name}
              </Typography>
            </Box>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Deadline: {formatDate(form.deadline)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Score: {form.score}
            </Typography>
          </Box>
        </CardContent>

        <Collapse in={isExpanded}>
          <CardContent>
            {form.description && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {form.description}
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              {isAttempted && (
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  You have already attempted this form.
                </Typography>
              )}
              {(isDeadlinePassed && !isAttempted) && (
                <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  The deadline for this form has passed.
                </Typography>
              )}
            </Box>
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            {(!isDeadlinePassed && !isAttempted) && (
              <Button
                variant="contained"
                // color="primary"
                startIcon={<AssignmentIcon />}
                onClick={() => handleFormClick(form.id)}
              >
                Attempt
              </Button>
            )}
            {isAttempted && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleFormClick(form.id)}
              >
                View Attempt
              </Button>
            )}
            {(isDeadlinePassed && !isAttempted) && (
              <Button
                variant="outlined"
                color="error"
                disabled
              >
                Deadline Passed
              </Button>
            )}
          </CardActions>
        </Collapse>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Course navigation with Create Form button */}
      <Box sx={{ 
        mb: 3, 
        pb: 1, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="body2" component="div">
          <span style={{ color: '#3f51b5', cursor: 'pointer' }}>Course Home</span> / 
          <span style={{ cursor: 'pointer' }}> Forms</span>
        </Typography>

        {(role === 'prof' || role === 'admin') && (
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard/forms/create_form')}
            sx={{
              backgroundColor: '#033076',
              '&:hover': {
                backgroundColor: '#022055',
              },
              textTransform: 'none',
              px: 3
            }}
          >
            Create Form
          </Button>
        )}
      </Box>
      
      {/* Progress chart */}
      <Paper 
        elevation={3} 
        sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
            <CircularProgress 
              variant="determinate" 
              value={completionPercentage} 
              size={80} 
              thickness={4} 
              color="primary" 
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" component="div" color="text.secondary">
                {`${completionPercentage}%`}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              Forms Progress
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {forms.filter(form => !form.attempt).length} of {forms.length} forms completed
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="body2" color={completionPercentage === 100 ? 'success.main' : 'info.main'}>
            {completionPercentage === 100 
              ? 'All forms completed!' 
              : `${forms.length - forms.filter(form => !form.attempt).length} forms remaining`}
          </Typography>
        </Box>
      </Paper>

      {/* Ongoing Forms */}
      {ongoingForms.length > 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Active Forms
          </Typography>
          
          {ongoingForms.map(form => renderFormItem(form))}
        </>
      )}
      
      {/* Past Forms */}
      {pastForms.length > 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
            Past Forms
          </Typography>
          
          {pastForms.map(form => renderFormItem(form))}
        </>
      )}

      {/* Snackbar for notifications */}
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
}
