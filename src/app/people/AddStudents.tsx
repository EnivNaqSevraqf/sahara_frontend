'use client';
import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Input,
  IconButton,
  Alert,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Header from './components/Header';
import { buttonStyles } from './constants/theme';

const AddStudents = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please select a CSV file');
        event.target.value = ''; // Reset input
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header title="ADD STUDENTS" />

      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{
          mb: 4,
          p: 2,
          border: '1px solid #e0e0e0',
          borderRadius: '50px',
        }}
      >
        ADD STUDENTS
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Paper
          sx={{
            width: '100%',
            maxWidth: '600px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
          }}
        >
          <Input
            placeholder="Attach .csv file"
            fullWidth
            disableUnderline
            sx={{ px: 2 }}
            value={selectedFile ? selectedFile.name : ''}
            readOnly
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            style={{ display: 'none' }}
          />
          <IconButton
            onClick={handleAttachClick}
            sx={{
              ...buttonStyles.secondary,
              borderRadius: '4px',
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </Paper>

        {selectedFile && (
          <Alert 
            severity="success" 
            sx={{ 
              width: '100%', 
              maxWidth: '600px',
            }}
          >
            Successfully selected file: {selectedFile.name}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AddStudents; 