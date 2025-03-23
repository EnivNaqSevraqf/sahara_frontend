'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Divider,
  Grid,
  Chip,
  IconButton,
  TextField
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface DocumentType {
  id: number;
  name: string;
  dueDate: Date;
  openDate?: Date;  // Made openDate optional
  uploadedFile: File | null;
  uploadedOn: Date | null;
}

const DocumentSubmissionList: React.FC = () => {
  const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const [documents, setDocuments] = useState<DocumentType[]>([
    { id: 1, name: 'Requirement Document', openDate: new Date('2025-01-10'), dueDate: new Date('2025-01-24'), uploadedFile: null, uploadedOn: null },
    { id: 2, name: 'Design Document', dueDate: new Date('2025-02-07'), uploadedFile: null, uploadedOn: null }, // No openDate
    { id: 3, name: 'Implementation Document', openDate: new Date('2025-03-14'), dueDate: new Date('2025-03-28'), uploadedFile: null, uploadedOn: null },
    { id: 4, name: 'Test Document & User Manual', dueDate: new Date('2025-04-04'), uploadedFile: null, uploadedOn: null }, // No openDate
    { id: 5, name: 'Beta Test Report', openDate: new Date('2025-03-30'), dueDate: new Date('2025-04-13'), uploadedFile: null, uploadedOn: null },
    { id: 6, name: 'Final Project Report', dueDate: new Date('2025-04-23'), uploadedFile: null, uploadedOn: null }, // No openDate
  ]);

  const handleUploadClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFile = event.target.files[0];
      
      const updatedDocuments = [...documents];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        uploadedFile: newFile,
        uploadedOn: new Date()
      };
      
      setDocuments(updatedDocuments);
    }
  };

  const handleDelete = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      uploadedFile: null,
      uploadedOn: null
    };
    
    setDocuments(updatedDocuments);
  };

  const isSubmissionAllowed = (doc: DocumentType) => {
    const today = new Date();
    // If openDate is not provided, only check if due date hasn't passed
    return doc.openDate ? (today >= doc.openDate && today <= doc.dueDate) : (today <= doc.dueDate);
  };

  const isUpcoming = (doc: DocumentType) => {
    // If no openDate, document is not considered upcoming
    if (!doc.openDate) return false;
    
    const today = new Date();
    return today < doc.openDate;
  };

  const isPast = (doc: DocumentType) => {
    const today = new Date();
    return today > doc.dueDate;
  };

  const formatDate = (date: Date) => {
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

  // Split documents into upcoming, ongoing, and previous
  const ongoingDocuments = documents.filter(doc => isSubmissionAllowed(doc));
  const upcomingDocuments = documents.filter(doc => isUpcoming(doc));
  const previousDocuments = documents.filter(doc => isPast(doc));

  // Render a single document item
  const renderDocumentItem = (doc: DocumentType, index: number) => {
    const isAllowed = isSubmissionAllowed(doc);
    const docIndex = documents.findIndex(d => d.id === doc.id);
    
    return (
      <Paper 
        key={doc.id} 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderLeft: 4, 
          borderColor: doc.uploadedFile ? 'success.main' : isAllowed ? 'primary.main' : 'text.disabled'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label="Document" 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 2 }} 
              />
              <Typography variant="h6" component="div">
                {doc.name}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              {/* Only display 'Opens at' if openDate is provided */}
              {doc.openDate && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Opens at: {formatDate(doc.openDate)}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                Due on: {formatDate(doc.dueDate)}
              </Typography>
            </Box>
            
            {doc.uploadedFile && doc.uploadedOn && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Uploaded: {formatDate(doc.uploadedOn)} - {doc.uploadedFile.name}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <input
              type="file"
              ref={(el) => { fileInputRefs.current[docIndex] = el; }}
              onChange={(e) => handleFileChange(e, docIndex)}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            {doc.uploadedFile ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(docIndex)}
                disabled={!isAllowed}
                sx={{ ml: 1 }}
              >
                Remove
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AttachFileIcon />}
                onClick={() => handleUploadClick(docIndex)}
                disabled={!isAllowed}
              >
                Upload Document
              </Button>
            )}
            
            {/* {doc.uploadedFile && isAllowed && (
              <Button
                variant="contained"
                color="success"
                sx={{ ml: 1 }}
              >
                Submit
              </Button>
            )} */}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Course navigation */}
      <Box sx={{ mb: 3, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" component="div">
          <span style={{ color: '#3f51b5', cursor: 'pointer' }}>Course Home</span> / 
          <span style={{ cursor: 'pointer' }}> Documents</span>
        </Typography>
      </Box>
      
      {/* Ongoing/Upcoming Documents */}
      {(ongoingDocuments.length > 0 || upcomingDocuments.length > 0) && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Ongoing/Upcoming Documents
          </Typography>
          
          {ongoingDocuments.map((doc, index) => renderDocumentItem(doc, index))}
          {upcomingDocuments.map((doc, index) => renderDocumentItem(doc, index))}
        </>
      )}
      
      {/* Previous Documents */}
      {previousDocuments.length > 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
            Previous Documents
          </Typography>
          
          {previousDocuments.map((doc, index) => renderDocumentItem(doc, index))}
        </>
      )}
    </Box>
  );
};

export default DocumentSubmissionList;