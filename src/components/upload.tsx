'use client';

import React from 'react';
import { Button } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';


interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(event.target.files[0]);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt"
      />
      <Button
        variant="contained"
        startIcon={<AttachFileIcon />}
        onClick={handleUploadClick}
        disabled={disabled}
      >
        Upload Document
      </Button>
    </>
  );
};

export default FileUploadButton;
